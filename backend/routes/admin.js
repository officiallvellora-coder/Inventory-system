const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

/* =====================
   PROTECT ALL ADMIN ROUTES
   ===================== */
router.use(auth);
router.use(adminAuth);

/* =====================
   USERS
   ===================== */
router.get('/users', (req, res) => {
  adminController.getUsers(req, res);
});

/* =====================
   PENDING USERS (APPROVALS)
   ===================== */
router.get('/pending-users', (req, res) => {
  adminController.getPendingUsers(req, res);
});

router.post('/approve-user/:id', (req, res) => {
  adminController.approveUser(req, res);
});

router.delete('/reject-user/:id', (req, res) => {
  adminController.rejectUser(req, res);
});

/* =====================
   INVENTORY OVERVIEW (CARDS)
   ===================== */
router.get('/inventory-overview', (req, res) => {
  adminController.getInventoryOverview(req, res);
});

/* =====================
   ALERTS
   ===================== */
router.get('/alerts', (req, res) => {
  adminController.getAlerts(req, res);
});

/* =====================
   SALES ANALYTICS
   ===================== */
router.get('/sales-analytics', (req, res) => {
  adminController.getSalesAnalytics(req, res);
});

/* =====================
   EXPIRING BATCHES
   ===================== */
router.get('/expiring-batches', (req, res) => {
  adminController.getExpiringBatches(req, res);
});

/* =====================
   RECALL BATCH
   ===================== */
router.post('/recall-batch/:batchNumber', (req, res) => {
  adminController.recallBatch(req, res);
});

module.exports = router;
