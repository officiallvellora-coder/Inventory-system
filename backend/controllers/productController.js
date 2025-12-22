const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { db } = require('../db');

/*
ROLES FLOW
Admin -> SuperStockist -> Distributor -> Retailer -> Customer
*/

const productController = {

  /* =========================
     CREATE PRODUCT + QR
     ========================= */
  async createProduct(req, res) {
    const {
      name,
      sku,
      batchNumber,
      expiryDate,
      quantity,
      holderId   // superstockist / distributor / retailer
    } = req.body;

    if (!name || !sku || !quantity || !holderId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    db.serialize(async () => {
      db.run('BEGIN TRANSACTION');

      try {
        for (let i = 0; i < quantity; i++) {
          const productId = uuidv4();

          const qrPayload = {
            type: 'PRODUCT',
            productId
          };

          const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

          db.run(
            `INSERT INTO products 
             (id, name, sku, batchNumber, expiryDate, retailerQR, status)
             VALUES (?, ?, ?, ?, ?, ?, 'in_inventory')`,
            [
              productId,
              name,
              `${sku}-${i + 1}`,
              batchNumber || null,
              expiryDate || null,
              qrCode
            ]
          );

          db.run(
            `INSERT INTO inventory 
             (id, userId, productId, quantity, lastUpdated)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              uuidv4(),
              holderId,
              productId,
              1
            ]
          );
        }

        db.run('COMMIT');
        res.json({ message: 'Products created and inventory added' });

      } catch (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
      }
    });
  },

  /* =========================
     CREATE BOX (12 UNITS)
     ========================= */
  async createBox(req, res) {
    const {
      name,
      sku,
      batchNumber,
      expiryDate,
      holderId
    } = req.body;

    if (!name || !sku || !holderId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const boxId = uuidv4();

    const boxQR = await QRCode.toDataURL(
      JSON.stringify({ type: 'BOX', boxId })
    );

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        db.run(
          `INSERT INTO boxes
           (id, boxQR, productCount, batchNumber, expiryDate, currentHolder, status)
           VALUES (?, ?, 12, ?, ?, ?, 'in_inventory')`,
          [boxId, boxQR, batchNumber || null, expiryDate || null, holderId]
        );

        for (let i = 0; i < 12; i++) {
          const productId = uuidv4();

          db.run(
            `INSERT INTO products
             (id, name, sku, batchNumber, expiryDate, boxId, status)
             VALUES (?, ?, ?, ?, ?, ?, 'in_inventory')`,
            [
              productId,
              name,
              `${sku}-${i + 1}`,
              batchNumber || null,
              expiryDate || null,
              boxId
            ]
          );

          db.run(
            `INSERT INTO inventory
             (id, userId, productId, quantity, lastUpdated)
             VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
            [uuidv4(), holderId, productId]
          );
        }

        db.run('COMMIT');
        res.json({
          message: 'Box created with 12 products',
          boxId,
          boxQR
        });

      } catch (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
      }
    });
  }

};

module.exports = productController;
