const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

/*
SINGLE QR – MULTI ROLE FLOW (LOCKED)

One UNIT QR per product.

Scan order:
1. Distributor scans  → deduct from ADMIN → add to DISTRIBUTOR
2. Retailer scans     → deduct from DISTRIBUTOR → add to RETAILER
3. Customer scans     → deduct from RETAILER → mark SOLD

QR becomes permanently locked only after CUSTOMER scan.
Registration form is mandatory on EVERY scan.
*/

const qrController = {

  /* =========================
     GENERATE BOX + SINGLE UNIT QRs
     ========================= */
  generateBoxWithProducts(req, res) {
    const { batchNumber, expiryDate, superStockistId, productId } = req.body;

    if (!batchNumber || !expiryDate || !superStockistId || !productId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const boxId = uuidv4();

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        `INSERT INTO boxes (id, batchNumber, expiryDate, currentHolder, status)
         VALUES (?, ?, ?, ?, 'in_inventory')`,
        [boxId, batchNumber, expiryDate, superStockistId]
      );

      const units = [];

      for (let i = 0; i < 12; i++) {
        const unitId = uuidv4();
        const unitQR = `UNIT-${unitId}`;

        units.push({ unitId, unitQR });

        db.run(
          `INSERT INTO products (id, masterProductId, batchNumber, expiryDate, boxId, status)
           VALUES (?, ?, ?, ?, ?, 'created')`,
          [unitId, productId, batchNumber, expiryDate, boxId]
        );

        db.run(
          `INSERT INTO qrcodes (id, code, productId, scannedStage)
           VALUES (?, ?, ?, 'NONE')`,
          [uuidv4(), unitQR, unitId]
        );
      }

      db.run('COMMIT', err => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: 'Box and single-unit QRs generated',
          boxId,
          units
        });
      });
    });
  },

  /* =========================
     UNIVERSAL QR SCAN (ALL ROLES)
     ========================= */
  scanQR(req, res) {
    const {
      qrCode,
      role,          // 'distributor' | 'retailer' | 'customer'
      shopName,
      ownerName,
      mobile,
      location,
      pincode
    } = req.body;

    if (!qrCode || !role || !shopName || !ownerName || !mobile || !location) {
      return res.status(400).json({ error: 'Invalid registration data' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        `SELECT q.*, p.status
         FROM qrcodes q
         JOIN products p ON q.productId = p.id
         WHERE q.code = ?`,
        [qrCode],
        (err, qr) => {
          if (err || !qr) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Invalid QR' });
          }

          const stage = qr.scannedStage;

          /* ---------- DISTRIBUTOR SCAN ---------- */
          if (role === 'distributor') {
            if (stage !== 'NONE') {
              db.run('ROLLBACK');
              return res.status(400).json({ error: 'QR already processed at this stage' });
            }

            deductInventory('ADMIN', qr.productId);
            addInventory('DISTRIBUTOR', qr.productId);

            db.run(
              `UPDATE qrcodes SET scannedStage = 'DISTRIBUTOR' WHERE id = ?`,
              [qr.id]
            );

            logScan(qr.productId, role, shopName, ownerName, mobile, location, pincode);

            commit(res, 'Distributor scan successful');
            return;
          }

          /* ---------- RETAILER SCAN ---------- */
          if (role === 'retailer') {
            if (stage !== 'DISTRIBUTOR') {
              db.run('ROLLBACK');
              return res.status(400).json({ error: 'QR not ready for retailer scan' });
            }

            deductInventory('DISTRIBUTOR', qr.productId);
            addInventory('RETAILER', qr.productId);

            db.run(
              `UPDATE qrcodes SET scannedStage = 'RETAILER' WHERE id = ?`,
              [qr.id]
            );

            logScan(qr.productId, role, shopName, ownerName, mobile, location, pincode);

            commit(res, 'Retailer scan successful');
            return;
          }

          /* ---------- CUSTOMER SCAN ---------- */
          if (role === 'customer') {
            if (stage !== 'RETAILER') {
              db.run('ROLLBACK');
              return res.status(400).json({ error: 'QR not ready for customer scan' });
            }

            deductInventory('RETAILER', qr.productId);

            db.run(
              `UPDATE products SET status = 'sold' WHERE id = ?`,
              [qr.productId]
            );

            db.run(
              `UPDATE qrcodes SET scannedStage = 'SOLD', lockedAt = CURRENT_TIMESTAMP WHERE id = ?`,
              [qr.id]
            );

            logScan(qr.productId, role, shopName, ownerName, mobile, location, pincode);

            commit(res, 'Customer scan completed. Product sold.');
            return;
          }

          db.run('ROLLBACK');
          res.status(400).json({ error: 'Invalid role' });
        }
      );
    });
  }
};

/* =========================
   HELPERS
   ========================= */

function deductInventory(ownerType, productId) {
  db.run(
    `INSERT INTO inventory_transactions
     (id, ownerType, productId, action, createdAt)
     VALUES (?, ?, ?, 'DEDUCT', CURRENT_TIMESTAMP)`,
    [uuidv4(), ownerType, productId]
  );
}

function addInventory(ownerType, productId) {
  db.run(
    `INSERT INTO inventory_transactions
     (id, ownerType, productId, action, createdAt)
     VALUES (?, ?, ?, 'ADD', CURRENT_TIMESTAMP)`,
    [uuidv4(), ownerType, productId]
  );
}

function logScan(productId, role, shopName, ownerName, mobile, location, pincode) {
  db.run(
    `INSERT INTO scans
     (id, productId, role, shopName, ownerName, mobile, location, pincode, scannedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [uuidv4(), productId, role, shopName, ownerName, mobile, location, pincode || null]
  );
}

function commit(res, message) {
  db.run('COMMIT', err => {
    if (err) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: err.message });
    }
    res.json({ message });
  });
}

module.exports = qrController;