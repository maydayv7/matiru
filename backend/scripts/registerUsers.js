"use strict";
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

async function main() {
  try {
    const ccpPath = path.resolve(
      process.env.CCP_PATH || "./connection-org1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    const caName = Object.keys(ccp.certificateAuthorities)[0];
    const caInfo = ccp.certificateAuthorities[caName];
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
      caInfo.caName
    );

    const walletPath = path.resolve(process.env.WALLET_PATH || "./wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Ensure admin is enrolled
    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.error(
        "Admin identity not found in wallet. Run enrollAdmin.js first."
      );
      process.exit(1);
    }

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Users to create
    const users = [
      {
        id: "farmer1",
        role: "Farmer",
        attrs: [{ name: "role", value: "Farmer", ecert: true }],
      },
      {
        id: "distributor1",
        role: "Distributor",
        attrs: [{ name: "role", value: "Distributor", ecert: true }],
      },
      {
        id: "retailer1",
        role: "Retailer",
        attrs: [{ name: "role", value: "Retailer", ecert: true }],
      },
      {
        id: "inspector1",
        role: "Inspector",
        attrs: [{ name: "role", value: "Inspector", ecert: true }],
      },
      {
        id: "consumer1",
        role: "Consumer",
        attrs: [{ name: "role", value: "Consumer", ecert: true }],
      },
      {
        id: "appUser",
        role: "App",
        attrs: [{ name: "role", value: "App", ecert: true }],
      }, // backend client identity
    ];

    for (const u of users) {
      const exists = await wallet.get(u.id);
      if (exists) {
        console.log(`Identity ${u.id} already exists in the wallet, skipping`);
        continue;
      }

      // register user with CA
      const secret = await ca.register(
        {
          enrollmentID: u.id,
          role: "client",
          attrs: u.attrs,
          affiliation: "org1.department1",
        },
        adminUser
      );

      // enroll user
      const enrollment = await ca.enroll({
        enrollmentID: u.id,
        enrollmentSecret: secret,
      });

      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: "Org1MSP",
        type: "X.509",
      };
      await wallet.put(u.id, x509Identity);
      console.log(
        `Successfully registered and enrolled user ${u.id} with role ${u.role}`
      );
    }
  } catch (err) {
    console.error("Error registerUsers:", err);
    process.exit(1);
  }
}

main();
