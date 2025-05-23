const { pool } = require('../config/db');
const { encryptPII, decryptPII } = require('../utils/encryption');
const { hashDigitalID } = require('../utils/hash');

class UserController {
  static async ensureTableExists() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS staffs (
          digitalID TEXT PRIMARY KEY,
          digitalID_hash TEXT UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT DEFAULT 'Active',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updatedAt = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await pool.query(`
        CREATE OR REPLACE TRIGGER update_staffs_updated_at
        BEFORE UPDATE ON staffs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
      `);

      console.log('✅ Staffs table and triggers verified');
    } catch (err) {
      console.error('❌ Table creation error:', err.message);
      throw err;
    }
  }

  static async addUser(req, res) {
    try {
      const { digitalID, role, name, status = 'Active' } = req.body;
      if (!digitalID || !role || !name) {
        return res.status(400).json({ message: 'Missing required fields: digitalID, role, name' });
      }

      const encryptedDigitalID = await encryptPII(digitalID);
      const digitalIDHash = hashDigitalID(digitalID);
      const encryptedName = await encryptPII(name);
      const encryptedRole = await encryptPII(role);
      const encryptedStatus = await encryptPII(status);

      const existing = await pool.query(
        'SELECT digitalID FROM staffs WHERE digitalID_hash = $1',
        [digitalIDHash]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'User already exists' });
      }

      await pool.query(
        `INSERT INTO staffs (digitalID, digitalID_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [encryptedDigitalID, digitalIDHash, encryptedName, encryptedRole, encryptedStatus]
      );

      return res.status(201).json({
        message: 'User added successfully',
        user: { digitalID, name, role, status }
      });
    } catch (err) {
      console.error('Add user error:', err);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }

  static async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const countQuery = await pool.query('SELECT COUNT(*) FROM staffs');
      const total = parseInt(countQuery.rows[0].count);

      const result = await pool.query(
        'SELECT * FROM staffs ORDER BY createdAt DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const users = await Promise.all(result.rows.map(async (row) => ({
        digitalID: await decryptPII(row.digitalid),
        name: await decryptPII(row.name),
        role: await decryptPII(row.role),
        status: await decryptPII(row.status),
        createdAt: row.createdat,
        updatedAt: row.updatedat
      })));

      return res.json({
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: (page * limit) < total
        }
      });
    } catch (err) {
      console.error('Fetch users error:', err);
      return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { digitalID } = req.params;
      if (!digitalID) {
        return res.status(400).json({ message: 'Missing digitalID parameter' });
      }

      const digitalIDHash = hashDigitalID(digitalID);
      const result = await pool.query(
        'SELECT * FROM staffs WHERE digitalID_hash = $1',
        [digitalIDHash]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result.rows[0];
      const decryptedUser = {
        digitalID: await decryptPII(user.digitalid),
        name: await decryptPII(user.name),
        role: await decryptPII(user.role),
        status: await decryptPII(user.status),
        createdAt: user.createdat,
        updatedAt: user.updatedat
      };

      return res.json(decryptedUser);
    } catch (err) {
      console.error('Get user error:', err);
      return res.status(500).json({ message: 'Failed to get user', error: err.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { digitalID } = req.params;
      const { name, role, status } = req.body;

      if (!digitalID || !name || !role || !status) {
        return res.status(400).json({ message: 'Missing required fields: digitalID, name, role, status' });
      }

      const digitalIDHash = hashDigitalID(digitalID);
      const encryptedName = await encryptPII(name);
      const encryptedRole = await encryptPII(role);
      const encryptedStatus = await encryptPII(status);

      const result = await pool.query(
        `UPDATE staffs
         SET name = $1, role = $2, status = $3
         WHERE digitalID_hash = $4
         RETURNING *`,
        [encryptedName, encryptedRole, encryptedStatus, digitalIDHash]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        message: 'User updated successfully',
        user: { digitalID, name, role, status }
      });
    } catch (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { digitalID } = req.params;
      if (!digitalID) {
        return res.status(400).json({ message: 'Missing digitalID parameter' });
      }

      const digitalIDHash = hashDigitalID(digitalID);
      const result = await pool.query(
        'DELETE FROM staffs WHERE digitalID_hash = $1 RETURNING *',
        [digitalIDHash]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
  }

  // Add a new method to find user by digitalID
  static async findUserByDigitalID(digitalID) {
    try {
      if (!digitalID) {
        return null;
      }

      const digitalIDHash = hashDigitalID(digitalID);
      const result = await pool.query(
        'SELECT * FROM staffs WHERE digitalID_hash = $1',
        [digitalIDHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        digitalID: await decryptPII(user.digitalid),
        name: await decryptPII(user.name),
        role: await decryptPII(user.role),
        status: await decryptPII(user.status),
        createdAt: user.createdat,
        updatedAt: user.updatedat
      };
    } catch (err) {
      console.error('Find user by digitalID error:', err);
      return null;
    }
  }
}

module.exports = UserController;
