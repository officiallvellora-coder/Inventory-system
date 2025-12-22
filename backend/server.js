const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initializeDatabase();

/* =========================
   AUTO CREATE MAIN ADMIN
   ========================= */
db.get(
  "SELECT id FROM users WHERE role = 'admin'",
  async (err, row) => {
    if (err) {
      console.error('Admin check error:', err);
      return;
    }

    if (!row) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      db.run(
        `INSERT INTO users (id, name, email, password, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'admin-001',
          'Main Admin',
          'admin@inventory.com',
          hashedPassword,
          'admin',
          'active'
        ],
        (err) => {
          if (err) {
            console.error('Admin creation error:', err);
          } else {
            console.log('Main Admin auto-created');
          }
        }
      );
    }
  }
);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/super-stockist', require('./routes/superStockist'));
app.use('/api/distributor', require('./routes/distributor'));
app.use('/api/retailer', require('./routes/retailer'));
app.use('/api/customer', require('./routes/customer'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
