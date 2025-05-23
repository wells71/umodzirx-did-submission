const crypto = require('crypto');

function hashDigitalID(digitalID) {
  return crypto.createHash('sha256').update(digitalID).digest('hex');
}

module.exports = { hashDigitalID };
