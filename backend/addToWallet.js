"use strict";
const fs = require("fs");
const path = require("path");
const { Wallets } = require("fabric-network");

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.log(
        "Usage: node addToWallet.js org<num> <userFolder> <walletDir> <identityLabel>"
      );
      process.exit(1);
    }
    const [org, userFolder, walletDir, identityLabel] = args;

    // Determine MSP ID
    const orgMatch = org.match(/^org(\d+)$/i);
    if (!orgMatch) {
      console.error(
        `Invalid org argument: ${org}. Must be like "org1", "org2", etc.`
      );
      process.exit(1);
    }
    const orgNum = orgMatch[1];
    const mspId = `Org${orgNum}MSP`;

    const userMspPath = path.resolve(userFolder);
    if (!fs.existsSync(userMspPath)) {
      console.error("User MSP folder not found:", userMspPath);
      process.exit(1);
    }

    // Read certificate file
    const certPath = path.join(userMspPath, "signcerts");
    const certFiles = fs.readdirSync(certPath);
    if (certFiles.length === 0) {
      console.error("No cert files found in", certPath);
      process.exit(1);
    }
    const cert = fs.readFileSync(path.join(certPath, certFiles[0])).toString();

    // Read private key file
    const keyPath = path.join(userMspPath, "keystore");
    const keyFiles = fs.readdirSync(keyPath);
    if (keyFiles.length === 0) {
      console.error("No key files found in", keyPath);
      process.exit(1);
    }
    const key = fs.readFileSync(path.join(keyPath, keyFiles[0])).toString();

    // Create wallet
    const walletPath = path.resolve(walletDir);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = {
      credentials: {
        certificate: cert,
        privateKey: key,
      },
      mspId: mspId,
      type: "X.509",
    };

    await wallet.put(identityLabel, identity);
    console.log(
      `Successfully added identity ${identityLabel} to wallet at ${walletPath}`
    );
    process.exit(0);
  } catch (err) {
    console.error("Error importing identity to wallet:", err);
    process.exit(1);
  }
}

main();
