# Roles

1. Farmer
2. Distributor
3. Retailer
4. Consumer
5. Inspector

# Chaincode Functions

### Produce Lifecycle

1. registerProduce(farmerId, details) -> Only Farmer

- Creates a new 'Produce' asset
- Adds it to 'actionHistory' and farmer's 'registeredProduce'
- Creates a "REGISTER" 'actionItem'

2. updateLocation(produceId, actorId, inTransit/newLocation) -> Only Farmer/Distributor/Retailer

- Changes 'currentLocation' or 'status' to "In Transit"
- Adds "MOVE" 'actionItem'

3. markAsUnavailable(produceId, actorId, reason, newStatus) -> Only Farmer/Distributor/Retailer/Inspector

- Mark 'isAvailable' as false and set 'notAvailableReason' to reason
- Adds "REMOVED" actionItem

4. inspectProduce(produceId, inspectorId, qualityUpdate) -> Only Inspector

- Updates 'quality'/'expiryDate'
- Adds an "INSPECT" 'actionItem'
- Calls `markAsUnavailable` if asset fails inspection

5. updateDetails(produceId, actorId, details) -> Only 'currentOwner'

- Updates 'pricePerUnit', 'storageConditions'
- Adds "UPDATED" actionItem

6. splitProduce(produceId, qty, OwnerId) -> Only 'currentOwner'

- Creates new assets and sets 'parentID'
- Updates parent 'qty' and sets 'children'
- Adds a "SPLIT" 'actionItem'

7. transferOwnership(produceId, newOwnerId, qty, salePrice) -> Only 'currentOwner'

- Verifies if asset is available
- Full or partial transfer -> Calls `splitBatch` if partial
- Updates 'saleHistory' and 'actionHistory', and fields in roles
- Adds a "SALE" 'actionItem'

8. recordPayment(produceId, transactionId, paymentStatus)

- Update 'paymentStatus', 'paymentMethod', 'paymentRef'
- Links off-chain payment confirmation (UPI/BankRef)

## Querying

1. getProduceById(produceId)

- Returns current state

2. getProduceByOwner(ownerId)

- Lists all assets owned by a role

## Governance

1. registerUser(role, details) -> Accept user by vote

- Registers Farmer/Distributor/Retailer/Inspector/Consumer

2. getUserDetails(userId)

- Returns profile

3. updateUser(userId, role, details)

- Updates user details

# Schema

## Produce

```
id:
parentId: null if original batch, otherwise reference to parent batch
children: null or [childIds]

qty:
qtyUnit: KG/Number

pricePerUnit: Asking Price
totalPrice: pricePerUnit * qty

currentOwner:
currentLocation:
actionHistory: ['actionItem']
saleHistory: ['transaction']

cropType:
harvestDate:
quality:
expiryDate:
storageConditions: [Cold Storage, High Temperature, Ambient etc.]

status: "Harvested"/"In Transit"/"Retail"/"Missing"/"Failed Inspection"/"Removed"
isAvailable: true/false -> false if asset is not available due to 'notAvailableReason'
notAvailableReason: If asset is expired/missing/fails inspection/sold to consumer
```

### actionItem

Order by 'timestamp'

```
timestamp:
action: "REGISTER"/"UPDATED"/"MOVE"/"SPLIT"/"SALE"/"INSPECT"/"REMOVED"
currentLocation:
currentOwner:
```

### transaction

Order by 'timestamp'

```
timestamp:
prevOwner:
newOwner:
salePrice: Total amount paid

qtyBought:
newId: If a new asset was created

paymentStatus:
paymentMethod:
paymentRef:
```

## Farmer

```
role: "Farmer"
id:
name:
location:
walletId: For Payments
registeredProduce: [produceIds]
certification: ["Organic", "Fair Trade" etc]
```

## Distributor

```
role: "Distributor"
id:
name:
location:
walletId:
ownedProduce: [produceIds]
```

## Retailer

```
role: "Retailer"
id:
name:
shopLocation:
walletId:
inventory: [produceIds]
```

## Inspector

```
role: "Inspector"
id:
name:
authority: "Govt"/"Private"/"NGO"
```

## Consumer

```
role: "Consumer"
id:
```

We don't include any details of a particular consumer to protect their privacy, but at the same time they will be able to access all the information about the asset
