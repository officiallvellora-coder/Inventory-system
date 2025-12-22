const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

/*
  INVENTORY RULES (LOCKED):
  - Inventory can never go negative
  - Every change is logged
  - Transfers are atomic
*/

const inventoryController = {

  /* =====================
     ADD INVENTORY
     ===================== */
  addInventory(req, res) {
    const { userId, productId, boxId, quantity } = req.body;

    if (!userId || (!productId && !boxId) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const field = productId ? 'productId' : 'boxId';
    const value = productId || boxId;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        `SELECT * FROM inventory WHERE userId = ? AND ${field} = ?`,
        [userId, value],
        (err, row) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          if (row) {
            const newQty = row.quantity + quantity;

            db.run(
              `UPDATE inventory SET quantity = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?`,
              [newQty, row.id]
            );
          } else {
            db.run(
              `INSERT INTO inventory (id, userId, productId, boxId, quantity, lastUpdated)
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [uuidv4(), userId, productId || null, boxId || null, quantity]
            );
          }

          logTransaction(userId, productId, boxId, 'ADD', quantity, null, null);

          db.run('COMMIT', err => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Inventory added successfully' });
          });
        }
      );
    });
  },

  /* =====================
     TRANSFER INVENTORY
     ===================== */
  transferInventory(req, res) {
    const { fromUserId, toUserId, productId, boxId, quantity } = req.body;

    if (!fromUserId || !toUserId || (!productId && !boxId) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const field = productId ? 'productId' : 'boxId';
    const value = productId || boxId;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        `SELECT * FROM inventory WHERE userId = ? AND ${field} = ?`,
        [fromUserId, value],
        (err, fromRow) => {
          if (err || !fromRow || fromRow.quantity < quantity) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient stock' });
          }

          const remaining = fromRow.quantity - quantity;

          db.run(
            `UPDATE inventory SET quantity = ? WHERE id = ?`,
            [remaining, fromRow.id]
          );

          db.get(
            `SELECT * FROM inventory WHERE userId = ? AND ${field} = ?`,
            [toUserId, value],
            (err, toRow) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              if (toRow) {
                db.run(
                  `UPDATE inventory SET quantity = ? WHERE id = ?`,
                  [toRow.quantity + quantity, toRow.id]
                );
              } else {
                db.run(
                  `INSERT INTO inventory (id, userId, productId, boxId, quantity, lastUpdated)
                   VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                  [uuidv4(), toUserId, productId || null, boxId || null, quantity]
                );
              }

              logTransaction(fromUserId, productId, boxId, 'TRANSFER', quantity, fromUserId, toUserId);
              checkLowStock(fromUserId, productId, boxId, remaining);

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
  },

  /* =====================
     DEDUCT INVENTORY
     ===================== */
  deductInventory(req, res) {
    const { userId, productId, boxId, quantity } = req.body;

    if (!userId || (!productId && !boxId) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const field = productId ? 'productId' : 'boxId';
    const value = productId || boxId;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        `SELECT * FROM inventory WHERE userId = ? AND ${field} = ?`,
        [userId, value],
        (err, row) => {
          if (err || !row || row.quantity < quantity) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient stock' });
          }

          const newQty = row.quantity - quantity;

          db.run(
            `UPDATE inventory SET quantity = ? WHERE id = ?`,
            [newQty, row.id]
          );

          logTransaction(userId, productId, boxId, 'SALE', quantity, null, null);
          checkLowStock(userId, productId, boxId, newQty);

          db.run('COMMIT', err => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Inventory deducted successfully' });
          });
        }
      );
    });
  }
};

/* =====================
   HELPERS
   ===================== */

function logTransaction(userId, productId, boxId, type, quantity, fromUserId, toUserId) {
  db.run(
    `INSERT INTO inventory_transactions
     (id, userId, productId, boxId, type, quantity, fromUserId, toUserId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [uuidv4(), userId, productId || null, boxId || null, type, quantity, fromUserId, toUserId]
  );
}

function checkLowStock(userId, productId, boxId, quantity) {
  if (quantity > 5) return;

  const label = productId ? `Product ${productId}` : `Box ${boxId}`;
  const message = `Low stock alert: ${label} has ${quantity} remaining`;

  db.run(
    `INSERT INTO alerts (id, userId, type, message, createdAt)
     VALUES (?, ?, 'low_stock', ?, CURRENT_TIMESTAMP)`,
    [uuidv4(), userId, message]
  );
}

module.exports = inventoryController;