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

const gateways = {};
async function initializeGateways() {
  console.log("Initializing Fabric Gateways...");
  const wallet = await Wallets.newFileSystemWallet(path.resolve(WALLET_PATH));

  for (const org of Object.keys(orgConfig)) {
    const config = orgConfig[org];
    if (!config || !config.ccpPath || !config.identity) {
      console.warn(`Skipping gateway for ${org}: configuration missing.`);
      continue;
    }

    const ccp = JSON.parse(
      fs.readFileSync(path.resolve(config.ccpPath), "utf8")
    );
    const gateway = new Gateway();

    try {
      await gateway.connect(ccp, {
        wallet,
        identity: config.identity,
        discovery: { enabled: true, asLocalhost: AS_LOCALHOST === "true" },
      });
      gateways[org] = gateway;
      console.log(`Gateway for ${org} initialized successfully.`);
    } catch (error) {
      console.error(`Failed to initialize gateway for ${org}:`, error);
    }
  }
}

async function getContract(org) {
  const gateway = gateways[org];
  if (!gateway || !gateway.getNetwork)
    throw new Error(`Gateway for ${org} is not available or not connected.`);

  const network = await gateway.getNetwork(CHANNEL);
  return network.getContract(CHAINCODE);
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

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// User Authentication
app.post(
  "/api/auth/login",
  express.json(),
  asyncHandler(async (req, res) => {
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
  })
);

app.post(
  "/api/uploadImage",
  authenticateMiddleware,
  upload.single("image"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "no image file uploaded" });

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.json({ url: fileUrl });
  }
);

// Functions
const router = express.Router();

router.get(
  "/notifications",
  asyncHandler(async (req, res) => {
    const notificationsPath = path.join(__dirname, "notifications.json");
    if (!fs.existsSync(notificationsPath)) {
      return res.json({ notifications: [] });
    }
    const notifications = JSON.parse(
      fs.readFileSync(notificationsPath, "utf8")
    );
    res.json({ notifications });
  })
);

router.post(
  "/registerUser",
  asyncHandler(async (req, res) => {
    const { role, details } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "registerUser",
      role,
      JSON.stringify(details)
    );
    return res.json({ success: true, user: JSON.parse(result.toString()) });
  })
);

router.post(
  "/registerProduce",
  asyncHandler(async (req, res) => {
    const { farmerId, details } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "registerProduce",
      farmerId,
      JSON.stringify(details)
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

router.post(
  "/updateLocation",
  asyncHandler(async (req, res) => {
    const { produceId, actorId, newLocation } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "updateLocation",
      produceId,
      actorId,
      newLocation
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

router.post(
  "/inspectProduce",
  asyncHandler(async (req, res) => {
    const { produceId, inspectorId, qualityUpdate } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "inspectProduce",
      produceId,
      inspectorId,
      JSON.stringify(qualityUpdate)
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

router.post(
  "/transferOwnership",
  asyncHandler(async (req, res) => {
    const { produceId, newOwnerId, qty, salePrice } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "transferOwnership",
      produceId,
      newOwnerId,
      "" + qty,
      "" + salePrice
    );
    return res.json({ success: true, result: JSON.parse(result.toString()) });
  })
);

router.post(
  "/updateDetails",
  asyncHandler(async (req, res) => {
    const { produceId, actorId, details } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "updateDetails",
      produceId,
      actorId,
      JSON.stringify(details)
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

router.post(
  "/markAsUnavailable",
  asyncHandler(async (req, res) => {
    const { produceId, actorId, reason, newStatus } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "markAsUnavailable",
      produceId,
      actorId,
      reason || "",
      newStatus || "Removed"
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

router.post(
  "/splitProduce",
  asyncHandler(async (req, res) => {
    const { produceId, qty, ownerId } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "splitProduce",
      produceId,
      "" + qty,
      ownerId
    );
    return res.json({ success: true, split: JSON.parse(result.toString()) });
  })
);

router.post(
  "/recordPayment",
  asyncHandler(async (req, res) => {
    const {
      produceId,
      transactionId,
      paymentStatus,
      paymentMethod,
      paymentRef,
    } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "recordPayment",
      produceId,
      transactionId,
      paymentStatus,
      paymentMethod,
      paymentRef || ""
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

// Queries
router.get(
  "/getProduce/:id",
  asyncHandler(async (req, res) => {
    const contract = await getContract(req.user.org);
    const result = await contract.evaluateTransaction(
      "getProduceById",
      req.params.id
    );
    return res.json({ success: true, produce: JSON.parse(result.toString()) });
  })
);

router.get(
  "/getProduceByOwner/:ownerId",
  asyncHandler(async (req, res) => {
    const contract = await getContract(req.user.org);
    const result = await contract.evaluateTransaction(
      "getProduceByOwner",
      req.params.ownerId
    );
    return res.json({ success: true, produces: JSON.parse(result.toString()) });
  })
);

router.get(
  "/getUser/:userKey",
  asyncHandler(async (req, res) => {
    const contract = await getContract(req.user.org);
    const result = await contract.evaluateTransaction(
      "getUserDetails",
      req.params.userKey
    );
    return res.json({ success: true, user: JSON.parse(result.toString()) });
  })
);

app.use("/api", authenticateMiddleware, express.json(), router);

function errorHandler(err, req, res, next) {
  console.error(err);

  const userMessage =
    err.message.includes("DiscoveryService") ||
    err.message.includes("CommitError")
      ? "Blockchain transaction failed. Please try again."
      : err.message;

  res.status(500).json({ error: userMessage });
}
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
initializeGateways()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server listening on port ${PORT}`)
    );
  })
  .catch((e) => {
    console.error("Server failed to start:", e);
    process.exit(1);
  });
