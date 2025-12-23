const { db } = require('../db');

const adminController = {

  /* =====================
     ALL USERS
     ===================== */
  getUsers(req, res) {
    db.all(
      `SELECT id, name, email, role, location, status, createdAt
       FROM users
       ORDER BY createdAt DESC`,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  /* =====================
     PENDING USERS
     ===================== */
  getPendingUsers(req, res) {
    db.all(
      `SELECT id, name, email, role, location, createdAt
       FROM users WHERE status = 'pending'`,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  approveUser(req, res) {
    db.run(
      `UPDATE users SET status = 'active' WHERE id = ?`,
      [req.params.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User approved' });
      }
    );
  },

  rejectUser(req, res) {
    db.run(
      `DELETE FROM users WHERE id = ? AND status = 'pending'`,
      [req.params.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User rejected' });
      }
    );
  },

  /* =====================
     INVENTORY OVERVIEW
     ===================== */
  getInventoryOverview(req, res) {
    db.all(
      `
      SELECT u.role,
             IFNULL(SUM(i.quantity),0) AS totalQuantity,
             SUM(CASE WHEN i.quantity <= 5 THEN 1 ELSE 0 END) AS lowStockItems
      FROM users u
      LEFT JOIN inventory i ON i.userId = u.id
      GROUP BY u.role
      `,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  /* =====================
     ALERTS
     ===================== */
  getAlerts(req, res) {
    db.all(
      `
      SELECT u.name, u.role, SUM(i.quantity) AS stock,
             'Low stock alert' AS message
      FROM inventory i
      JOIN users u ON u.id = i.userId
      GROUP BY i.userId
      HAVING stock <= 5
      `,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  /* =====================
     SALES ANALYTICS
     ===================== */
  getSalesAnalytics(req, res) {
    db.all(
      `
      SELECT DATE(scannedAt) AS date,
             COUNT(*) AS totalSales
      FROM sales
      GROUP BY DATE(scannedAt)
      ORDER BY date DESC
      `,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  /* =====================
     EXPIRING BATCHES
     ===================== */
  getExpiringBatches(req, res) {
    db.all(
      `
      SELECT id, batchNumber, expiryDate
      FROM products
      WHERE expiryDate <= date('now', '+30 days')
      `,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  /* =====================
     RECALL BATCH
     ===================== */
  recallBatch(req, res) {
    const { batchNumber } = req.params;

    db.run(
      `UPDATE products SET status = 'recalled' WHERE batchNumber = ?`,
      [batchNumber],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Batch recalled successfully' });
      }
    );
  }
};

module.exports = adminController;
