# Matiru

For a detailed overview about this project, read [this](./docs/SOLUTION.md).  
The model is described [here](./docs/MODEL.md).

---

To run the app, follow all sections in order:

### A. Backend

Get the blockchain network up and running with the `chaincode`, along with our `backend` ->

1. Install Chaincode dependencies:

```
cd chaincode
npm install
```

2. Install Docker, Docker Compose and run the following:

```
git clone https://github.com/hyperledger/fabric-samples.git
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
# Install Fabric binaries and Docker images
./install-fabric.sh
```

3. Start Fabric `test-network` and create channel:

```
cd fabric-samples/test-network
# 'test-network' with CA enabled and channel "mychannel"
./network.sh up createChannel -ca
```

4. Deploy Chaincode:

```
# Chaincode name "produce"
./network.sh deployCC -ccn produce -ccp /path/to/CHAINCODE -ccl javascript
```

5. Sample Wallet Creation:

```
# From fabric-samples/test-network
cp organizations/peerOrganizations/org1.example.com/connection-org1.json /path/to/MATIRU/backend/connection-org1.json
cd /path/to/MATIRU/backend
mkdir -p wallet
node scripts/addToWallet.js org1 /path/to/fabric-samples/TEST-NETWORK/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp ./wallet USER_NAME
```

6. The `.env` file must be created in `backend` like so:

```
# Backend server
PORT=4000

# JWT
JWT_SECRET=some_secret
TOKEN_EXPIRES_IN=1h

# Fabric Connection
CCP_PATH=connection-org1.json
WALLET_PATH=./wallet
CHANNEL=mychannel
CHAINCODE=produce
IDENTITY=USER_NAME
AS_LOCALHOST=true
```

7. Start `backend`:

```
npm install
npm run create-users
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
