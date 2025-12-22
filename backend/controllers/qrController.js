const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

/*
SINGLE QR – MULTI ROLE FLOW

Flow:
ADMIN -> SUPERSTOCKIST -> DISTRIBUTOR -> RETAILER -> CUSTOMER

QR is locked ONLY after customer scan.
*/

const qrController = {

  /* =========================
     UNIVERSAL QR SCAN
     ========================= */
  scanQR(req, res) {
    const {
      qrCode,
      role,               // superstockist | distributor | retailer | customer
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

          db.get(
            `SELECT * FROM products WHERE id = ?`,
            [qr.productId],
            (err, product) => {
              if (err || !product) {
                db.run('ROLLBACK');
                return res.status(400).json({ error: 'Product not found' });
              }

              /* ===== ROLE VALIDATION ===== */
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

              /* ===== INVENTORY DEDUCTION ===== */
              if (role !== 'customer') {
                db.run(
                  `UPDATE inventory 
                   SET quantity = quantity - 1 
                   WHERE productId = ? AND quantity > 0`,
                  [qr.productId]
                );

                db.run(
                  `INSERT INTO inventory 
                   (id, userId, productId, quantity, lastUpdated)
                   VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
                  [uuidv4(), role, qr.productId]
                );
              }

              /* ===== CUSTOMER SALE ===== */
              if (role === 'customer') {
                db.run(
                  `UPDATE inventory 
                   SET quantity = quantity - 1 
                   WHERE productId = ? AND quantity > 0`,
                  [qr.productId]
                );

                db.run(
                  `UPDATE products SET status = 'sold' WHERE id = ?`,
                  [qr.productId]
                );

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

              /* ===== UPDATE QR STAGE ===== */
              const nextStage = role === 'customer'
                ? 'SOLD'
                : role.toUpperCase();

              db.run(
                `UPDATE qrcodes SET scannedStage = ? WHERE id = ?`,
                [nextStage, qr.id]
              );

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
        }
      );
    });
  }
};

module.exports = qrController;
