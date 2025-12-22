const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');
const batchController = require('./batchController');

const cashbackController = {
  scanAndClaimCashback: async (req, res) => {
    const {
      customerQR,
      name,
      upi,
      mobile,
      location,
      pincode,
      latitude,
      longitude
    } = req.body;

    try {
      // Ensure latitude and longitude are provided
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required for geofencing validation.' });
      }

      // Validate customerQR - find product
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE customerQR = ?', [customerQR], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!product) {
        return res.status(400).json({ error: 'Invalid customer QR code' });
      }

      if (product.status !== 'in_inventory') {
        return res.status(400).json({ error: 'Product not available for sale' });
      }

      // Check if product is expired
      if (batchController.isExpired(product.expiryDate)) {
        return res.status(400).json({ error: 'Product has expired and cannot be scanned' });
      }

      const retailerId = product.retailerId;

      // Get retailer details
      const retailer = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [retailerId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!retailer) {
        return res.status(400).json({ error: 'Retailer not found' });
      }

      // Get admin user for alerts
      const admin = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE role = ?', ['admin'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Geofencing validation
      let isVerified = false;
      if (pincode === retailer.pincode) {
        isVerified = true;
      } else {
        const geofence = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM geofence_rules WHERE retailerId = ?', [retailerId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (geofence) {
          const distance = getDistance(latitude, longitude, geofence.latitude, geofence.longitude);
          if (distance <= geofence.radius) {
            isVerified = true;
          } else {
            // Create alert for retailer
            const alertId1 = uuidv4();
            await new Promise((resolve, reject) => {
              db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
                [alertId1, retailerId, 'geofence_violation', `Geofencing validation failed: Customer location is outside the defined radius for retailer ${retailer.name}.`], function(err) {
                if (err) reject(err);
                else resolve();
              });
            });

            // Create alert for admin
            if (admin) {
              const alertId2 = uuidv4();
              await new Promise((resolve, reject) => {
                db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
                  [alertId2, admin.id, 'geofence_violation', `Geofencing validation failed for retailer ${retailer.name} (${retailerId}). Customer location outside geofence.`], function(err) {
                  if (err) reject(err);
                  else resolve();
                });
              });
            }

            return res.status(400).json({ error: 'Customer location is outside the retailer\'s geofence. Claim rejected.' });
          }
        } else {
          // No geofence, pincode didn't match
          const alertId1 = uuidv4();
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
              [alertId1, retailerId, 'pincode_mismatch', `Pincode validation failed: Customer pincode does not match retailer pincode and no geofence defined.`], function(err) {
              if (err) reject(err);
              else resolve();
            });
          });

          if (admin) {
            const alertId2 = uuidv4();
            await new Promise((resolve, reject) => {
              db.run('INSERT INTO alerts (id, userId, type, message) VALUES (?, ?, ?, ?)',
                [alertId2, admin.id, 'pincode_mismatch', `Pincode validation failed for retailer ${retailer.name} (${retailerId}). No geofence defined.`], function(err) {
                if (err) reject(err);
                else resolve();
              });
            });
          }

          return res.status(400).json({ error: 'Pincode does not match and no geofence defined for the retailer. Claim rejected.' });
        }
      }

      const gpsVerified = isVerified ? 1 : 0;

      // Deduct inventory
      await new Promise((resolve, reject) => {
        db.run('UPDATE products SET status = ? WHERE id = ?', ['sold', product.id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Update inventory table
      await new Promise((resolve, reject) => {
        db.run('UPDATE inventory SET quantity = quantity - 1 WHERE userId = ? AND productId = ?',
          [retailerId, product.id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Get cashback percentages
      const percentages = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM cashback_percentages', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const percentageMap = {};
      percentages.forEach(p => {
        percentageMap[p.level] = p.percentage;
      });

      // Assume a base cashback amount, or calculate based on product
      const baseCashback = 10; // This could be from product or config

      // Calculate splits
      const splits = {};
      let currentUser = retailer;
      let totalCashback = 0;

      while (currentUser) {
        const role = currentUser.role;
        const percentage = percentageMap[role] || 0;
        const amount = (baseCashback * percentage) / 100;
        splits[role] = { recipientId: currentUser.id, amount };

        if (currentUser.parentId) {
          currentUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [currentUser.parentId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
        } else {
          currentUser = null;
        }
      }

      // Create sale record
      const saleId = uuidv4();
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO sales (
          id, customerId, retailerId, productId, cashbackAmount, customerQRCode, scannedAt,
          customerName, customerUPI, customerMobile, customerLocation, customerPincode,
          customerLatitude, customerLongitude, gpsVerified, status
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId, null, retailerId, product.id, baseCashback, customerQR,
          name, upi, mobile, location, pincode, latitude, longitude, gpsVerified, 'completed'
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Insert cashback ledger entries
      const ledgerPromises = Object.keys(splits).map(role => {
        const { recipientId, amount } = splits[role];
        const ledgerId = uuidv4();
        return new Promise((resolve, reject) => {
          db.run(`INSERT INTO cashbackLedger (id, saleId, recipientId, amount, role, status)
                  VALUES (?, ?, ?, ?, ?, ?)`,
          [ledgerId, saleId, recipientId, amount, role, 'completed'], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      await Promise.all(ledgerPromises);

      res.json({
        message: 'Cashback claimed successfully',
        saleId,
        totalCashback: baseCashback,
        splits
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Helper function to calculate distance between two points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

module.exports = cashbackController;