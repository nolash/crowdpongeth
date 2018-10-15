import Web3 from 'web3';

const web3 = new Web3();

const topicLength = 32;
const userLength = 20;
const timeLength = 7;
const levelLength = 1;
const updateMinLength = topicLength + userLength + timeLength + levelLength;

function mruUpdateDigest(o) {
  let topicBytes;
  let userBytes;

  if (!web3.utils.isHexStrict(o.data)) {
    console.error('data must be a valid 0x prefixed hex value');
    return undefined;
  }
  const dataBytes = web3.utils.hexToBytes(o.data);

  try {
    topicBytes = web3.utils.hexToBytes(o.topic);
  } catch (err) {
    console.error(`topicBytes: ${err}`);
    return undefined;
  }

  try {
    userBytes = web3.utils.hexToBytes(o.user);
  } catch (err) {
    console.error(`topicBytes: ${err}`);
    return undefined;
  }

  const buf = new ArrayBuffer(updateMinLength + dataBytes.length);
  const view = new DataView(buf);
  let cursor = 0;

  topicBytes.forEach((v) => {
    view.setUint8(cursor, v);
    cursor++;
  });

  userBytes.forEach((v) => {
    view.setUint8(cursor, v);
    cursor++;
  });

  // time is little endian
  const timeBuf = new ArrayBuffer(4);
  const timeView = new DataView(timeBuf);
  // view.setUint32(cursor, o.time);
  timeView.setUint32(0, o.time);
  const timeBufArray = new Uint8Array(timeBuf);
  for (let i = 0; i < 4; i++) {
    view.setUint8(cursor, timeBufArray[3 - i]);
    cursor++;
  }

  for (let i = 0; i < 3; i++) {
    view.setUint8(cursor, 0);
    cursor++;
  }

  // cursor += 4;
  view.setUint8(cursor, o.level);
  cursor++;

  dataBytes.forEach((v) => {
    view.setUint8(cursor, v);
    cursor++;
  });

  return web3.utils.sha3(web3.utils.bytesToHex(new Uint8Array(buf)));
}


module.exports = {
  mruUpdateDigest,
};
