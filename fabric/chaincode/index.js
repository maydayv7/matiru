"use strict";

const { Contract } = require("fabric-contract-api");

class ProduceContract extends Contract {
  // Utilities
  async _getState(ctx, id) {
    const data = await ctx.stub.getState(id);
    if (!data || data.length === 0) {
      throw new Error(`Asset ${id} does not exist`);
    }
    return JSON.parse(data.toString());
  }

  async _putState(ctx, id, obj) {
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(obj)));
  }

  // Deterministic timestamp from tx context
  _txTimestampISO(ctx) {
    const ts = ctx.stub.getTxTimestamp();
    // ts.seconds may be a Long object in some environments
    const seconds =
      typeof ts.seconds === "object" &&
      typeof ts.seconds.toNumber === "function"
        ? ts.seconds.toNumber()
        : Number(ts.seconds);
    const millis = seconds * 1000 + Math.floor((ts.nanos || 0) / 1e6);
    return new Date(millis).toISOString();
  }

  // Deterministic action item
  _actionItem(ctx, action, location, owner, meta) {
    return {
      timestamp: this._txTimestampISO(ctx),
      action,
      currentLocation: location || "",
      currentOwner: owner || "",
      meta: meta || {},
    };
  }

  // Find user state by ID
  async _findUserKeyById(ctx, id) {
    if (!id) return null;
    const roles = ["FARMER", "DISTRIBUTOR", "RETAILER", "INSPECTOR"];
    for (const r of roles) {
      const key = `${r}-${id}`;
      const data = await ctx.stub.getState(key);
      if (data && data.length > 0) return key;
    }
    return null;
  }

  async _getUserById(ctx, id) {
    const key = await this._findUserKeyById(ctx, id);
    if (!key) return null;
    const data = await ctx.stub.getState(key);
    if (!data || data.length === 0) return null;
    return { key, user: JSON.parse(data.toString()) };
  }

  async _addOwnedProduceToUser(ctx, userKey, userObj, produceId) {
    userObj.ownedProduce = userObj.ownedProduce || [];
    if (!userObj.ownedProduce.includes(produceId)) {
      userObj.ownedProduce.push(produceId);
      await this._putState(ctx, userKey, userObj);
    }
  }

  async _removeOwnedProduceFromUser(ctx, userKey, userObj, produceId) {
    userObj.ownedProduce = userObj.ownedProduce || [];
    const idx = userObj.ownedProduce.indexOf(produceId);
    if (idx >= 0) {
      userObj.ownedProduce.splice(idx, 1);
      await this._putState(ctx, userKey, userObj);
    }
  }

  // Initialize ledger
  async initLedger(ctx) {
    console.info("Ledger initialized");
  }

  // Functions
  // Produce Registration
  async registerProduce(ctx, farmerId, detailsStr) {
    const clientMspId = ctx.clientIdentity.getMSPID();
    if (clientMspId !== "Org1MSP") {
      throw new Error(
        `Client from ${clientMspId} is not authorized to register produce. Only Org1MSP is allowed.`
      );
    }

    const farmerKey = `FARMER-${farmerId}`;
    const farmerState = await ctx.stub.getState(farmerKey);
    if (!farmerState || farmerState.length === 0)
      throw new Error(`Farmer ${farmerId} is not registered`);
    const farmer = JSON.parse(farmerState.toString());

    const details = JSON.parse(detailsStr || "{}");
    const txId = ctx.stub.getTxID();
    const now = this._txTimestampISO(ctx);

    const id = `PRODUCE-${txId}`;
    const produce = {
      id,
      parentId: null,
      children: [],
      qty: details.qty || 0,
      qtyUnit: details.qtyUnit || "KG",
      pricePerUnit: details.pricePerUnit || 0,
      totalPrice: (details.pricePerUnit || 0) * (details.qty || 0),
      currentOwner: farmerId,
      currentLocation: details.location || "",
      actionHistory: [],
      saleHistory: [],
      cropType: details.cropType || "",
      harvestDate: details.harvestDate || now,
      quality: details.quality || null,
      expiryDate: details.expiryDate || null,
      storageConditions: details.storageConditions || [],
      imageUrl: details.imageUrl || null,
      certification: details.certification || farmer.certification || [],
      status: "Harvested",
      isAvailable: true,
      notAvailableReason: null,
    };

    produce.actionHistory.push(
      this._actionItem(ctx, "REGISTER", produce.currentLocation, farmerId, {
        note: details.note || "",
      })
    );
    await this._putState(ctx, id, produce);

    const farmerObj = farmer;
    farmerObj.registeredProduce = farmerObj.registeredProduce || [];
    if (!farmerObj.registeredProduce.includes(id))
      farmerObj.registeredProduce.push(id);
    farmerObj.ownedProduce = farmerObj.ownedProduce || [];
    if (!farmerObj.ownedProduce.includes(id)) farmerObj.ownedProduce.push(id);
    await this._putState(ctx, farmerKey, farmerObj);

    return produce;
  }

  // Update location
  async updateLocation(ctx, produceId, actorId, newLocation) {
    const produce = await this._getState(ctx, produceId);
    if (newLocation === "In Transit") produce.status = "In Transit";
    else {
      produce.currentLocation = newLocation;
      if (produce.status === "Harvested") produce.status = "In Transit";
    }

    produce.actionHistory.push(
      this._actionItem(ctx, "MOVE", produce.currentLocation, actorId, {})
    );
    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // Mark as unavailable due to some reason
  async markAsUnavailable(ctx, produceId, actorId, reason, newStatus) {
    const produce = await this._getState(ctx, produceId);
    produce.isAvailable = false;
    produce.notAvailableReason = reason || "";
    produce.status = newStatus || "Removed";
    produce.actionHistory.push(
      this._actionItem(ctx, "REMOVED", produce.currentLocation, actorId, {
        reason,
      })
    );
    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // Produce Inspection
  async inspectProduce(ctx, produceId, inspectorId, qualityUpdateStr) {
    const clientMspId = ctx.clientIdentity.getMSPID();
    if (clientMspId !== "Org4MSP") {
      throw new Error(
        `Client from ${clientMspId} is not authorized to inspect produce. Only Org4MSP is allowed.`
      );
    }

    const qualityUpdate = JSON.parse(qualityUpdateStr || "{}");
    const produce = await this._getState(ctx, produceId);

    if (qualityUpdate.quality !== undefined)
      produce.quality = qualityUpdate.quality;
    if (qualityUpdate.expiryDate !== undefined)
      produce.expiryDate = qualityUpdate.expiryDate;
    if (qualityUpdate.storageConditions !== undefined)
      produce.storageConditions = qualityUpdate.storageConditions;

    produce.actionHistory.push(
      this._actionItem(
        ctx,
        "INSPECT",
        produce.currentLocation,
        inspectorId,
        qualityUpdate
      )
    );

    if (qualityUpdate.failed === true) {
      produce.isAvailable = false;
      produce.notAvailableReason = qualityUpdate.reason || "Failed Inspection";
      produce.status = "Failed Inspection";
      produce.actionHistory.push(
        this._actionItem(ctx, "REMOVED", produce.currentLocation, inspectorId, {
          reason: produce.notAvailableReason,
        })
      );
    }

    await this._putState(ctx, produceId, produce);

    const inspectorKey = `INSPECTOR-${inspectorId}`;
    const inspectorState = await ctx.stub.getState(inspectorKey);
    if (inspectorState && inspectorState.length > 0) {
      const inspectorObj = JSON.parse(inspectorState.toString());
      inspectorObj.inspectedProduce = inspectorObj.inspectedProduce || [];
      if (!inspectorObj.inspectedProduce.includes(produceId)) {
        inspectorObj.inspectedProduce.push(produceId);
        await this._putState(ctx, inspectorKey, inspectorObj);
      }
    }

    return produce;
  }

  // Update added details
  async updateDetails(ctx, produceId, actorId, detailsStr) {
    const details = JSON.parse(detailsStr || "{}");
    const produce = await this._getState(ctx, produceId);

    if (produce.currentOwner !== actorId)
      throw new Error("Only current owner can update details");

    if (details.pricePerUnit !== undefined)
      produce.pricePerUnit = details.pricePerUnit;
    if (details.storageConditions !== undefined)
      produce.storageConditions = details.storageConditions;
    if (details.imageUrl !== undefined) produce.imageUrl = details.imageUrl;
    if (details.certification !== undefined)
      produce.certification = details.certification;

    produce.totalPrice = (produce.pricePerUnit || 0) * (produce.qty || 0);

    produce.actionHistory.push(
      this._actionItem(
        ctx,
        "UPDATED",
        produce.currentLocation,
        actorId,
        details
      )
    );
    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // Split into smaller batches
  async splitProduce(ctx, produceId, qtyStr, ownerId) {
    const qty = parseFloat(qtyStr);
    const produce = await this._getState(ctx, produceId);

    if (produce.currentOwner !== ownerId)
      throw new Error("Only current owner can split produce");
    if (qty <= 0 || qty > produce.qty)
      throw new Error("Invalid quantity to split");

    produce.qty -= qty;
    produce.totalPrice = (produce.pricePerUnit || 0) * produce.qty;

    const childId = `${produce.id}-${ctx.stub.getTxID()}-CHILD`;
    const child = JSON.parse(JSON.stringify(produce));
    child.id = childId;
    child.parentId = produce.id;
    child.children = [];
    child.qty = qty;
    child.totalPrice = (child.pricePerUnit || 0) * qty;
    child.actionHistory = [];
    child.actionHistory.push(
      this._actionItem(ctx, "SPLIT", produce.currentLocation, ownerId, { qty })
    );

    produce.children = produce.children || [];
    produce.children.push(childId);
    produce.actionHistory.push(
      this._actionItem(ctx, "SPLIT", produce.currentLocation, ownerId, {
        createdChild: childId,
        qty,
      })
    );

    await this._putState(ctx, produce.id, produce);
    await this._putState(ctx, childId, child);

    const ownerRes = await this._getUserById(ctx, ownerId);
    if (ownerRes) {
      await this._addOwnedProduceToUser(
        ctx,
        ownerRes.key,
        ownerRes.user,
        childId
      );
    }

    return { parent: produce, child };
  }

  // Transfer ownership
  async transferOwnership(ctx, produceId, newOwnerId, qtyStr, salePriceStr) {
    const qty = parseFloat(qtyStr);
    const salePrice = parseFloat(salePriceStr);
    const produce = await this._getState(ctx, produceId);
    const now = this._txTimestampISO(ctx);
    const currentOwner = produce.currentOwner;

    if (!produce.isAvailable) throw new Error("Asset not available");
    if (qty <= 0 || qty > produce.qty) throw new Error("Invalid qty");

    let resultAssetId = produceId;
    if (qty < produce.qty) {
      // Partial Transfer
      const splitRes = await this.splitProduce(
        ctx,
        produceId,
        "" + qty,
        produce.currentOwner
      );
      const child = splitRes.child;
      child.currentOwner = newOwnerId;
      child.actionHistory.push(
        this._actionItem(ctx, "SALE", child.currentLocation, newOwnerId, {
          qty,
          salePrice,
        })
      );
      child.saleHistory = child.saleHistory || [];
      child.saleHistory.push({
        timestamp: now,
        prevOwner: currentOwner,
        newOwner: newOwnerId,
        salePrice,
        qtyBought: qty,
        paymentStatus: "PENDING",
      });
      await this._putState(ctx, child.id, child);
      resultAssetId = child.id;

      const prevOwnerRes = await this._getUserById(ctx, currentOwner);
      if (prevOwnerRes) {
        await this._removeOwnedProduceFromUser(
          ctx,
          prevOwnerRes.key,
          prevOwnerRes.user,
          child.id
        );
      }

      const newOwnerRes = await this._getUserById(ctx, newOwnerId);
      if (newOwnerRes) {
        await this._addOwnedProduceToUser(
          ctx,
          newOwnerRes.key,
          newOwnerRes.user,
          child.id
        );
      }
    } else {
      // Full Transfer
      produce.currentOwner = newOwnerId;
      produce.actionHistory.push(
        this._actionItem(ctx, "SALE", produce.currentLocation, newOwnerId, {
          qty,
          salePrice,
        })
      );
      produce.saleHistory = produce.saleHistory || [];
      produce.saleHistory.push({
        timestamp: now,
        prevOwner: currentOwner,
        newOwner: newOwnerId,
        salePrice,
        qtyBought: qty,
        paymentStatus: "PENDING",
      });
      await this._putState(ctx, produceId, produce);
      resultAssetId = produceId;

      const prevOwnerRes = await this._getUserById(ctx, currentOwner);
      if (prevOwnerRes) {
        await this._removeOwnedProduceFromUser(
          ctx,
          prevOwnerRes.key,
          prevOwnerRes.user,
          produceId
        );
      }

      const newOwnerRes = await this._getUserById(ctx, newOwnerId);
      if (newOwnerRes) {
        await this._addOwnedProduceToUser(
          ctx,
          newOwnerRes.key,
          newOwnerRes.user,
          produceId
        );
      }
    }

    return { newAssetId: resultAssetId };
  }

  // Record payment for transfer
  async recordPayment(
    ctx,
    produceId,
    transactionId,
    paymentStatus,
    paymentMethod,
    paymentRef
  ) {
    const produce = await this._getState(ctx, produceId);
    const now = this._txTimestampISO(ctx);

    produce.saleHistory = produce.saleHistory || [];
    if (produce.saleHistory.length === 0) {
      produce.saleHistory.push({
        timestamp: now,
        prevOwner: null,
        newOwner: produce.currentOwner,
        salePrice: produce.totalPrice,
        qtyBought: produce.qty,
        paymentStatus,
      });
    } else {
      const last = produce.saleHistory[produce.saleHistory.length - 1];
      last.paymentStatus = paymentStatus;
      last.paymentMethod = paymentMethod;
      last.paymentRef = paymentRef || transactionId;
    }

    produce.paymentStatus = paymentStatus;
    produce.paymentMethod = paymentMethod;
    produce.paymentRef = paymentRef || transactionId;

    produce.actionHistory.push(
      this._actionItem(
        ctx,
        "PAYMENT",
        produce.currentLocation,
        produce.currentOwner,
        {
          transactionId,
          paymentStatus,
          paymentMethod,
          paymentRef,
        }
      )
    );

    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // Queries
  async getProduceById(ctx, produceId) {
    return await this._getState(ctx, produceId);
  }

  async getProduceByOwner(ctx, ownerId) {
    const iterator = await ctx.stub.getStateByRange("", "");
    const results = [];
    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.key) {
        if (res.value.key.startsWith("PRODUCE-")) {
          const obj = JSON.parse(res.value.value.toString("utf8"));
          if (obj.currentOwner === ownerId) results.push(obj);
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }
    return results;
  }

  // Governance
  async registerUser(ctx, role, detailsStr) {
    const clientMspId = ctx.clientIdentity.getMSPID();
    const details = JSON.parse(detailsStr || "{}");
    const roleUpper = role.toUpperCase();

    const roleToOrgMap = {
      FARMER: "Org1MSP",
      DISTRIBUTOR: "Org2MSP",
      RETAILER: "Org3MSP",
      INSPECTOR: "Org4MSP",
    };

    const expectedMspId = roleToOrgMap[roleUpper];
    if (!expectedMspId || clientMspId !== expectedMspId)
      throw new Error(
        `Client from ${clientMspId} cannot register a ${role}. Expected admin from ${expectedMspId}.`
      );

    const id = details.id || `USER-${ctx.stub.getTxID()}`;
    const key = `${roleUpper}-${id}`;

    const base = {
      role,
      id,
      name: details.name || "",
      location: details.location || "",
      walletId: details.walletId || "",
    };

    let user = null;
    if (roleUpper === "FARMER") {
      user = {
        ...base,
        registeredProduce: details.registeredProduce || [],
        ownedProduce: details.ownedProduce || [],
        certification: details.certification || [],
      };
    } else if (roleUpper === "DISTRIBUTOR" || roleUpper === "RETAILER") {
      user = {
        ...base,
        ownedProduce: details.ownedProduce || [],
      };
    } else if (roleUpper === "INSPECTOR") {
      user = {
        ...base,
        inspectedProduce: details.inspectedProduce || [],
      };
    }

    await this._putState(ctx, key, user);
    return user;
  }

  async getUserDetails(ctx, userKey) {
    const data = await ctx.stub.getState(userKey);
    if (!data || data.length === 0)
      throw new Error(`User ${userKey} not found`);
    return JSON.parse(data.toString());
  }

  async updateUser(ctx, userKey, detailsStr) {
    const data = await ctx.stub.getState(userKey);
    if (!data || data.length === 0)
      throw new Error(`User ${userKey} not found`);
    const user = JSON.parse(data.toString());
    const details = JSON.parse(detailsStr || "{}");
    Object.assign(user, details);
    await this._putState(ctx, userKey, user);
    return user;
  }
}

module.exports.contracts = [ProduceContract];
