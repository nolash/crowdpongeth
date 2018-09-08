
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const BN = require('bignumber.js');
const { duration, increaseTime } = require('./helpers/increaseTime');

const Pong = artifacts.require('Pong');

require('chai')
  .use(require('chai-bignumber')(BN))
  .use(require('chai-as-promised'))
  .should();

async function latestTime () {
  return (await web3.eth.getBlock('latest')).timestamp;
};

contract('Pong', function (accounts) {
  let pong;

  beforeEach(async function () {
    pong = await Pong.new();
  });
});
