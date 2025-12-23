const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

router.use(auth);
router.use(adminAuth);

router.get('/', inventoryController.listInventory);
router.put('/update/:productId', inventoryController.updateQuantity);

module.exports = router;
