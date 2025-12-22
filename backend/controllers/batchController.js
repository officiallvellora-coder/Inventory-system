const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

const batchController = {
  // Check for batches expiring within a certain number of days
  checkExpiringBatches: async (days = 30) => {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    const expiringProducts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, batchNumber, expiryDate, retailerId FROM products
         WHERE expiryDate <= ? AND expiryDate > ? AND status = 'in_inventory'`,
        [futureDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0]],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const expiringBoxes = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, batchNumber, expiryDate, currentHolder FROM boxes
         WHERE expiryDate <= ? AND expiryDate > ? AND status = 'in_transit'`,
        [futureDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0]],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    return { expiringProducts, expiringBoxes };
  },

  // Generate alerts for expiring batches
  generateAlerts: async (expiringProducts, expiringBoxes) => {
    const alerts = [];

    // Get admin user
    const admin = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE role = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!admin) return;

    // Alerts for products
    for (const product of expiringProducts) {
      const alertId = uuidv4();
      const message = `Product ${product.name} (Batch: ${product.batchNumber}) is expiring on ${product.expiryDate}.`;
      alerts.push({ id: alertId, userId: admin.id, type: 'expiring_batch', message });

      await new Promise((resolve, reject) => {
        db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
          [alertId, admin.id, 'expiring_batch', message], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Also alert the retailer if available
      if (product.retailerId) {
        const retailerAlertId = uuidv4();
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
            [retailerAlertId, product.retailerId, 'expiring_batch', message], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }

    // Alerts for boxes
    for (const box of expiringBoxes) {
      const alertId = uuidv4();
      const message = `Box (Batch: ${box.batchNumber}) is expiring on ${box.expiryDate}.`;
      alerts.push({ id: alertId, userId: admin.id, type: 'expiring_batch', message });

      await new Promise((resolve, reject) => {
        db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
          [alertId, admin.id, 'expiring_batch', message], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Alert the current holder
      if (box.currentHolder) {
        const holderAlertId = uuidv4();
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
            [holderAlertId, box.currentHolder, 'expiring_batch', message], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }

    return alerts;
  },

  // Check if a product is expired
  isExpired: (expiryDate) => {
    const currentDate = new Date();
    const expDate = new Date(expiryDate);
    return expDate < currentDate;
  },

  // Recall a batch
  recallBatch: async (batchNumber) => {
    // Update products in the batch
    await new Promise((resolve, reject) => {
      db.run('UPDATE products SET status = ? WHERE batchNumber = ?',
        ['recalled', batchNumber], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Update boxes in the batch
    await new Promise((resolve, reject) => {
      db.run('UPDATE boxes SET status = ? WHERE batchNumber = ?',
        ['recalled', batchNumber], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Generate alert for recall
    const admin = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE role = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (admin) {
      const alertId = uuidv4();
      const message = `Batch ${batchNumber} has been recalled. All products and boxes in this batch are no longer available for sale.`;
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
          [alertId, admin.id, 'batch_recall', message], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    return { message: `Batch ${batchNumber} recalled successfully` };
  }
};

module.exports = batchController;