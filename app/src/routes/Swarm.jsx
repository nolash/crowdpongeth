import React, {Fragment} from 'react';
import {mruUpdateDigest} from '../utils';
import Web3 from 'web3';
const web3 = new Web3();
const SWARM_NODE='http://37.157.197.161:8500';
// const SWARM_NODE='http://10.0.1.14:8500';
// const SWARM_NODE='http://localhost:8500';

export default class Swarm extends React.Component {

  constructor(props) {
    super(props);
  }

  sendRequest = function(url, requestType, responseType, data) {
    return new Promise(function(resolve, reject) {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            if (responseType == 'arraybuffer')
              resolve(new Uint8Array(xhttp.response)[0]);
            else
              resolve(xhttp.responseText);
          }
      };

      function dataToBuffer(data) {
        const dataBytes = web3.utils.hexToBytes(data);
        var buf = new ArrayBuffer(dataBytes.length);
        var dataView = new DataView(buf);
        for (var i = 0; i < dataBytes.length; i++) {
          dataView.setUint8(i, dataBytes[i]);
        }
        return buf;
      }

      xhttp.open(requestType, `${SWARM_NODE}${url}`, true);
      xhttp.setRequestHeader('Accept', 'application/octet-stream');
      xhttp.setRequestHeader('Access-Control-Allow-Method', requestType);
      xhttp.responseType = responseType;

      if (data) {
        const newDataBytes = dataToBuffer(data);
        var dataArray = new Uint8Array(newDataBytes);

        var buf = new ArrayBuffer(newDataBytes.length);
        var dataView = new DataView(buf);
        for (var i = 0; i < newDataBytes.length; i++) {
          dataView.setUint8(i, newDataBytes[i]);
        }
        xhttp.send(dataArray);
      } else {
        xhttp.send();
      }
    });
  }

  updateResource = async function(privateKey, topic, state) {

    const data = web3.utils.padLeft(state, 2, '0');
    // console.log('Updating topic', topic, 'with', data);

    web3.eth.accounts.wallet.add(privateKey);
    const account = web3.eth.accounts.wallet[0].address;

    const metaResponse = JSON.parse(
      await this.sendRequest(`/bzz-resource:/?topic=${topic}&user=${account}&meta=1`,'GET', 'text', null)
    );
    console.log(metaResponse);

    const resourceUpdate = {
      "topic": topic,
      "data": data,
      "user": account,
      "time": metaResponse.epoch.time,
      "level": metaResponse.epoch.level
    };

    // console.log('Resource update', resourceUpdate)
    const dataToSign = mruUpdateDigest(resourceUpdate);
    // console.log('Data to sign', dataToSign, 'by account', account);

    const secp256k1 = require('secp256k1');
    const sigObj = secp256k1.sign(Buffer.from(web3.utils.hexToBytes(dataToSign)), Buffer.from(web3.utils.hexToBytes(privateKey)));
    // console.log(sigObj.signature.toString('hex'), sigObj.recovery)
    const signature = '0x'+sigObj.signature.toString('hex')+"0"+sigObj.recovery.toString();
    // console.log('Signature', signature);

    const updateResponse = await this.sendRequest(`/bzz-resource:/?topic=${resourceUpdate.topic}&user=${resourceUpdate.user}&level=${resourceUpdate.level}&time=${resourceUpdate.time}&signature=${signature}`,
    'POST', 'text', data);
    console.log('Update successful', updateResponse);

  }

  getResource = async function(topic, owner) {
    this.sendRequest(`/bzz-resource:/?topic=${topic}&user=${owner}&hint.level=0`,
    'GET', 'arraybuffer', null).then(function(result){
      console.log('Get successful', result);
    });
  }

  render () {
    return (
      <div>
        <h1>TEST APP</h1>
        <a onClick={() => this.updateResource(
          '0x7c382355f1c699e92b40cf179db10bdc914c24b4d9f8ff8f88c2bb5b154841bc',
          '0xa752d6763b130d97158c365a91102f185fe1571b154b1c75958bada8ccd98eee', Math.floor(Math.random() * Math.floor(9))
        )}>UPDATE</a>
        <br></br>
        <a onClick={() => this.getResource(
          '0xa752d6763b130d97158c365a91102f185fe1571b154b1c75958bada8ccd98eee',
          '0x44deFD3D4e99C2f97E68f3A0a6462e590Fd10B91'
        )}>GET Resource</a>
      </div>
    )
  }
}
