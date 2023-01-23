const sha512 = require('js-sha512');
const btoa = require('btoa');

const toBase64 = (u8) => btoa(String.fromCharCode.apply(null, u8));

const sha512ToBase64 = (input) => toBase64(sha512.digest(input));

const objectToBase64 = (obj) => btoa(JSON.stringify(obj));

module.exports = {
  sha512ToBase64,
  objectToBase64
}
