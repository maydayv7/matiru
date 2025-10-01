"use strict";
const fs = require("fs");
const path = require("path");
const { Gateway, Wallets } = require("fabric-network");
require("dotenv").config();

async function main() {
  try {
    const ccpPath = path.resolve(
      process.env.CCP_PATH || "./connection-org1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.resolve(process.env.WALLET_PATH || "./wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = process.env.IDENTITY || "appUser";
    const id = await wallet.get(identity);
    if (!id) {
      console.error(
        `Identity ${identity} not found in wallet. Run registerUsers.js first.`
      );
      process.exit(1);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity,
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(
      process.env.CHANNEL || "mychannel"
    );
    const contract = network.getContract(process.env.CHAINCODE || "producecc");

    const profiles = [
      {
        role: "Farmer",
        id: "farmer1",
        name: "Farmer One",
        location: "Village A",
      },
      {
        role: "Distributor",
        id: "distributor1",
        name: "Distributor One",
        location: "Hub B",
      },
      {
        role: "Retailer",
        id: "retailer1",
        name: "Retail Shop 1",
        location: "Town C",
      },
      {
        role: "Inspector",
        id: "inspector1",
        name: "Inspector A",
        location: "District X",
        authority: "Govt",
      },
      {
        role: "Consumer",
        id: "consumer1",
        name: "Consumer A",
        location: "City Y",
      },
    ];

    for (const p of profiles) {
      const details = JSON.stringify({
        id: p.id,
        name: p.name,
        location: p.location,
        walletId: `${p.id}-wallet`,
        certification: p.certification || [],
        authority: p.authority || "",
      });
      console.log(`Registering user on ledger: ${p.role}-${p.id}`);
      const tx = await contract.submitTransaction(
        "registerUser",
        p.role,
        details
      );
      console.log(`Registered on ledger: ${tx.toString()}`);
    }

    await gateway.disconnect();
    console.log("All ledger user profiles created.");
  } catch (err) {
    console.error("Error createLedgerUsers:", err);
    process.exit(1);
  }
}

main();
