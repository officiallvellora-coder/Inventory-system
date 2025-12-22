const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// protect all admin routes
router.use(auth);
router.use(adminAuth);

/* =====================
   VIEW ALL USERS
   ===================== */
router.get('/users', adminController.getUsers);

/* =====================
   VIEW PENDING REGISTRATIONS
   ===================== */
router.get('/pending-users', (req, res) => {
  db.all(
    `SELECT id, name, email, role, mobile, location, pincode, createdAt
     FROM users WHERE status = 'pending'`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* =====================
   APPROVE USER
   ===================== */
router.post('/approve-user/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE users SET status = 'active' WHERE id = ?`,
    [id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User approved' });
    }
  );
});

/* =====================
   REJECT USER
   ===================== */
router.delete('/reject-user/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM users WHERE id = ? AND status = 'pending'`,
    [id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User rejected' });
    }
  );
});

/* =====================
   CREATE SUPER STOCKIST (DIRECT)
   ===================== */
router.post('/create-superstockist', async (req, res) => {
  const { name, email, password, mobile, location, pincode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = `superstockist-${Date.now()}`;

  db.run(
    `INSERT INTO users
     (id, name, email, password, role, mobile, location, pincode, status)
     VALUES (?, ?, ?, ?, 'superstockist', ?, ?, ?, 'active')`,
    [id, name, email, hashedPassword, mobile, location, pincode],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Super Stockist created', id });
    }
  );
});

/* =====================
   EXISTING ADMIN FEATURES
   ===================== */
router.get('/inventory-overview', adminController.getInventoryOverview);
router.get('/sales-analytics', adminController.getSalesAnalytics);
router.get('/alerts', adminController.getAlerts);
router.get('/expiring-batches', adminController.getExpiringBatches);
router.post('/recall-batch/:batchNumber', adminController.recallBatch);

module.exports = router;
