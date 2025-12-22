const express = require('express');
const { db } = require('../db');
const inventoryController = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/*
  RETAILER RULES:
  - Retailer does NOT generate QRs
  - Retailer only receives inventory
  - Retailer inventory is tracked strictly
*/

// Add inventory to retailer (from distributor)
router.post('/add-inventory', auth, inventoryController.addInventory);

// Get retailer inventory
router.get('/inventory/:userId', auth, (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT i.*, 
            p.batchNumber, 
            p.expiryDate
     FROM inventory i
     LEFT JOIN products p ON i.productId = p.id
     WHERE i.userId = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;