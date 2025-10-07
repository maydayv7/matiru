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
    org: "Org1",
    username: "farmer1",
    password: "password",
    role: "Farmer",
    name: "Farmer One",
    location: "Village A",
    certification: ["Organic Certified"],
  },
  {
    id: "distributor1",
    org: "Org2",
    username: "dist1",
    password: "password",
    role: "Distributor",
    name: "Distributor One",
    location: "City Warehouse",
  },
  {
    id: "retailer1",
    org: "Org3",
    username: "ret1",
    password: "password",
    role: "Retailer",
    name: "Retailer One",
    location: "Market B",
  },
  {
    id: "inspector1",
    org: "Org4",
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
    org: u.org,
  }));
  const dest = path.join(__dirname, "users.json");
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log("users.json written to", dest);
  console.log("Demo accounts: (username / password)");
  out.forEach((u) =>
    console.log(`${u.username} / password (role: ${u.role}, org: ${u.org})`)
  );
}

async function seedBlockchainUsers() {
  const walletPath = path.resolve(__dirname, process.env.WALLET_PATH);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  for (const orgNum of [1, 2, 3, 4]) {
    const orgName = `Org${orgNum}`;
    const ccpPath = path.resolve(
      __dirname,
      process.env[`CCP_PATH_ORG${orgNum}`]
    );
    const identityLabel = process.env[`IDENTITY_ORG${orgNum}`];

    console.log(`Processing users for ${orgName}`);
    const identity = await wallet.get(identityLabel);
    if (!identity) {
      console.error(
        `Identity "${identityLabel}" not found in wallet. Run initWallet.js first.`
      );
      continue;
    }

    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const gateway = new Gateway();

    try {
      await gateway.connect(ccp, {
        wallet,
        identity: identityLabel,
        discovery: {
          enabled: true,
          asLocalhost: process.env.AS_LOCALHOST === "true",
        },
      });

      const network = await gateway.getNetwork(process.env.CHANNEL);
      const contract = network.getContract(process.env.CHAINCODE);

      const orgUsers = users.filter((u) => u.org === orgName);
      for (const u of orgUsers) {
        const userKey = `${u.role.toUpperCase()}-${u.id}`;
        try {
          await contract.evaluateTransaction("getUserDetails", userKey);
          console.log(`User ${userKey} already exists, skipping`);
        } catch {
          console.log(`Registering ${u.role}: ${u.id} from ${orgName}`);
          await contract.submitTransaction(
            "registerUser",
            u.role,
            JSON.stringify(u)
          );
        }
      }
    } catch (err) {
      console.error(`Error processing users for ${orgName}:`, err);
    } finally {
      gateway.disconnect();
    }
  }
  console.log("\nBlockchain users seeding finished");
}

(async () => {
  await seedBackendUsers();
  await seedBlockchainUsers();
})();
