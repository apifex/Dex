// migrations/2_deploy.js

const DEX = artifacts.require('DEX');

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts()
 
  dexContract = await deployer.deploy(DEX, 1000, 100)

  console.log("DEX Contract address: ", dexContract.address)

};
