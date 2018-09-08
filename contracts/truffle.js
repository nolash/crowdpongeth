require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    mainnet: getInfuraConfig('mainnet', 1),
    ropsten: getInfuraConfig('ropsten', 3)
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

function getInfuraConfig (networkName, networkId) {
  var HDWalletProvider = require('truffle-hdwallet-provider')
  var keys = {}
  try {
    keys = require('./keys.json')
  } catch (err) {
    console.log('could not find ./keys.json')
  }

  return {
    network_id: networkId,
    provider: function() {
      return new HDWalletProvider(keys.mnemonic, `https://${networkName}.infura.io/` + keys.infura_apikey)
    },
    gas: 4600000
  }
}
