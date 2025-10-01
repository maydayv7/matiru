// Run once after starting test-network
"use strict";
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  try {
    const ccpPath = path.resolve(
      process.env.CCP_PATH || "./connection-org1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // pick first CA in connection profile
    const caName = Object.keys(ccp.certificateAuthorities)[0];
    const caInfo = ccp.certificateAuthorities[caName];

    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
      caInfo.caName
    );
    const walletPath = path.resolve(process.env.WALLET_PATH || "./wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin already enrolled
    const identity = await wallet.get("admin");
    if (identity) {
      console.log("Admin identity already exists in the wallet");
      return;
    }

    // Default in test-network: admin/adminpw
    const enrollmentID = "admin";
    const enrollmentSecret = "adminpw";

    const enrollment = await ca.enroll({ enrollmentID, enrollmentSecret });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org1MSP",
      type: "X.509",
    };
    await wallet.put("admin", x509Identity);
    console.log("Successfully enrolled admin and imported into wallet");
  } catch (err) {
    console.error("Error enrolling admin:", err);
    process.exit(1);
  }
}

main();
