import React, { useEffect, useState } from 'react';
import axios from 'axios';

import InventoryTable from '../components/InventoryTable';
import AddProductModal from '../components/AddProductModal';
import GenerateQRBox from '../components/GenerateQRBox';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadInventory();
    // eslint-disable-next-line
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (err) {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: 30 }}>Loading inventory...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <h1>VELLORA HYBRID SYSTEM</h1>

        <button
          onClick={handleLogout}
          style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: '#2ecc71',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Add Product
        </button>

        <button
          onClick={() => setShowQR(true)}
          style={{
            background: '#3498db',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Generate QR Box
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable data={inventory} refresh={loadInventory} />

      {/* Add Product Modal */}
      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            loadInventory();
          }}
        />
      )}

      {/* Generate QR Modal */}
      {showQR && (
        <GenerateQRBox
          onClose={() => setShowQR(false)}
          onSuccess={() => {
            setShowQR(false);
          }}
        />
      )}
    </div>
  );
}
