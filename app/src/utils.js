import Web3 from 'web3';
const web3 = new Web3();

const topicLength = 32;
const userLength = 20;
const timeLength = 7;
const levelLength = 1;
const updateMinLength = topicLength + userLength + timeLength + levelLength;

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


module.exports = {
  mruUpdateDigest: mruUpdateDigest
}
