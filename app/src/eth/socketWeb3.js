import Web3 from 'web3';
import webAppConfig from '../webAppConfig';

const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider(webAppConfig.socketWeb3Url));

export default socketWeb3;
