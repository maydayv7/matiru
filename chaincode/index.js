"use strict";

const { Contract } = require("fabric-contract-api");
const { v4: uuidv4 } = require("uuid");

class ProduceContract extends Contract {
  // Helper: throw if missing
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

  // Utility: create action item
  _actionItem(action, location, owner, meta) {
    return {
      timestamp: new Date().toISOString(),
      action,
      currentLocation: location || "",
      currentOwner: owner || "",
      meta: meta || {},
    };
  }

  // Initialize ledger (optional)
  async initLedger(ctx) {
    console.info("Ledger initialized");
  }

  // 1. registerProduce(farmerId, details)
  async registerProduce(ctx, farmerId, detailsStr) {
    const details = JSON.parse(detailsStr);
    const id = `PRODUCE-${uuidv4()}`;
    const now = new Date().toISOString();

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
      status: "Harvested",
      isAvailable: true,
      notAvailableReason: null,
    };

    produce.actionHistory.push(
      this._actionItem("REGISTER", produce.currentLocation, farmerId, {
        note: details.note || "",
      })
    );

    // Save produce
    await this._putState(ctx, id, produce);

    // Update farmer profile (simple)
    const farmerKey = `FARMER-${farmerId}`;
    let farmer = {};
    const farmerState = await ctx.stub.getState(farmerKey);
    if (farmerState && farmerState.length)
      farmer = JSON.parse(farmerState.toString());
    farmer.role = "Farmer";
    farmer.id = farmerId;
    farmer.name = farmer.name || details.farmerName || "";
    farmer.registeredProduce = farmer.registeredProduce || [];
    farmer.registeredProduce.push(id);
    await ctx.stub.putState(farmerKey, Buffer.from(JSON.stringify(farmer)));

    return produce;
  }

  // 2. updateLocation(produceId, actorId, inTransitOrNewLocation)
  async updateLocation(ctx, produceId, actorId, newLocationOrInTransit) {
    const produce = await this._getState(ctx, produceId);
    const now = new Date().toISOString();

    if (newLocationOrInTransit === "In Transit") {
      produce.status = "In Transit";
    } else {
      produce.currentLocation = newLocationOrInTransit;
      if (produce.status === "Harvested") produce.status = "In Transit";
    }

    produce.actionHistory.push(
      this._actionItem("MOVE", produce.currentLocation, actorId, {})
    );
    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // 3. markAsUnavailable(produceId, actorId, reason, newStatus)
  async markAsUnavailable(ctx, produceId, actorId, reason, newStatus) {
    const produce = await this._getState(ctx, produceId);
    produce.isAvailable = false;
    produce.notAvailableReason = reason || "";
    produce.status = newStatus || "Removed";
    produce.actionHistory.push(
      this._actionItem("REMOVED", produce.currentLocation, actorId, { reason })
    );
    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // 4. inspectProduce(produceId, inspectorId, qualityUpdate)
  async inspectProduce(ctx, produceId, inspectorId, qualityUpdateStr) {
    const qualityUpdate = JSON.parse(qualityUpdateStr);
    const produce = await this._getState(ctx, produceId);

    if (qualityUpdate.quality !== undefined)
      produce.quality = qualityUpdate.quality;
    if (qualityUpdate.expiryDate !== undefined)
      produce.expiryDate = qualityUpdate.expiryDate;
    if (qualityUpdate.storageConditions !== undefined)
      produce.storageConditions = qualityUpdate.storageConditions;

    produce.actionHistory.push(
      this._actionItem(
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
        this._actionItem("REMOVED", produce.currentLocation, inspectorId, {
          reason: produce.notAvailableReason,
        })
      );
    }

    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // 5. updateDetails(produceId, actorId, details) -> Only 'currentOwner'
  async updateDetails(ctx, produceId, actorId, detailsStr) {
    const details = JSON.parse(detailsStr);
    const produce = await this._getState(ctx, produceId);

    if (produce.currentOwner !== actorId) {
      throw new Error("Only current owner can update details");
    }

    if (details.pricePerUnit !== undefined)
      produce.pricePerUnit = details.pricePerUnit;
    if (details.storageConditions !== undefined)
      produce.storageConditions = details.storageConditions;
    produce.totalPrice = (produce.pricePerUnit || 0) * (produce.qty || 0);

    produce.actionHistory.push(
      this._actionItem("UPDATED", produce.currentLocation, actorId, details)
    );
    await this._putState(ctx, produceId, produce);
    return produce;
  }

  // 6. splitProduce(produceId, qty, OwnerId)
  async splitProduce(ctx, produceId, qtyStr, ownerId) {
    const qty = parseFloat(qtyStr);
    const produce = await this._getState(ctx, produceId);

    if (produce.currentOwner !== ownerId) {
      throw new Error("Only current owner can split produce");
    }

    if (qty <= 0 || qty > produce.qty) {
      throw new Error("Invalid quantity to split");
    }

    produce.qty = produce.qty - qty;
    produce.totalPrice = (produce.pricePerUnit || 0) * produce.qty;

    const childId = `PRODUCE-${uuidv4()}`;
    const child = JSON.parse(JSON.stringify(produce));
    child.id = childId;
    child.parentId = produce.id;
    child.children = [];
    child.qty = qty;
    child.totalPrice = (child.pricePerUnit || 0) * qty;
    child.actionHistory = child.actionHistory || [];
    child.actionHistory.push(
      this._actionItem("SPLIT", produce.currentLocation, ownerId, { qty })
    );

    produce.children = produce.children || [];
    produce.children.push(childId);
    produce.actionHistory.push(
      this._actionItem("SPLIT", produce.currentLocation, ownerId, {
        createdChild: childId,
        qty,
      })
    );

    await this._putState(ctx, produce.id, produce);
    await this._putState(ctx, childId, child);

    return { parent: produce, child };
  }

  // 7. transferOwnership(produceId, newOwnerId, qty, salePrice)
  async transferOwnership(ctx, produceId, newOwnerId, qtyStr, salePriceStr) {
    const qty = parseFloat(qtyStr);
    const salePrice = parseFloat(salePriceStr);
    const produce = await this._getState(ctx, produceId);
    const now = new Date().toISOString();
    const currentOwner = produce.currentOwner;

    if (!produce.isAvailable) {
      throw new Error("Asset not available for sale");
    }

    if (qty <= 0 || qty > produce.qty) {
      throw new Error("Invalid qty");
    }

    let resultAssetId = produceId;
    if (qty < produce.qty) {
      // partial -> split then assign child to new owner
      const splitRes = await this.splitProduce(
        ctx,
        produceId,
        "" + qty,
        produce.currentOwner
      );
      const child = splitRes.child;
      child.currentOwner = newOwnerId;
      child.actionHistory.push(
        this._actionItem("SALE", child.currentLocation, newOwnerId, {
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
    } else {
      // full transfer
      produce.currentOwner = newOwnerId;
      produce.actionHistory.push(
        this._actionItem("SALE", produce.currentLocation, newOwnerId, {
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
    }

    return { newAssetId: resultAssetId };
  }

  // 8. recordPayment(produceId, transactionId, paymentStatus, paymentMethod, paymentRef)
  async recordPayment(
    ctx,
    produceId,
    transactionId,
    paymentStatus,
    paymentMethod,
    paymentRef
  ) {
    const produce = await this._getState(ctx, produceId);
    const now = new Date().toISOString();

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
        "PAYMENT",
        produce.currentLocation,
        produce.currentOwner,
        { transactionId, paymentStatus, paymentMethod, paymentRef }
      )
    );

    // Optional: store sensitive payment details in private data collection (PDCPrices)
    // Example:
    // await ctx.stub.putPrivateData('PDCPrices', `PAY-${produceId}`, Buffer.from(JSON.stringify({ transactionId, paymentMethod, paymentRef, salePrice: produce.saleHistory.slice(-1)[0].salePrice })));

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
        const key = res.value.key;
        if (key.startsWith("PRODUCE-")) {
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

  // Governance functions
  async registerUser(ctx, role, detailsStr) {
    const details = JSON.parse(detailsStr || "{}");
    const id = details.id || `USER-${uuidv4()}`;
    const key = `${role.toUpperCase()}-${id}`;
    const user = {
      role,
      id,
      name: details.name || "",
      location: details.location || "",
      walletId: details.walletId || "",
      registeredProduce: details.registeredProduce || [],
      ownedProduce: details.ownedProduce || [],
      inventory: details.inventory || [],
    };
    await this._putState(ctx, key, user);
    return user;
  }

  async getUserDetails(ctx, userKey) {
    const data = await ctx.stub.getState(userKey);
    if (!data || data.length === 0)
      throw new Error(`User ${userKey} not found`);
    return JSON.parse(data.toString());
  }

  async updateUser(ctx, userKey, role, detailsStr) {
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

module.exports = ProduceContract;
