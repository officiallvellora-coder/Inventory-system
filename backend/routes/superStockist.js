const express = require('express');
const { db } = require('../db');
const qrController = require('../controllers/qrController');
const inventoryController = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/*
  SUPER-STOCKIST RULES:
  - Can view own distributors
  - Can generate BOX + PRODUCT QRs
  - Can transfer inventory to distributors
  - Has full visibility of downstream stock
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

// Transfer inventory to distributor
router.post('/transfer-inventory', auth, inventoryController.transferInventory);

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

// Generate BOX + PRODUCT QRs (12 units per box)
router.post('/generate-box', auth, qrController.generateBoxWithProducts);

module.exports = router;