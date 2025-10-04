"use strict";
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Gateway, Wallets } = require("fabric-network");

// Demo Users
const users = [
  {
    id: "farmer1",
    username: "farmer1",
    password: "password",
    role: "Farmer",
    name: "Farmer One",
    location: "Village A",
    certification: ["Organic Certified"],
  },
  {
    id: "distributor1",
    username: "dist1",
    password: "password",
    role: "Distributor",
    name: "Distributor One",
    location: "City Warehouse",
  },
  {
    id: "retailer1",
    username: "ret1",
    password: "password",
    role: "Retailer",
    name: "Retailer One",
    location: "Market B",
  },
  {
    id: "inspector1",
    username: "insp1",
    password: "password",
    role: "Inspector",
    name: "Inspector One",
    location: "Lab C",
  },
];

async function seedBackendUsers() {
  const out = users.map((u) => ({
    id: u.id,
    username: u.username,
    passwordHash: bcrypt.hashSync(u.password, 10),
    role: u.role,
  }));
  const dest = path.join(__dirname, "users.json");
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log("users.json written to", dest);
  console.log("Demo accounts: (username / password)");
  out.forEach((u) => console.log(`${u.username} / password (role: ${u.role})`));
}

async function seedBlockchainUsers() {
  try {
    const ccpPath = path.resolve(__dirname, process.env.CCP_PATH);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    const walletPath = path.resolve(__dirname, process.env.WALLET_PATH);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(process.env.IDENTITY);
    if (!identity) {
      console.error(
        `Identity "${process.env.IDENTITY}" not found in wallet: ${walletPath}`
      );
      console.error("Run initWallet.js first");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: process.env.IDENTITY,
      discovery: {
        enabled: true,
        asLocalhost: process.env.AS_LOCALHOST === "true",
      },
    });

    const network = await gateway.getNetwork(process.env.CHANNEL);
    const contract = network.getContract(process.env.CHAINCODE);

    for (const u of users) {
      const userKey = `${u.role.toUpperCase()}-${u.id}`;
      try {
        await contract.evaluateTransaction("getUserDetails", userKey);
        console.log(`User ${userKey} already exists, skipping`);
      } catch {
        console.log(`Registering ${u.role}: ${u.id}`);
        await contract.submitTransaction(
          "registerUser",
          u.role,
          JSON.stringify(u)
        );
      }
    }

    console.log("Blockchain users seeded successfully");
    gateway.disconnect();
  } catch (err) {
    console.error("Error seeding blockchain users:", err);
  }
}

(async () => {
  await seedBackendUsers();
  await seedBlockchainUsers();
})();
