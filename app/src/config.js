const configProd = {
  HOTEL_URL: 'https://demo-api.windingtree.com/hotels/0x4Ee2BC4804D1A75AEBa5C76D25cc2c036B136140',
  WEB3_PROVIDER: 'https://mainnet.infura.io/CusDXRIFRTuTeUQlhKjc',
  BOOKING_POC_ADDRESS: '0xB4323839c0B2B4C58002D769644a798f764063C4',
  SIGNER_API: 'https://crypto-booking-server.windingtree.com',
  CAPTCHA_SITE_KEY: '6LfKmmcUAAAAADUI1_CpxzyQ1JHz_bYiQ6Tw3vPF',
};

const configDev = {
  HOTEL_URL: 'https://demo-api.windingtree.com/hotels/0x4Ee2BC4804D1A75AEBa5C76D25cc2c036B136140',
  WEB3_PROVIDER: 'https://ropsten.infura.io/CusDXRIFRTuTeUQlhKjc',
  BOOKING_POC_ADDRESS: '0xb8699080ea54e2377e9e011102eb6bd42d233565',
  SIGNER_API: 'http://localhost:3001',
  CAPTCHA_SITE_KEY: '6LfKmmcUAAAAADUI1_CpxzyQ1JHz_bYiQ6Tw3vPF',
};

const config = process.env.NODE_ENV === 'production' ? configProd : configDev;

if (process.env.ETH_NET === 'ropsten') {
  config.WEB3_PROVIDER = 'https://ropsten.infura.io/v3/801e69a40e3e49b786cd42e8fb16afa2';
  config.BOOKING_POC_ADDRESS = '0xBe39d6DAD35E8B7CDeE8Be51d2960c8499Cd14fc';
  config.SIGNER_API = 'https://crypto-booking-server-qa.windingtree.com';
}

module.exports = config;
