# Matiru

For a detailed overview about this project, read [this](./docs/SOLUTION.md).  
The model is described [here](./docs/MODEL.md).

---

To run the app for the first time, follow all sections in order:

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
./install-fabric.sh # Install Fabric binaries and Docker images
```

Ensure the `config` directory is present inside `fabric-samples`

3. Start Fabric `test-network` and create channel:

```
cd fabric-samples/test-network
./network.sh up createChannel -ca -c CHANNEL_NAME
```

After initial setup, you can use the following commands:

```
./network.sh up # Start network
./network.sh down # Reset everything -> Need to setup again
```

4. Deploy Chaincode:

```
./network.sh deployCC -c CHANNEL_NAME -ccn CHAINCODE_NAME -ccp /path/to/chaincode -ccl javascript
```

5. Sample Wallet Creation:

```
# From fabric-samples/test-network
cp organizations/peerOrganizations/org1.example.com/connection-org1.json /path/to/matiru/backend/connection-org1.json
cd /path/to/matiru/backend
mkdir -p wallet
node initWallet.js org1 /path/to/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp ./wallet USER_NAME
```

6. The `.env` file must be created in `backend` like so:

```
# Backend server
PORT=4000

# JWT
JWT_SECRET=some_secret
TOKEN_EXPIRES_IN=24h

# Fabric Connection
CCP_PATH=connection-org1.json
WALLET_PATH=./wallet
CHANNEL=CHANNEL_NAME
CHAINCODE=CHAINCODE_NAME
IDENTITY=USER_NAME
AS_LOCALHOST=true
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
