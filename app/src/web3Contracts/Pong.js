import webAppConfig from '../webAppConfig';
import web3 from '../eth/web3';
import socketWeb3 from '../eth/socketWeb3';
import pongAbi from './Pong.abi.json';

export default {
  contract: new web3.eth.Contract(pongAbi, webAppConfig.pongAddress),
  socket: new socketWeb3.eth.Contract(pongAbi, webAppConfig.pongAddress),
};
