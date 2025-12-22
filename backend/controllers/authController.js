const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const authController = {

  register: async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      mobile,
      location,
      pincode,
      parentId
    } = req.body;

    if (!name || !email || !password || !role || !mobile || !location || !pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      db.run(
        `INSERT INTO users
        (id, email, password, name, phone, location, pincode, role, parentId, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          email,
          hashedPassword,
          name,
          mobile,       // <-- mapped correctly to phone
          location,
          pincode,
          role,
          parentId || null,
          'pending'
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            message: 'Registration successful. Waiting for admin approval.'
          });
        }
      );

    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }

};

module.exports = authController;
