import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function RetailerDashboard() {
  const token = localStorage.getItem('token');
  const userId = JSON.parse(atob(token.split('.')[1])).id;

  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadInventory();
    // eslint-disable-next-line
  }, []);

  const loadInventory = async () => {
    const res = await axios.get(
      `${API_URL}/retailer/inventory/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInventory(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={header}>
        <h1>VELLORA HYBRID SYSTEM</h1>
        <button onClick={logout} style={logoutBtn}>Logout</button>
      </div>

      <h2>My Inventory</h2>

      {inventory.length === 0 ? (
        <p>No inventory assigned</p>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, idx) => (
              <tr key={idx}>
                <td>{item.batchNumber}</td>
                <td>{item.expiryDate}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ===== STYLES ===== */

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20
};

const logoutBtn = {
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 4,
  cursor: 'pointer'
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};
