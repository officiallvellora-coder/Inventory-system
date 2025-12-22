const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './inventory.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database opening error: ', err);
  else console.log('Database initialized successfully');
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      pincode TEXT NOT NULL,
      role TEXT NOT NULL,
      parentId TEXT,
      referralCode TEXT UNIQUE,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      batchNumber TEXT,
      expiryDate DATE,
      retailerQR TEXT,
      customerQR TEXT,
      retailerId TEXT,
      boxId TEXT,
      status TEXT DEFAULT 'in_inventory'
    )`);

    // Boxes Table (12 products per box)
    db.run(`CREATE TABLE IF NOT EXISTS boxes (
      id TEXT PRIMARY KEY,
      boxQR TEXT,
      distributorQR TEXT,
      superStockistQR TEXT,
      productCount INTEGER DEFAULT 12,
      batchNumber TEXT,
      expiryDate DATE,
      currentHolder TEXT,
      status TEXT DEFAULT 'in_transit'
    )`);

    // Inventory Table
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productId TEXT,
      boxId TEXT,
      quantity INTEGER,
      lastUpdated DATETIME,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Sales Table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      retailerId TEXT,
      productId TEXT,
      cashbackAmount REAL,
      customerQRCode TEXT,
      scannedAt DATETIME,
      customerName TEXT,
      customerUPI TEXT,
      customerMobile TEXT,
      customerLocation TEXT,
      customerPincode TEXT,
      customerLatitude REAL,
      customerLongitude REAL,
      gpsVerified BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'pending'
    )`);

    // Cashback Ledger
    db.run(`CREATE TABLE IF NOT EXISTS cashbackLedger (
      id TEXT PRIMARY KEY,
      saleId TEXT,
      recipientId TEXT,
      amount REAL,
      role TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (saleId) REFERENCES sales(id)
    )`);

    // Inventory Transactions
    db.run(`CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productId TEXT,
      boxId TEXT,
      type TEXT NOT NULL,
      quantity INTEGER,
      fromUserId TEXT,
      toUserId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Cashback Percentages
    db.run(`CREATE TABLE IF NOT EXISTS cashback_percentages (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      percentage REAL NOT NULL
    )`);

    // Geofence Rules
    db.run(`CREATE TABLE IF NOT EXISTS geofence_rules (
      id TEXT PRIMARY KEY,
      retailerId TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      radius REAL,
      FOREIGN KEY (retailerId) REFERENCES users(id)
    )`);

    // Alerts & Notifications
    db.run(`CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT,
      message TEXT,
      status TEXT DEFAULT 'unread',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Add level column if not exists (for existing databases)
    db.run('ALTER TABLE users ADD COLUMN level INTEGER;', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding level column:', err);
      }
    });

    console.log('All tables created successfully');
  });
};

module.exports = { db, initializeDatabase };