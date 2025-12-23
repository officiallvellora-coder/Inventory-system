const express = require('express');
const { db } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

/*
  RETAILER RULES:
  - Retailer does NOT generate QRs
  - Retailer does NOT add inventory manually
  - Inventory comes ONLY via distributor transfer
  - Retailer can VIEW inventory
*/

// Get retailer inventory
router.get('/inventory/:userId', auth, (req, res) => {
  const { userId } = req.params;

  db.all(
    `
    SELECT 
      i.productId,
      i.quantity,
      p.name,
      p.batchNumber,
      p.expiryDate
    FROM inventory i
    JOIN products p ON p.id = i.productId
    WHERE i.userId = ?
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
