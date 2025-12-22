const { db } = require('../db');
const batchController = require('./batchController');

const adminController = {

  /* =====================
     USERS & HIERARCHY
     ===================== */
  getUsers(req, res) {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.location, u.pincode,
             u.role, u.parentId, u.referralCode, u.status, u.createdAt,
             p.name AS parentName
      FROM users u
      LEFT JOIN users p ON u.parentId = p.id
      ORDER BY u.role, u.createdAt DESC
    `;
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },

  /* =====================
     INVENTORY OVERVIEW (CARDS)
     ===================== */
  getInventoryOverview(req, res) {
    const query = `
      SELECT u.role,
             IFNULL(SUM(i.quantity), 0) AS totalQuantity,
             SUM(CASE WHEN i.quantity <= 5 THEN 1 ELSE 0 END) AS lowStockItems
      FROM users u
      LEFT JOIN inventory i ON i.userId = u.id
      GROUP BY u.role
      ORDER BY u.role
    `;
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },

  /* =====================
     INVENTORY SHOWCASE (TABLE)
     ===================== */
  getInventoryShowcase(req, res) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.batchNumber,
        p.expiryDate,
        u.name AS holderName,
        u.role AS holderRole,
        i.quantity
      FROM inventory i
      JOIN products p ON p.id = i.productId
      JOIN users u ON u.id = i.userId
      ORDER BY p.expiryDate ASC
    `;
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },

  /* =====================
     SALES ANALYTICS
     ===================== */
  getSalesAnalytics(req, res) {
    const dailyQuery = `
      SELECT DATE(scannedAt) AS date, COUNT(*) AS totalScans
      FROM sales
      WHERE scannedAt >= date('now', '-30 days')
      GROUP BY DATE(scannedAt)
      ORDER BY date DESC
    `;
    db.all(dailyQuery, (err, daily) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ daily });
    });
  },

  /* =====================
     ALERTS
     ===================== */
  getAlerts(req, res) {
    const lowStockQuery = `
      SELECT u.name, u.role, u.location,
             SUM(i.quantity) AS currentStock,
             'Low stock alert' AS message
      FROM inventory i
      JOIN users u ON u.id = i.userId
      GROUP BY i.userId
      HAVING currentStock <= 5
    `;
    const expiringQuery = `
      SELECT batchNumber, expiryDate,
             'Product expiring soon' AS message
      FROM products
      WHERE expiryDate <= date('now', '+30 days')
    `;
    db.all(lowStockQuery, (err, lowStock) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all(expiringQuery, (err, expiring) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json([...lowStock, ...expiring]);
      });
    });
  },

  /* =====================
     EXPIRY / RECALL
     ===================== */
  async getExpiringBatches(req, res) {
    try {
      const data = await batchController.checkExpiringBatches();
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Failed' });
    }
  },

  async recallBatch(req, res) {
    try {
      const result = await batchController.recallBatch(req.params.batchNumber);
      res.json(result);
    } catch {
      res.status(500).json({ error: 'Recall failed' });
    }
  }
};

module.exports = adminController;
