import React, { useEffect, useState } from 'react';
import axios from 'axios';

import InventoryTable from '../components/InventoryTable';
import AddProductModal from '../components/AddProductModal';
import GenerateQRBox from '../components/GenerateQRBox';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [inventory, setInventory] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  /* =====================
     LOAD INVENTORY
     ===================== */
  const loadInventory = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadInventory();
    // eslint-disable-next-line
  }, []);

  /* =====================
     LOGOUT
     ===================== */
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="admin-dashboard" style={{ padding: 24 }}>
      {/* HEADER */}
      <div style={header}>
        <h1>VELLORA HYBRID SYSTEM</h1>
        <button onClick={logout} style={logoutBtn}>Logout</button>
      </div>

      {/* ADD PRODUCT */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setShowAdd(true)}>
          + Add Product
        </button>
      </div>

      {/* INVENTORY TABLE */}
      <InventoryTable data={inventory} refresh={loadInventory} />

      {/* QR GENERATION */}
      <GenerateQRBox />

      {/* ADD PRODUCT MODAL */}
      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSuccess={loadInventory}
        />
      )}
    </div>
  );
}

/* =====================
   STYLES
   ===================== */

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
