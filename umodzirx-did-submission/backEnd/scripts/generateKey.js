// generateKey.js
const sodium = require('libsodium-wrappers');

(async () => {
  await sodium.ready;
  const key = sodium.randombytes_buf(32);
  console.log(Buffer.from(key).toString('base64'));
})();
