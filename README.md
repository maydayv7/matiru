# Matiru

**"Trustable Food, Transparent Journey"**

Matiru is a blockchain-powered agriculture supply chain platform that records every stage of the produce lifecycle - from the farmer to the consumer. Each batch of produce is digitally registered with details like crop type, harvest date, quality, ownership, and movement.

## The Problem

The current agricultural supply chain often suffers from:

- **Opaque pricing:** Farmers have little visibility into the final selling price
- **Unreliable quality checks:** Certifications can be inconsistent and prone to manipulation
- **Lack of consumer trust:** Labels like "Organic" are hard to verify
- **Inefficiencies and waste:** Poor traceability makes it difficult to manage inventory and reduce spoilage

## The Solution

Matiru provides a decentralized platform to track agricultural produce, ensuring transparency in pricing, quality, and origin. Stakeholders (farmers, distributors, retailers, inspectors) can verify transactions, reducing exploitation and fraud in the supply chain. Consumers can instantly access this information by scanning QR codes.

## Key Features

- **Farm-to-Fork Transparency:** Track produce from the farm to the consumer
- **Role-Based Access:** Different stakeholders have different permissions, ensuring data integrity
- **QR Code Integration:** Consumers can easily access produce information by scanning a QR code
- **Secure & Immutable:** Built on Hyperledger Fabric, all transactions are secure and cannot be altered
- **Cross-Platform App:** A user-friendly mobile app for all stakeholders
- **Global Chain Access:** A transparent ledger explorer for maximum accountability

## Technology Stack

- **Blockchain:** Hyperledger Fabric
- **Frontend:** React Native (Expo)
- **Backend:** Node.js, Express
- **Database:** CouchDB (for World State)

## Getting Started

To get a local copy up and running follow these steps

### Prerequisites

- Docker & Docker Compose
- NodeJS & `npm`

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/maydayv7/matiru
    cd matiru
    ```
2.  Follow the detailed instructions in the [INSTALL.md](./docs/INSTALL.md) file to set up the blockchain network, start the server and run the app

## Usage

The application provides different dashboards for each role in the supply chain:

- **Farmer:** Register produce, generate QR codes, and transfer ownership
- **Distributor:** Update produce location, split batches, and manage resale
- **Inspector:** Record inspection results and approve or reject batches
- **Retailer:** Confirm inventory and log sales to consumers
- **Consumer:** Scan QR codes to view the complete provenance of the produce

Here are some screenshots of the application:

![Preview 1](./docs/preview-1.jpeg)
![Preview 2](./docs/preview-2.jpeg)

## Documentation

For a more in-depth look at the project, read the following:

- [SOLUTION.md](./docs/SOLUTION.md): Detailed overview of the project
- [MODEL.md](./docs/MODEL.md): Description of the data model and chaincode functions

## License

Distributed under the MIT License  
See [`LICENSE`](./LICENSE) for more information
