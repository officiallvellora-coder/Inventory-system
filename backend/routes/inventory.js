const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

/*
INVENTORY ROUTES
- Admin: view / create / update inventory
- Distributor & Retailer: transfer handled separately
*/

/* =====================
   ADMIN INVENTORY VIEW
   ===================== */
router.get(
  '/',
  auth,
  adminAuth,
  (req, res) => inventoryController.listInventory(req, res)
);

/* =====================
   ADMIN CREATE PRODUCT
   ===================== */
router.post(
  '/',
  auth,
  adminAuth,
  (req, res) => inventoryController.createProduct(req, res)
);

/* =====================
   ADMIN UPDATE QUANTITY
   ===================== */
router.put(
  '/:productId',
  auth,
  adminAuth,
  (req, res) => inventoryController.updateQuantity(req, res)
);

module.exports = router;
