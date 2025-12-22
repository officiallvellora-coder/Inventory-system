const express = require('express');
const qrController = require('../controllers/qrController');

const router = express.Router();

/*
Universal scan endpoint
Used by:
- Distributor
- Retailer
- Customer
*/

router.post('/scan', qrController.scanQR);

module.exports = router;