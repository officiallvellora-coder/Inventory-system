/* AUTO CREATE MAIN ADMIN */
db.get(
  "SELECT id FROM users WHERE role = 'admin'",
  async (err, row) => {
    if (err) return console.error(err);

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
          if (err) console.error('Admin creation error:', err);
          else console.log('Main Admin auto-created');
        }
      );
    }
  }
);
