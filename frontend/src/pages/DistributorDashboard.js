import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function DistributorDashboard() {
  const [inventory, setInventory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      axios
        .get(`${API_URL}/distributor/inventory/${user.id}`)
        .then((res) => setInventory(res.data))
        .catch((err) => console.error(err));
    }
  }, [user.id]);

  return (
    <div className="distributor-dashboard">
      <h1>🚚 Distributor Dashboard</h1>

      <div className="section">
        <h2>📦 Current Inventory</h2>
        <p>Total Items: {inventory.length}</p>
      </div>
    </div>
  );
}