const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const router = express.Router();

/*
ROLES:
- superstockist
- distributor
- retailer

STATUS:
- pending  (registered, waiting for admin approval)
- active   (approved, can login)
*/

/* =====================
   REGISTER (PUBLIC)
   ===================== */
router.post('/register', async (req, res) => {
  const { name, email, password, role, mobile, location, pincode } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = `${role}-${Date.now()}`;

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = `${role}-${Date.now()}`;

  db.run(
    `INSERT INTO users 
     (id, email, password, name, phone, location, pincode, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [id, email, hashedPassword, name, mobile, location, pincode, role],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Registration submitted for approval' });
    }
  );
});
/* =====================
   LOGIN
   ===================== */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ error: 'User not found' });

      if (user.status !== 'active') {
        return res.status(403).json({
          error: 'Account not approved by admin yet'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    }
  );
});

module.exports = router;

