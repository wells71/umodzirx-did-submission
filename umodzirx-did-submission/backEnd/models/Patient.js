const { pgClient } = require('../config/db');

class Patient {
  static async findByMosipId(mosip_id_hash) {
    const query = 'SELECT * FROM patients WHERE mosip_id_hash = $1';
    const result = await pgClient.query(query, [mosip_id_hash]);
    return result.rows[0];
  }

  static async getPrescriptions(mosip_id_hash) {
    const query = `
      SELECT p.*
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      WHERE pt.mosip_id_hash = $1;
    `;
    const result = await pgClient.query(query, [mosip_id_hash]);
    return result.rows;
  }
}

module.exports = Patient;
