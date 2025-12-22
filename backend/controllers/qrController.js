const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const qrController = {

  /* =========================
     GENERATE BOX (SAFE PLACEHOLDER)
     ========================= */
  generateBoxWithProducts(req, res) {
    // Prevent Express crash
    return res.json({
      message: 'Box generation endpoint is active',
      status: 'OK'
    });
  },

  /* =========================
     UNIVERSAL QR SCAN
     ========================= */
  scanQR(req, res) {
    const {
      qrCode,
      role,
      name,
      mobile,
      location,
      pincode
    } = req.body;

    if (!qrCode || !role || !name || !mobile || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        `SELECT * FROM qrcodes WHERE code = ?`,
        [qrCode],
        (err, qr) => {
          if (err || !qr) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Invalid QR code' });
          }

          if (qr.scannedStage === 'SOLD') {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'QR already used' });
          }

          const validFlow = {
            superstockist: 'NONE',
            distributor: 'SUPERSTOCKIST',
            retailer: 'DISTRIBUTOR',
            customer: 'RETAILER'
          };

          if (qr.scannedStage !== validFlow[role]) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Invalid scan order' });
          }

          const nextStage = role === 'customer'
            ? 'SOLD'
            : role.toUpperCase();

          db.run(
            `UPDATE qrcodes SET scannedStage = ? WHERE id = ?`,
            [nextStage, qr.id]
          );

          if (role === 'customer') {
            db.run(
              `INSERT INTO sales
               (id, productId, customerName, customerMobile, customerLocation, customerPincode, scannedAt)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [
                uuidv4(),
                qr.productId,
                name,
                mobile,
                location,
                pincode || null
              ]
            );
          }

          db.run('COMMIT', err => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            res.json({
              message: `${role} scan successful`,
              productId: qr.productId,
              status: nextStage
            });
          });
        }
      );
    });
  }
};

module.exports = qrController;
