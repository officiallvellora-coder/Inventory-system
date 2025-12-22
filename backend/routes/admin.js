const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

/*
  ADMIN RULES:
  - Full visibility only (no direct inventory mutation)
  - Can view users, inventory, alerts, sales data
  - Can recall batches
*/

// All admin routes are protected
router.use(auth);
router.use(adminAuth);

// Users & hierarchy
router.get('/users', adminController.getUsers);

// Inventory overview (who has how much)
router.get('/inventory-overview', adminController.getInventoryOverview);

// Sales & customer scan analytics (no cashback automation)
router.get('/sales-analytics', adminController.getSalesAnalytics);

// Alerts (low stock, expiry, geo issues)
router.get('/alerts', adminController.getAlerts);

// Expiring batches
router.get('/expiring-batches', adminController.getExpiringBatches);

// Recall a batch (blocks further sales)
router.post('/recall-batch/:batchNumber', adminController.recallBatch);

router.post('/create-superstockist', (req, res) => {
  const { name, email, password, mobile, location, pincode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const id = `ss-${Date.now()}`;

  db.run(
    `INSERT INTO users (id, name, email, password, role, mobile, location, pincode, status)
     VALUES (?, ?, ?, ?, 'superstockist', ?, ?, ?, 'active')`,
    [id, name, email, password, mobile, location, pincode],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Super Stockist created', id });
    }
  );
});

module.exports = router;
