const sodium = require('libsodium-wrappers');
require('dotenv').config();

let masterKey;

const initializeEncryption = async () => {
  try {
    await sodium.ready;
    
    if (!process.env.MASTER_KEY) {
      throw new Error('MASTER_KEY is not defined in environment variables');
    }

    masterKey = sodium.from_base64(process.env.MASTER_KEY, sodium.base64_variants.ORIGINAL);

    if (masterKey.length !== sodium.crypto_secretbox_KEYBYTES) {
      throw new Error(`Invalid MASTER_KEY length. Expected ${sodium.crypto_secretbox_KEYBYTES} bytes`);
    }

    console.log('🔐 Encryption initialized successfully');
  } catch (err) {
    console.error('❌ Encryption initialization failed:', err);
    throw err;
  }
};

const encryptPII = async (plainText) => {
  try {
    if (!masterKey) throw new Error('Encryption key not initialized');
    if (!plainText) return null;

    await sodium.ready;
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const message = sodium.from_string(String(plainText));
    const ciphertext = sodium.crypto_secretbox_easy(message, nonce, masterKey);

    return `${sodium.to_base64(nonce)}:${sodium.to_base64(ciphertext)}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw err;
  }
};

const decryptPII = async (encrypted) => {
  try {
    if (!masterKey) throw new Error('Decryption key not initialized');
    if (!encrypted) return null;

    await sodium.ready;
    const [nonceB64, cipherB64] = encrypted.split(':');
    
    if (!nonceB64 || !cipherB64) {
      throw new Error('Invalid encrypted format - expected nonce:ciphertext');
    }

    const nonce = sodium.from_base64(nonceB64);
    const ciphertext = sodium.from_base64(cipherB64);

    const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, masterKey);
    if (!decrypted) throw new Error('Decryption failed - invalid ciphertext or key');

    return sodium.to_string(decrypted);
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return null;
  }
};

module.exports = {
  initializeEncryption,
  encryptPII,
  decryptPII
};