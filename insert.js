const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/inventory.db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const hashedPassword = bcrypt.hashSync('admin123', 10);
const id = uuidv4();
const referralCode = uuidv4();

db.run(
  `INSERT INTO users (id, name, email, password, phone, location, pincode, role, level, referralCode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [id, 'Admin User', 'admin@example.com', hashedPassword, '1234567890', 'Test City', '123456', 'super-stockist', 1, referralCode, 'active'],
  (err) => {
    if (err) console.error(err);
    else console.log('User inserted');
    db.close();
  }
);