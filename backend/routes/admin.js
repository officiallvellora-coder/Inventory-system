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

module.exports = router;