const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// protect all admin routes
router.use(auth);
router.use(adminAuth);

/* =====================
   USERS
   ===================== */
router.get('/users', (req, res) =>
  adminController.getUsers(req, res)
);

/* =====================

   INVENTORY OVERVIEW
   ===================== */
router.get('/inventory-overview', (req, res) =>
  adminController.getInventoryOverview(req, res)
);

/* =====================
   SALES ANALYTICS
   ===================== */
router.get('/sales-analytics', (req, res) =>
  adminController.getSalesAnalytics(req, res)
);

/* =====================
   ALERTS
   ===================== */
router.get('/alerts', (req, res) =>
  adminController.getAlerts(req, res)
);

/* =====================
   EXPIRING BATCHES
   ===================== */
router.get('/expiring-batches', (req, res) =>
  adminController.getExpiringBatches(req, res)
);

/* =====================
   RECALL BATCH
   ===================== */
router.post('/recall-batch/:batchNumber', (req, res) =>
  adminController.recallBatch(req, res)
);

module.exports = router;

