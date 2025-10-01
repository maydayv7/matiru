"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { Gateway, Wallets } = require("fabric-network");

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"));

const ccpPath = path.resolve(process.env.CCP_PATH);
const walletPath = path.resolve(process.env.WALLET_PATH);
const CHANNEL = process.env.CHANNEL;
const CHAINCODE = process.env.CHAINCODE;
const IDENTITY = process.env.IDENTITY;

async function getContract() {
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: IDENTITY,
    discovery: {
      enabled: true,
      asLocalhost: process.env.AS_LOCALHOST === "true",
    },
  });
  const network = await gateway.getNetwork(CHANNEL);
  const contract = network.getContract(CHAINCODE);
  return { contract, gateway };
}

app.post("/api/registerProduce", async (req, res) => {
  try {
    const { farmerId, details } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "registerProduce",
      farmerId,
      JSON.stringify(details)
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/updateLocation", async (req, res) => {
  try {
    const { produceId, actorId, newLocation } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "updateLocation",
      produceId,
      actorId,
      newLocation
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/inspectProduce", async (req, res) => {
  try {
    const { produceId, inspectorId, qualityUpdate } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "inspectProduce",
      produceId,
      inspectorId,
      JSON.stringify(qualityUpdate)
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/transferOwnership", async (req, res) => {
  try {
    const { produceId, newOwnerId, qty, salePrice } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "transferOwnership",
      produceId,
      newOwnerId,
      "" + qty,
      "" + salePrice
    );
    await gateway.disconnect();
    return res.json({ success: true, result: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/recordPayment", async (req, res) => {
  try {
    const {
      produceId,
      transactionId,
      paymentStatus,
      paymentMethod,
      paymentRef,
    } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "recordPayment",
      produceId,
      transactionId,
      paymentStatus,
      paymentMethod,
      paymentRef || ""
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/getProduce/:id", async (req, res) => {
  try {
    const { contract, gateway } = await getContract();
    const result = await contract.evaluateTransaction(
      "getProduceById",
      req.params.id
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/getOwner/:ownerId", async (req, res) => {
  try {
    const { contract, gateway } = await getContract();
    const result = await contract.evaluateTransaction(
      "getProduceByOwner",
      req.params.ownerId
    );
    await gateway.disconnect();
    return res.json({ success: true, produces: JSON.parse(result.toString()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/registerUser", async (req, res) => {
  try {
    const { role, details } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "registerUser",
      role,
      JSON.stringify(details)
    );
    await gateway.disconnect();
    return res.json({ success: true, user: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("registerUser error", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/getUser/:userKey", async (req, res) => {
  try {
    const { contract, gateway } = await getContract();
    const result = await contract.evaluateTransaction(
      "getUserDetails",
      req.params.userKey
    );
    await gateway.disconnect();
    return res.json({ success: true, user: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("getUser error", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend server listening on ${PORT}`));
