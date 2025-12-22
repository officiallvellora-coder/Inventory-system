const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const authController = {
  register: async (req, res) => {
    const { name, email, password, phone, location, pincode, role, referralCode } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const generatedReferralCode = uuidv4();

      const roleLevels = { 'super-stockist': 1, 'distributor': 2, 'retailer': 3, 'customer': 4 };
      const level = roleLevels[role];
      if (!level) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      let parentId = null;

      if (role === 'super-stockist') {
        // No referral needed
        insertUser();
      } else {
        if (!referralCode) {
          return res.status(400).json({ error: 'Referral code is required for this role' });
        }

        // Find referrer
        db.get('SELECT id, level FROM users WHERE referralCode = ?', [referralCode], (err, referrer) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!referrer) return res.status(400).json({ error: 'Invalid referral code' });

          if (referrer.level + 1 !== level) {
            return res.status(400).json({ error: 'Invalid referral hierarchy' });
          }

          parentId = referrer.id;

          // Now insert
          insertUser();
        });
        return; // Wait for callback
      }

      function insertUser() {
        db.run(
          'INSERT INTO users (id, name, email, password, phone, location, pincode, role, parentId, referralCode, level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, name, email, hashedPassword, phone, location, pincode, role, parentId, generatedReferralCode, level, 'active'],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User registered successfully', userId: id, referralCode: generatedReferralCode });
          }
        );
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = authController;