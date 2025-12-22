const express = require('express');
const { db } = require('../db');
const qrController = require('../controllers/qrController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/*
  SUPER-STOCKIST RULES:
  - View distributors
  - Generate BOX + PRODUCT QRs
  - View downstream stock
*/

// Get all distributors under this super-stockist
router.get('/distributors/:superStockistId', auth, (req, res) => {
  const { superStockistId } = req.params;

  db.all(
    `SELECT id, name, phone, location, pincode, status
     FROM users
     WHERE role = 'distributor' AND parentId = ?`,
    [superStockistId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// View stock movement under super-stockist
router.get('/stock-movement/:superStockistId', auth, (req, res) => {
  const { superStockistId } = req.params;

  db.all(
    `
    SELECT
      u.id,
      u.name,
      u.role,
      IFNULL(SUM(i.quantity), 0) AS totalStock,
      MAX(i.lastUpdated) AS lastUpdated
    FROM users u
    LEFT JOIN inventory i ON i.userId = u.id
    WHERE u.id = ? OR u.parentId = ?
    GROUP BY u.id
    `,
    [superStockistId, superStockistId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Generate BOX + PRODUCT QRs
router.post('/generate-box', auth, qrController.generateBoxWithProducts);

module.exports = router;
