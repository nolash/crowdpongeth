import React, {Fragment} from 'react';
import {mruUpdateDigest} from '../utils';
import Web3 from 'web3';
const web3 = new Web3();

export default class Home extends React.Component {

  constructor(props) {
    super(props)
  }

  updateResource = async function(privateKey, topic, state) {

    const data = web3.utils.padLeft(state, 2, '0');
    console.log('Updating topic', topic, 'with', data);

    web3.eth.accounts.wallet.add(privateKey);
    const account = web3.eth.accounts.wallet[0].address;

    const resourceUpdate = {
      "topic": topic,
      "data": data,
      "user": account,
      "time": parseInt(new Date().getTime()/1000),
      "level": 0
    };

    console.log('Resource update', resourceUpdate)
    const dataToSign = mruUpdateDigest(resourceUpdate);

    console.log('Data to sign', dataToSign, 'by account', account);

    const secp256k1 = require('secp256k1');
    function dataToBuffer(data) {
      const dataBytes = web3.utils.hexToBytes(data);
      var buf = new ArrayBuffer(dataBytes.length);
      var dataView = new DataView(buf);
      for (var i = 0; i < dataBytes.length; i++) {
        dataView.setUint8(i, dataBytes[i]);
      }
      return buf;
    }

    // sign the message
    const sigObj = secp256k1.sign(Buffer.from(web3.utils.hexToBytes(dataToSign)), Buffer.from(web3.utils.hexToBytes(privateKey)));
    console.log(sigObj.signature.toString('hex'), sigObj.recovery)
    const signature = '0x'+sigObj.signature.toString('hex')+"0"+sigObj.recovery.toString();

    // console.log('Signer recovered before sending',web3.eth.accounts.recover(dataToSign, signature));

    console.log('Signature', signature);

    const newDataBytes = dataToBuffer(data);
    var dataArray = new Uint8Array(newDataBytes);

    var buf = new ArrayBuffer(newDataBytes.length);
    var dataView = new DataView(buf);
    for (var i = 0; i < newDataBytes.length; i++) {
      dataView.setUint8(i, newDataBytes[i]);
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           console.log(xhttp.responseText)
        }
    };

    xhttp.open("POST", `http://localhost:8500/bzz-resource:/?topic=${resourceUpdate.topic}&user=${resourceUpdate.user}&level=${resourceUpdate.level}&time=${resourceUpdate.time}&signature=${signature}`, true);
    xhttp.setRequestHeader("Content-Type","application/octet-stream");
    xhttp.send(dataArray);

  }

  getResource = async function(topic, owner) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log(new Uint8Array(xhttp.response)[0])
        }
    };

    xhttp.open("GET", `http://localhost:8500/bzz-resource:/?topic=${topic}&user=${owner}`, true);
    xhttp.setRequestHeader('Accept', 'application/octet-stream');
    xhttp.responseType = 'arraybuffer';
    xhttp.send();

  }

  async componentDidMount() {

    // const privateKey = '0x7c382355f1c699e92b40cf179db10bdc914c24b4d9f8ff8f88c2bb5b154841bc';
    // const newData = '0x122e0356c20b9857853ec7748888de40d2845c1398c892323ae1cde55527fe03';
    // const topic = '0xa752d6763b130d97158c365a91102f185fe1571b154b1c75958bada8ccd98eee';
    // this.updateResource(
    //   '0x7c382355f1c699e92b40cf179db10bdc914c24b4d9f8ff8f88c2bb5b154841bc',
    //   '0xa752d6763b130d97158c365a91102f185fe1571b154b1c75958bada8ccd98eee', 2
    // );

  }

  render () {
    return (
      <div>
        <h1>TEST APP</h1>
        <a onClick={() => this.updateResource(
          '0x7c382355f1c699e92b40cf179db10bdc914c24b4d9f8ff8f88c2bb5b154841bc',
          '0xa752d6763b130d97158c365a91102f185fe1571b154b1c75958bada8ccd98eee', 0
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
