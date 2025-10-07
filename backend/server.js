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

// Notifications
const NOTIFICATIONS_PATH = path.join(__dirname, "notifications.json");
if (!fs.existsSync(NOTIFICATIONS_PATH))
  fs.writeFileSync(NOTIFICATIONS_PATH, JSON.stringify([], null, 2));

function readNotifications() {
  return JSON.parse(fs.readFileSync(NOTIFICATIONS_PATH, "utf8"));
}

function writeNotifications(notifications) {
  fs.writeFileSync(NOTIFICATIONS_PATH, JSON.stringify(notifications, null, 2));
}

async function addNotification(notification) {
  const notifications = readNotifications();
  const newNotification = {
    id: `notif-${Date.now()}-${crypto.randomUUID()}`,
    date: new Date().toISOString(),
    read: false,
    ...notification,
  };
  notifications.unshift(newNotification); // Add to top
  writeNotifications(notifications);
}

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
      console.warn(`Skipping gateway for ${org}: configuration missing`);
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
      console.log(`Gateway for ${org} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize gateway for ${org}:`, error);
    }
  }
}

async function getContract(org) {
  const gateway = gateways[org];
  if (!gateway || !gateway.getNetwork)
    throw new Error(`Gateway for ${org} is not available or not connected`);

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
  if (!header) return res.status(401).json({ error: "Missing auth header" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = payload;
    if (!req.user.org) {
      return res
        .status(403)
        .json({ error: "Invalid token: missing Org identifier" });
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
      return res.status(400).json({ error: "Username and Password required" });

    const usersPath = path.join(__dirname, "users.json");
    if (!fs.existsSync(usersPath))
      return res
        .status(500)
        .json({ error: "users.json missing -> run 'npm run init'" });

    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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
      return res.status(400).json({ error: "No image file uploaded" });

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
    const allNotifications = readNotifications();
    const { id: userId, org: userOrg } = req.user;
    const userNotifications = allNotifications.filter((n) => {
      if (n.channel === "all") return true;
      if (n.channel === "org" && n.targetId === userOrg) return true;
      if (n.channel === "user" && n.targetId === userId) return true;
      return false;
    });
    res.json({ notifications: userNotifications });
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
    const produce = JSON.parse(result.toString());
    await addNotification({
      title: "New Produce Registered",
      message: `Registered a new batch of ${details.cropType} (ID: ${produce.id}).`,
      channel: "user",
      targetId: farmerId,
    });
    return res.json({ success: true, produce });
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
    const produce = JSON.parse(result.toString());
    await addNotification({
      title: "Location Updated",
      message: `Location for ${produce.cropType} (ID: ${produceId}) has been updated to ${newLocation}.`,
      channel: "user",
      targetId: actorId,
    });
    return res.json({ success: true, produce });
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
    const produce = JSON.parse(result.toString());

    await addNotification({
      title: "Produce Inspected",
      message: `Your produce batch ${produce.cropType} (ID: ${produceId}) was inspected. Status: ${
        qualityUpdate.failed
          ? `Failed. Reason: ${qualityUpdate.reason}.`
          : "Passed"
      }.`,
      channel: "user",
      targetId: produce.currentOwner,
    });

    return res.json({ success: true, produce });
  })
);

router.post(
  "/transferOwnership",
  asyncHandler(async (req, res) => {
    const { produceId, newOwnerId, qty, salePrice } = req.body;
    const contract = await getContract(req.user.org);
    const produceData = await contract.evaluateTransaction(
      "getProduceById",
      produceId
    );
    const produce = JSON.parse(produceData.toString());
    const prevOwnerId = produce.currentOwner;

    const result = await contract.submitTransaction(
      "transferOwnership",
      produceId,
      newOwnerId,
      "" + qty,
      "" + salePrice
    );

    await addNotification({
      title: "Produce Received",
      message: `You have received ${qty} ${
        produce.qtyUnit || ""
      } of ${produce.cropType} from ${prevOwnerId}.`,
      channel: "user",
      targetId: newOwnerId,
    });

    await addNotification({
      title: "Produce Transferred",
      message: `You transferred ${qty} ${
        produce.qtyUnit || ""
      } of ${produce.cropType} to ${newOwnerId}.`,
      channel: "user",
      targetId: prevOwnerId,
    });

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
    const produce = JSON.parse(result.toString());
    await addNotification({
      title: "Details Updated",
      message: `Details for your produce batch ${produce.cropType} (ID: ${produceId}) have been updated.`,
      channel: "user",
      targetId: actorId,
    });
    return res.json({ success: true, produce });
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
    const produce = JSON.parse(result.toString());
    await addNotification({
      title: "Produce Status Changed",
      message: `Your produce batch ${produce.cropType} (ID: ${produceId}) was marked as ${newStatus}.`,
      channel: "user",
      targetId: actorId,
    });
    return res.json({ success: true, produce });
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
    const splitResult = JSON.parse(result.toString());
    await addNotification({
      title: "Produce Split",
      message: `Your produce batch (ID: ${produceId}) was split. A new batch of ${qty} was created.`,
      channel: "user",
      targetId: ownerId,
    });
    return res.json({ success: true, split: splitResult });
  })
);

router.post(
  "/recordPayment",
  asyncHandler(async (req, res) => {
    const { produceId, transactionId, paymentStatus } = req.body;
    const contract = await getContract(req.user.org);
    const result = await contract.submitTransaction(
      "recordPayment",
      produceId,
      transactionId,
      paymentStatus,
      req.body.paymentMethod,
      req.body.paymentRef || ""
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
