#!/usr/bin/env bash

. scripts/envVar.sh
. scripts/configUpdate.sh

createAnchorPeerUpdate() {
  infoln "Fetching channel config for channel $CHANNEL_NAME"
  fetchChannelConfig $ORG $CHANNEL_NAME ${CORE_PEER_LOCALMSPID}config.json

  infoln "Generating anchor peer update transaction for Org${ORG} on channel $CHANNEL_NAME"

  if [ $ORG -eq 1 ]; then
    HOST="peer0.org1.example.com"
    PORT=7051
  elif [ $ORG -eq 2 ]; then
    HOST="peer0.org2.example.com"
    PORT=9051
  elif [ $ORG -eq 3 ]; then
    HOST="peer0.org3.example.com"
    PORT=11051
  elif [ $ORG -eq 4 ]; then
    HOST="peer0.org4.example.com"
    PORT=13051
  else
    errorln "Org${ORG} unknown"
  fi

  set -x
  jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' ${CORE_PEER_LOCALMSPID}config.json > ${CORE_PEER_LOCALMSPID}modified_config.json
  { set +x; } 2>/dev/null

  createConfigUpdate ${CHANNEL_NAME} ${CORE_PEER_LOCALMSPID}config.json ${CORE_PEER_LOCALMSPID}modified_config.json ${CORE_PEER_LOCALMSPID}anchors.tx
}

updateAnchorPeer() {
  peer channel update -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile "$ORDERER_CA" >&log.txt
  res=$?
  cat log.txt
  verifyResult $res "Anchor peer update failed"
  successln "Anchor peer set for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME'"
}

ORG=$1
CHANNEL_NAME=$2
setGlobalsCLI $ORG

createAnchorPeerUpdate 

updateAnchorPeer
