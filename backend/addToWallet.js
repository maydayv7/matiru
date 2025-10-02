"use strict";
const fs = require("fs");
const path = require("path");
const { Wallets } = require("fabric-network");

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.log(
        "Usage: node addToWallet.js <org> <userFolder> <walletDir> <identityLabel>"
      );
      process.exit(1);
    }
    const [org, userFolder, walletDir, identityLabel] = args;

    // Typical path for the identity in test-network:
    // fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
    const userMspPath = path.resolve(userFolder);
    if (!fs.existsSync(userMspPath)) {
      console.error("User MSP folder not found:", userMspPath);
      process.exit(1);
    }

    const certPath = path.join(userMspPath, "signcerts");
    const keyPath = path.join(userMspPath, "keystore");

    // Read certificate file (first file in signcerts)
    const certFiles = fs.readdirSync(certPath);
    if (certFiles.length === 0) {
      console.error("No cert files found in", certPath);
      process.exit(1);
    }
    const cert = fs.readFileSync(path.join(certPath, certFiles[0])).toString();

    // Read private key file (first file in keystore)
    const keyFiles = fs.readdirSync(keyPath);
    if (keyFiles.length === 0) {
      console.error("No key files found in", keyPath);
      process.exit(1);
    }
    const key = fs.readFileSync(path.join(keyPath, keyFiles[0])).toString();

    // Read MSP config (to extract MSP ID)
    // Try parent folder path like .../User1@org1.example.com/msp/config.yaml or check for Org MSP folder
    const parent = path.dirname(userMspPath);
    // For org1 user path example, MSP ID usually: Org1MSP
    // Try to get it from the folder structure: organizations/peerOrganizations/org1.example.com/msp
    let orgMspFolder = null;
    let node = parent;
    while (node !== path.parse(node).root) {
      if (fs.existsSync(path.join(node, "msp"))) {
        orgMspFolder = path.join(node, "msp");
        break;
      }
      node = path.dirname(node);
    }

    // Fallback: if not found, try to derive from org argument (org1 -> Org1MSP)
    let mspId = null;
    if (orgMspFolder) {
      // derive MSP ID from folder name e.g., org1.example.com -> Org1MSP
      const orgFolder = path.basename(path.dirname(orgMspFolder)); // org1.example.com
      // crude mapping: take first token and uppercase first letter + "MSP"
      const prefix = orgFolder.split(".")[0]; // org1
      mspId = prefix.charAt(0).toUpperCase() + prefix.slice(1) + "MSP"; // Org1MSP
    } else {
      mspId = org.charAt(0).toUpperCase() + org.slice(1) + "MSP";
    }

    // Create wallet directory
    const walletPath = path.resolve(walletDir);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Create identity object
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
    console.log(`mspId used: ${mspId}`);
    process.exit(0);
  } catch (err) {
    console.error("Error importing identity to wallet:", err);
    process.exit(1);
  }
}

main();
