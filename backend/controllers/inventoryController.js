const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

/*
INVENTORY CONTROLLER
- Admin inventory control
- Super-Stockist / Distributor inventory transfer
*/

const inventoryController = {

  /* =====================
     LIST INVENTORY (ADMIN)
     ===================== */
  listInventory(req, res) {
    db.all(
      `
      SELECT 
        p.id AS productId,
        p.name,
        p.sku,
        p.batchNumber,
        p.expiryDate,
        u.name AS holder,
        u.role,
        IFNULL(i.quantity, 0) AS quantity
      FROM products p
      LEFT JOIN inventory i ON i.productId = p.id
      LEFT JOIN users u ON u.id = i.userId
      ORDER BY p.createdAt DESC
      `,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  /* =====================
     CREATE PRODUCT (ADMIN)
     ===================== */
  createProduct(req, res) {
    const { name, sku, batchNumber, expiryDate, quantity } = req.body;

    if (!name || !sku || !batchNumber || !expiryDate || quantity == null) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const productId = uuidv4();

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        `INSERT INTO products (id, name, sku, batchNumber, expiryDate, status)
         VALUES (?, ?, ?, ?, ?, 'in_inventory')`,
        [productId, name, sku, batchNumber, expiryDate]
      );

      db.run(
        `INSERT INTO inventory (id, userId, productId, quantity, lastUpdated)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [uuidv4(), 'admin', productId, quantity]
      );

      db.run('COMMIT', err => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product created successfully' });
      });
    });
  },

  /* =====================
     UPDATE INVENTORY QTY (ADMIN)
     ===================== */
  updateQuantity(req, res) {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity == null) {
      return res.status(400).json({ error: 'Quantity required' });
    }

    db.run(
      `UPDATE inventory
       SET quantity = ?, lastUpdated = CURRENT_TIMESTAMP
       WHERE productId = ?`,
      [quantity, productId],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Quantity updated successfully' });
      }
    );
  },

  /* =====================
     TRANSFER INVENTORY
     (Super-Stockist → Distributor
      Distributor → Retailer)
     ===================== */
  transferInventory(req, res) {
    const { fromUserId, toUserId, productId, quantity } = req.body;

    if (!fromUserId || !toUserId || !productId || !quantity) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        `SELECT quantity FROM inventory
         WHERE userId = ? AND productId = ?`,
        [fromUserId, productId],
        (err, row) => {
          if (err || !row || row.quantity < quantity) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient stock' });
          }

          // Deduct from sender
          db.run(
            `UPDATE inventory
             SET quantity = quantity - ?, lastUpdated = CURRENT_TIMESTAMP
             WHERE userId = ? AND productId = ?`,
            [quantity, fromUserId, productId]
          );

          // Add to receiver
          db.get(
            `SELECT id FROM inventory
             WHERE userId = ? AND productId = ?`,
            [toUserId, productId],
            (err, existing) => {
              if (existing) {
                db.run(
                  `UPDATE inventory
                   SET quantity = quantity + ?, lastUpdated = CURRENT_TIMESTAMP
                   WHERE userId = ? AND productId = ?`,
                  [quantity, toUserId, productId]
                );
              } else {
                db.run(
                  `INSERT INTO inventory
                   (id, userId, productId, quantity, lastUpdated)
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                  [uuidv4(), toUserId, productId, quantity]
                );
              }

              db.run('COMMIT', err => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Inventory transferred successfully' });
              });
            }
          );
        }
      );
    });
  }
};

module.exports = inventoryController;
