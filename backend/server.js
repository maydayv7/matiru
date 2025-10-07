"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { Gateway, Wallets } = require("fabric-network");

const app = express();
app.use(cors());
app.use(morgan("dev"));

// Image Storage
app.use("/uploads", express.static("uploads"));
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Fabric Network
const { CHANNEL, CHAINCODE, AS_LOCALHOST, JWT_SECRET, WALLET_PATH } =
  process.env;
const orgConfig = {
  Org1: {
    ccpPath: process.env.CCP_PATH_ORG1,
    identity: process.env.IDENTITY_ORG1,
  },
  Org2: {
    ccpPath: process.env.CCP_PATH_ORG2,
    identity: process.env.IDENTITY_ORG2,
  },
  Org3: {
    ccpPath: process.env.CCP_PATH_ORG3,
    identity: process.env.IDENTITY_ORG3,
  },
  Org4: {
    ccpPath: process.env.CCP_PATH_ORG4,
    identity: process.env.IDENTITY_ORG4,
  },
};

async function getContract(org) {
  const config = orgConfig[org];
  if (!config) throw new Error(`Configuration for ${org} not found.`);
  if (
    !config.ccpPath ||
    !config.identity ||
    !WALLET_PATH ||
    !CHANNEL ||
    !CHAINCODE
  )
    throw new Error(`Missing Fabric environment variables for ${org}`);

  const ccp = JSON.parse(fs.readFileSync(path.resolve(config.ccpPath), "utf8"));
  const wallet = await Wallets.newFileSystemWallet(path.resolve(WALLET_PATH));
  const gateway = new Gateway();

  await gateway.connect(ccp, {
    wallet,
    identity: config.identity,
    discovery: { enabled: true, asLocalhost: AS_LOCALHOST === "true" },
  });

  const network = await gateway.getNetwork(CHANNEL);
  const contract = network.getContract(CHAINCODE);
  return { contract, gateway };
}

// Middleware
function authenticateMiddleware(req, res, next) {
  if (req.path === "/auth/login") return next();

  // Public Queries
  if (
    req.method === "GET" &&
    (req.path.startsWith("/getProduce") || req.path.startsWith("/getUser"))
  ) {
    req.user = { org: "Org1" };
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
    if (!req.user.org) {
      return res
        .status(403)
        .json({ error: "invalid token: missing org identifier" });
    }
    next();
  });
}

// User Authentication
// Prototype: Uses backend/users.json
app.post("/api/auth/login", express.json(), async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });
    const usersPath = path.join(__dirname, "users.json");
    if (!fs.existsSync(usersPath))
      return res
        .status(500)
        .json({ error: "users.json missing -> run 'npm run init'" });
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username, org: user.org },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN || "1h" }
    );
    res.json({ token, ...user });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/uploadImage",
  authenticateMiddleware,
  upload.single("image"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "no image file uploaded" });
    try {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      res.json({ url: fileUrl });
    } catch (err) {
      console.error("Image Upload error:", err);
      res.status(500).json({ error: "failed to process image upload" });
    }
  }
);

// Functions
const router = express.Router();

router.post("/registerUser", async (req, res) => {
  try {
    const { role, details } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "registerUser",
      role,
      JSON.stringify(details)
    );
    await gateway.disconnect();
    return res.json({ success: true, user: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/registerProduce", async (req, res) => {
  try {
    const { farmerId, details } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "registerProduce",
      farmerId,
      JSON.stringify(details)
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("registerProduce error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/updateLocation", async (req, res) => {
  try {
    const { produceId, actorId, newLocation } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "updateLocation",
      produceId,
      actorId,
      newLocation
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("updateLocation error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/inspectProduce", async (req, res) => {
  try {
    const { produceId, inspectorId, qualityUpdate } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "inspectProduce",
      produceId,
      inspectorId,
      JSON.stringify(qualityUpdate)
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("inspectProduce error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/transferOwnership", async (req, res) => {
  try {
    const { produceId, newOwnerId, qty, salePrice } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
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
    console.error("transferOwnership error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/updateDetails", async (req, res) => {
  try {
    const { produceId, actorId, details } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "updateDetails",
      produceId,
      actorId,
      JSON.stringify(details)
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("updateDetails error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/markAsUnavailable", async (req, res) => {
  try {
    const { produceId, actorId, reason, newStatus } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
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
    console.error("markAsUnavailable error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/splitProduce", async (req, res) => {
  try {
    const { produceId, qty, ownerId } = req.body;
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "splitProduce",
      produceId,
      "" + qty,
      ownerId
    );
    await gateway.disconnect();
    return res.json({ success: true, split: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("splitProduce error:", err);
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
    const { contract, gateway } = await getContract(req.user.org);
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
    console.error("recordPayment error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Queries

router.get("/getProduce/:id", async (req, res) => {
  try {
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.evaluateTransaction(
      "getProduceById",
      req.params.id
    );
    await gateway.disconnect();
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("getProduceById error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/getProduceByOwner/:ownerId", async (req, res) => {
  try {
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.evaluateTransaction(
      "getProduceByOwner",
      req.params.ownerId
    );
    await gateway.disconnect();
    return res.json({ success: true, produces: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("getProduceByOwner error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/getUser/:userKey", async (req, res) => {
  try {
    const { contract, gateway } = await getContract(req.user.org);
    const result = await contract.evaluateTransaction(
      "getUserDetails",
      req.params.userKey
    );
    await gateway.disconnect();
    return res.json({ success: true, user: JSON.parse(result.toString()) });
  } catch (err) {
    console.error("getUserDetails error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.use("/api", authenticateMiddleware, express.json(), router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${PORT}`)
);
