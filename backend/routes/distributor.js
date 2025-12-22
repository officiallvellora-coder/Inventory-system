const express = require('express');
const { db } = require('../db');
const inventoryController = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/*
  DISTRIBUTOR RULES:
  - Distributor can view assigned retailers
  - Distributor can transfer inventory to retailers
  - Distributor can track boxes received
*/

// Get all retailers under this distributor
router.get('/retailers/:distributorId', auth, (req, res) => {
  const { distributorId } = req.params;

  db.all(
    `SELECT id, name, phone, location, pincode, status
     FROM users
     WHERE role = 'retailer' AND parentId = ?`,
    [distributorId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Transfer inventory to retailer
router.post('/transfer-inventory', auth, inventoryController.transferInventory);

// Track a box by ID (logistics visibility)
router.get('/track-box/:boxId', auth, (req, res) => {
  const { boxId } = req.params;

  db.get(
    `SELECT id, batchNumber, expiryDate, currentHolder, status
     FROM boxes
     WHERE id = ?`,
    [boxId],
    (err, box) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!box) return res.status(404).json({ error: 'Box not found' });
      res.json(box);
    }
  );
});

module.exports = router;