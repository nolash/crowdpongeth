// Kudos to https://github.com/ethersphere/swarm-guide/blob/9b6fe38d9ec6e4ad1f92860e757d631358d3df54/contents/usage/feed.rst
import web3 from 'web3';

const topicLength = 32;
const userLength = 20;
const timeLength = 7;
const levelLength = 1;
const headerLength = 8;
const updateMinLength = topicLength + userLength + timeLength + levelLength + headerLength;

function feedUpdateDigest(request /* request */, data /* UInt8Array */) {
  let topicBytes;
  let userBytes;
  let protocolVersion = 0;

  protocolVersion = request.protocolVersion;

  try {
    topicBytes = web3.utils.hexToBytes(request.feed.topic);
  } catch (err) {
    console.error(`topicBytes: ${err}`);
    return undefined;
  }

  try {
    userBytes = web3.utils.hexToBytes(request.feed.user);
  } catch (err) {
    console.error(`topicBytes: ${err}`);
    return undefined;
  }

  const buf = new ArrayBuffer(updateMinLength + data.length);
  const view = new DataView(buf);
  let cursor = 0;

  view.setUint8(cursor, protocolVersion); // first byte is protocol version.
  cursor += headerLength; // leave the next 7 bytes (padding) set to zero

  topicBytes.forEach((v) => {
    view.setUint8(cursor, v);
    cursor++;
  });

  userBytes.forEach((v) => {
    view.setUint8(cursor, v);
    cursor++;
  });

  // time is little-endian
  view.setUint32(cursor, request.epoch.time, true);
  cursor += 7;

  view.setUint8(cursor, request.epoch.level);
  cursor++;

  data.forEach((v) => {
    view.setUint8(cursor, v);
    cursor++;
  });
  console.log(web3.utils.bytesToHex(new Uint8Array(buf)));

  return web3.utils.sha3(web3.utils.bytesToHex(new Uint8Array(buf)));
}

module.exports = {
  digest: feedUpdateDigest,
};
