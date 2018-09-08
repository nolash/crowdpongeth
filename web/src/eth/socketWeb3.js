import Web3 from 'web3';
import config from '../config.js'

const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider(config.socketWeb3Url))

export default socketWeb3;
