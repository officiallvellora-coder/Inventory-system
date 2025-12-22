const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

router.use(auth);
router.use(adminAuth);

/* USERS */
router.get('/users', adminController.getUsers);
router.get('/pending-users', adminController.getPendingUsers);
router.post('/approve-user/:id', adminController.approveUser);
router.delete('/reject-user/:id', adminController.rejectUser);

/* INVENTORY */
router.get('/inventory', inventoryController.listInventory);
router.post('/products', inventoryController.createProduct);
router.put('/inventory/:productId', inventoryController.updateQuantity);

/* ANALYTICS */
router.get('/inventory-overview', adminController.getInventoryOverview);
router.get('/alerts', adminController.getAlerts);

module.exports = router;
