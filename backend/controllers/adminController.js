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
     INVENTORY OVERVIEW
     ===================== */
  getInventoryOverview(req, res) {
    const query = `
      SELECT u.id, u.name, u.role, u.location,
             IFNULL(SUM(i.quantity), 0) AS totalQuantity,
             SUM(CASE WHEN i.quantity <= 5 THEN 1 ELSE 0 END) AS lowStockItems
      FROM users u
      LEFT JOIN inventory i ON i.userId = u.id
      GROUP BY u.id
      ORDER BY u.role
    `;

    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },

  /* =====================
     SALES / SCANS ANALYTICS
     ===================== */
  getSalesAnalytics(req, res) {
    const dailyQuery = `
      SELECT DATE(scannedAt) AS date,
             COUNT(*) AS totalScans
      FROM sales
      WHERE scannedAt >= date('now', '-30 days')
      GROUP BY DATE(scannedAt)
      ORDER BY date DESC
    `;

    const productQuery = `
      SELECT p.batchNumber, COUNT(s.id) AS scanCount
      FROM sales s
      JOIN products p ON s.productId = p.id
      GROUP BY p.batchNumber
      ORDER BY scanCount DESC
    `;

    db.all(dailyQuery, (err, daily) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(productQuery, (err, byBatch) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ daily, byBatch });
      });
    });
  },

  /* =====================
     ALERTS
     ===================== */
  getAlerts(req, res) {
    const lowStockQuery = `
      SELECT 'low-stock' AS type,
             u.name,
             u.role,
             u.location,
             SUM(i.quantity) AS currentStock,
             'Low stock alert' AS message
      FROM inventory i
      JOIN users u ON i.userId = u.id
      GROUP BY i.userId
      HAVING currentStock <= 5
    `;

    const expiringQuery = `
      SELECT 'expiring' AS type,
             p.batchNumber,
             p.expiryDate,
             'Product expiring soon' AS message
      FROM products p
      WHERE p.expiryDate <= date('now', '+30 days')
        AND p.expiryDate > date('now')
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
     EXPIRY & RECALL
     ===================== */
  async getExpiringBatches(req, res) {
    try {
      const data = await batchController.checkExpiringBatches();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch expiring batches' });
    }
  },

  async recallBatch(req, res) {
    const { batchNumber } = req.params;

    try {
      const result = await batchController.recallBatch(batchNumber);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Batch recall failed' });
    }
  }
};

module.exports = adminController;