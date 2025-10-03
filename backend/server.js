"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Gateway, Wallets } = require("fabric-network");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

const CCP_PATH = process.env.CCP_PATH;
const WALLET_PATH = process.env.WALLET_PATH;
const CHANNEL = process.env.CHANNEL;
const CHAINCODE = process.env.CHAINCODE;
const IDENTITY = process.env.IDENTITY;
const AS_LOCALHOST = process.env.AS_LOCALHOST === "true";
const JWT_SECRET = process.env.JWT_SECRET;

async function getContract() {
  if (!CCP_PATH || !WALLET_PATH || !CHANNEL || !CHAINCODE || !IDENTITY) {
    throw new Error(
      "Missing Fabric environment variables (CCP_PATH/WALLET_PATH/CHANNEL/CHAINCODE/IDENTITY)"
    );
  }
  const ccp = JSON.parse(fs.readFileSync(path.resolve(CCP_PATH), "utf8"));
  const wallet = await Wallets.newFileSystemWallet(path.resolve(WALLET_PATH));
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: IDENTITY,
    discovery: { enabled: true, asLocalhost: AS_LOCALHOST },
  });
  const network = await gateway.getNetwork(CHANNEL);
  const contract = network.getContract(CHAINCODE);
  return { contract, gateway };
}

/**
 * Auth Route (prototype)
 * Uses backend/users.json for demo authentication
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });
    const usersPath = path.join(__dirname, "users.json");
    if (!fs.existsSync(usersPath))
      return res
        .status(500)
        .json({ error: "users.json missing -> run 'npm run create-users'" });
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN || "1h" }
    );
    res.json({ token, id: user.id, role: user.role, username: user.username });
  } catch (err) {
    console.error("auth error", err);
    res.status(500).json({ error: err.message });
  }
});

// Middleware
function authenticateMiddleware(req, res, next) {
  if (req.path === "/auth/login") return next();

  // Public Queries
  if (
    req.method === "GET" &&
    (req.path.startsWith("/getProduce") ||
      req.path.startsWith("/getProduceByOwner"))
  ) {
    return next();
  }

  const header = req.headers["authorization"];
  if (!header)
    return res.status(401).json({ error: "missing authorization header" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "missing token" });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "invalid token" });
    req.user = payload;
    next();
  });
}

app.use("/api", authenticateMiddleware);

// Functions
const router = express.Router();

router.post("/registerProduce", async (req, res) => {
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

router.post("/updateLocation", async (req, res) => {
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

router.post("/inspectProduce", async (req, res) => {
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

router.post("/transferOwnership", async (req, res) => {
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

router.post("/updateDetails", async (req, res) => {
  try {
    const { produceId, actorId, details } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "updateDetails",
      produceId,
      actorId,
      JSON.stringify(details)
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("updateDetails error", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/markAsUnavailable", async (req, res) => {
  try {
    const { produceId, actorId, reason, newStatus } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "markAsUnavailable",
      produceId,
      actorId,
      reason || "",
      newStatus || "Removed"
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("markAsUnavailable error", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/splitProduce", async (req, res) => {
  try {
    const { produceId, qty, ownerId } = req.body;
    const { contract, gateway } = await getContract();
    const result = await contract.submitTransaction(
      "splitProduce",
      produceId,
      "" + qty,
      ownerId
    );
    await gateway.disconnect();
    return res.json({ success: true, split: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("splitProduce error", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/recordPayment", async (req, res) => {
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

router.post("/registerUser", async (req, res) => {
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

// Queries
router.get("/getProduce/:id", async (req, res) => {
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

router.get("/getProduceByOwner/:ownerId", async (req, res) => {
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

router.get("/getUser/:userKey", async (req, res) => {
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

app.use("/api", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend server listening on ${PORT}`));
