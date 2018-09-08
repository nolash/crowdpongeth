const Pong = artifacts.require('Pong');

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    let pongContract = await deployer.deploy(Pong);
    console.log('Pong address:', pongContract.address);
  });
};
