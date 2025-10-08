### A. Backend

1. Install Docker & Docker Compose
2. Install Fabric binaries and Docker images like so:

```
cd ..
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
chmod +x install-fabric.sh
./install-fabric.sh
```

Ensure the `config` directory is present inside `fabric`

3. Install Chaincode dependencies:

```
cd chaincode
npm install
```

4. Start Fabric network:

```
cd ../network
./network.sh up createChannel -ca -c CHANNEL_NAME
./network.sh deployCC -c CHANNEL_NAME -ccn CHAINCODE_NAME -ccp /path/to/chaincode -ccl javascript
```

After initial setup, you can use the following commands:

```
./network.sh up # Start network
./network.sh down # Reset everything -> Need to setup again
```

5. Wallet Creation:

```
DIR=../../backend/connections
mkdir -p $DIR
cp organizations/peerOrganizations/org1.example.com/connection-org1.json $DIR/connection-org1.json
cp organizations/peerOrganizations/org2.example.com/connection-org2.json $DIR/connection-org2.json
cp organizations/peerOrganizations/org3.example.com/connection-org3.json $DIR/connection-org3.json
cp organizations/peerOrganizations/org4.example.com/connection-org4.json $DIR/connection-org4.json
cd ../../backend
mkdir -p wallet
node initWallet.js org1 ../fabric/network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp ./wallet admin-org1
node initWallet.js org2 ../fabric/network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp ./wallet admin-org2
node initWallet.js org3 ../fabric/network/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp ./wallet admin-org3
node initWallet.js org4 ../fabric/network/organizations/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp ./wallet admin-org4
```

6. The `.env` file must be created in `backend` like so:

```
# Backend server
PORT=4000

# JWT
JWT_SECRET=some_secret
TOKEN_EXPIRES_IN=24h

# Fabric Connection
CHANNEL=CHANNEL_NAME
CHAINCODE=CHAINCODE_NAME
AS_LOCALHOST=true
WALLET_PATH="./wallet"

IDENTITY_ORG1="admin-org1"
CCP_PATH_ORG1="./connections/connection-org1.json"
IDENTITY_ORG2="admin-org2"
CCP_PATH_ORG2="./connections/connection-org2.json"
IDENTITY_ORG3="admin-org3"
CCP_PATH_ORG3="./connections/connection-org3.json"
IDENTITY_ORG4="admin-org4"
CCP_PATH_ORG4="./connections/connection-org4.json"
```

Make sure the port is not blocked by a firewall

7. Start `backend`:

```
npm install
npm run init
npm start
```

### B. Frontend

To start the `frontend` ->

```
cd frontend
npm install
```

Then find your computer's IP address (using `ifconfig`) and execute the following:

```
echo 'export const API_BASE = "http://IP_ADDRESS:4000/api";' >> config.js
npm start
```

Install [Expo Go](https://expo.dev/go) on your phone and scan the QR Code to view the mobile app
