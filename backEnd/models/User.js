const { pool } = require('../config/db'); // Use the connection pool from db.js

class User {
  static async create(userData) {
    const { username, password, role } = userData;
    const query = `
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?);
    `;
    const values = [username, password, role];
    const [result] = await pool.query(query, values); // Use pool.query for promise-based queries
    return result.insertId; // Return the ID of the newly created user
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await pool.query(query, [username]); // Use pool.query
    return rows[0];
  }

  static async findById(userId) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.query(query, [userId]); // Use pool.query
    return rows[0];
  }

  static async update(userId, updateData) {
    const { username, password, role } = updateData;
    const query = `
      UPDATE users
      SET username = ?, password = ?, role = ?
      WHERE id = ?;
    `;
    const values = [username, password, role, userId];
    const [result] = await pool.query(query, values); // Use pool.query
    return result.affectedRows > 0; // Return true if the update was successful
  }

  static async delete(userId) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query(query, [userId]); // Use pool.query
    return result.affectedRows > 0; // Return true if the deletion was successful
  }
}

module.exports = User;
