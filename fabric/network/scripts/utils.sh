#!/usr/bin/env bash

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'

function printHelp() {
  USAGE="$1"
  if [ "$USAGE" == "up" ]; then
    println "Usage: "
    println "  network.sh \033[0;32mup\033[0m [Flags]"
    println "    Flags:"
    println "    -ca <use CAs> - Use Certificate Authorities to generate network crypto material"
    println "    -c <channel name> - Name of channel to create (defaults to \"mychannel\")"
    println "    -s <dbtype> - Peer state database to deploy: goleveldb (default) or couchdb"
    println "    -verbose - Verbose mode"
    println "    -h - Print this message"
  elif [ "$USAGE" == "createChannel" ]; then
    println "Usage: "
    println "  network.sh \033[0;32mcreateChannel\033[0m [Flags]"
    println "    Flags:"
    println "    -c <channel name> - Name of channel to create (defaults to \"mychannel\")"
    println "    -verbose - Verbose mode"
    println "    -h - Print this message"
  elif [ "$USAGE" == "deployCC" ]; then
    println "Usage: "
    println "  network.sh \033[0;32mdeployCC\033[0m [Flags]"
    println "    Flags:"
    println "    -c <channel name> - Name of channel to deploy chaincode to"
    println "    -ccn <name> - Chaincode name."
    println "    -ccl <language> - Programming language of chaincode: go, java, javascript, typescript"
    println "    -ccv <version>  - Chaincode version. 1.0 (default)"
    println "    -ccs <sequence>  - Chaincode definition sequence. 1 (default)"
    println "    -ccp <path>  - File path to the chaincode."
    println "    -ccep <policy>  - (Optional) Chaincode endorsement policy."
    println "    -cccg <collection-config>  - (Optional) File path to private data collections configuration file"
    println "    -cci <fcn name>  - (Optional) Name of chaincode initialization function."
    println "    -h - Print this message"
  else
    println "Usage: "
    println "  network.sh <Mode> [Flags]"
    println "    Modes:"
    println "      \033[0;32mup\033[0m - Bring up Fabric orderer and peer nodes. No channel is created"
    println "      \033[0;32mup createChannel\033[0m - Bring up fabric network with one channel"
    println "      \033[0;32mcreateChannel\033[0m - Create and join a channel after the network is created"
    println "      \033[0;32mdeployCC\033[0m - Deploy a chaincode to a channel"
    println "      \033[0;32mdown\033[0m - Bring down the network"
    println "    Flags:"
    println "    -ca: Use Certificate Authorities"
    println "    -c <channel name>: channel name (defaults to \"mychannel\")"
    println "    -s <dbtype>: Peer state database (defaults to goleveldb)"
    println "    -verbose: Verbose mode"
  fi
}

function println() {
  echo -e "$1"
}

function errorln() {
  println "${C_RED}${1}${C_RESET}"
}

function successln() {
  println "${C_GREEN}${1}${C_RESET}"
}

function infoln() {
  println "${C_BLUE}${1}${C_RESET}"
}

function warnln() {
  println "${C_YELLOW}${1}${C_RESET}"
}

function fatalln() {
  errorln "$1"
  exit 1
}

export -f errorln
export -f successln
export -f infoln
export -f warnln
