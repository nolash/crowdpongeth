import React, {Fragment} from 'react';
import Web3 from 'web3';

export default class Home extends React.Component {

  constructor(props) {
    super(props)
  }

  async componentDidMount() {
    const web3 = new Web3();

    var topicLength = 32;
    var userLength = 20;
    var timeLength = 7;
    var levelLength = 1;
    var updateMinLength = topicLength + userLength + timeLength + levelLength;

    function mruUpdateDigest(o) {
    	console.log(o)
    	var topicBytes = undefined;
    	var dataBytes = undefined;
    	var userBytes = undefined;

    	if (!web3.utils.isHexStrict(o.data)) {
    		console.error("data must be a valid 0x prefixed hex value");
    		return undefined;
    	}

    	dataBytes = web3.utils.hexToBytes(o.data);

    	try {
    		topicBytes = web3.utils.hexToBytes(o.topic);
    	} catch(err) {
    		console.error("topicBytes: " + err);
    		return undefined;
    	}

    	try {
    		userBytes = web3.utils.hexToBytes(o.user);
    	} catch(err) {
    		console.error("topicBytes: " + err);
    		return undefined;
    	}

    	var buf = new ArrayBuffer(updateMinLength + dataBytes.length);
    	var view = new DataView(buf);
    	var cursor = 0;

    	topicBytes.forEach(function(v) {
    		view.setUint8(cursor, v);
    		cursor++;
    	});

    	userBytes.forEach(function(v) {
    		view.setUint8(cursor, v);
    		cursor++;
    	});

    	// time is little endian
    	var timeBuf = new ArrayBuffer(4);
    	var timeView = new DataView(timeBuf);
    	//view.setUint32(cursor, o.time);
    	timeView.setUint32(0, o.time);
    	var timeBufArray = new Uint8Array(timeBuf);
    	for (var i = 0; i < 4; i++) {
    		view.setUint8(cursor, timeBufArray[3-i]);
    		cursor++;
    	}

    	for (i = 0; i < 3; i++) {
    		view.setUint8(cursor, 0);
    		cursor++;
    	}

    	//cursor += 4;
    	view.setUint8(cursor, o.level);
    	cursor++;

    	dataBytes.forEach(function(v) {
    		view.setUint8(cursor, v);
    		cursor++;
    	});

    	return web3.utils.sha3(web3.utils.bytesToHex(new Uint8Array(buf)));
    }

    const privateKey = '0x7c382355f1c699e92b40cf179db10bdc914c24b4d9f8ff8f88c2bb5b154841bc';
    const newData = '0x122e0356c20b9857853ec7748888de40d2845c1398c892323ae1cde55527fe03';
    const topic = '0xa752d6763b130d97158c365a91102f185fe1571b154b1c75958bada8ccd98eee';

    console.log('Updating topic', topic, 'with', newData);

    web3.eth.accounts.wallet.add(privateKey);
    const account = web3.eth.accounts.wallet[0].address;

    const resourceUpdate = {
      "topic": topic,
      "data": newData,
      "user": account,
      "time": 1536438149,
      "level": 25
    };

    console.log('Resource update', resourceUpdate)
    const dataToSign = mruUpdateDigest(resourceUpdate);

    console.log('Data to sign', dataToSign, 'by account', account);
    // const signature = await web3.eth.sign(dataToSign, account);

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
    const signature = sigObj.signature.toString('hex')
    // console.log('Signer recovered before sending',web3.eth.accounts.recover(dataToSign, signature));

    console.log('Signature', signature);

    const newDataBytes = dataToBuffer(newData);
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
    xhttp.responseType = 'text';

    xhttp.send(dataArray);
    console.log('send');

  }

  render () {
    return (
      <h1>TEST APP</h1>
    )
  }
}
