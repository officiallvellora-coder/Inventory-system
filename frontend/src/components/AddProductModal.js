import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AddProductModal({ onClose, onSuccess }) {
  const token = localStorage.getItem('token');

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !sku || !batchNumber || !expiryDate || quantity === '') {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/admin/inventory`,
        {
          name,
          sku,
          batchNumber,
          expiryDate,
          quantity: Number(quantity)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Add New Product</h2>

        <form onSubmit={submit} style={{ marginTop: 16 }}>
          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <input
            placeholder="Batch Number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />

          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modal = {
  background: '#fff',
  padding: 24,
  borderRadius: 8,
  width: 400,
  maxWidth: '90%'
};
