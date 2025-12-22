/* AUTO CREATE MAIN ADMIN */
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
        `INSERT INTO users 
        (id, email, password, name, phone, location, pincode, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin-001',
          'admin@inventory.com',
          hashedPassword,
          'Main Admin',
          '9999999999',
          'HQ',
          '000000',
          'admin',
          'active'
        ],
        (err) => {
          if (err) console.error('Admin creation error:', err);
          else console.log('Main Admin auto-created');
        }
      );
    }
  }
);
