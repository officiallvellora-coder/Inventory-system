import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function GenerateQRBox({ onClose, onSuccess }) {
  const token = localStorage.getItem('token');

  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [productId, setProductId] = useState('');
  const [superStockistId, setSuperStockistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!batchNumber || !expiryDate || !productId || !superStockistId) {
      setMessage('All fields are required');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/super-stockist/generate-box`,
        {
          batchNumber,
          expiryDate,
          productId,
          superStockistId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage('QR Box generated successfully');
      onSuccess();
    } catch (err) {
      setMessage(err.response?.data?.error || 'QR generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Generate QR Box</h2>

        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Master Product ID"
            value={productId}
            onChange={e => setProductId(e.target.value)}
          />

          <input
            placeholder="Batch Number"
            value={batchNumber}
            onChange={e => setBatchNumber(e.target.value)}
          />

          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
          />

          <input
            placeholder="Super Stockist ID"
            value={superStockistId}
            onChange={e => setSuperStockistId(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            style={primaryBtn}
          >
            {loading ? 'Generating...' : 'Generate QR'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 10 }}>{message}</p>
        )}

        <button onClick={onClose} style={secondaryBtn}>
          Close
        </button>
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
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modal = {
  background: '#fff',
  padding: 24,
  borderRadius: 8,
  width: '100%',
  maxWidth: 420
};

const primaryBtn = {
  background: '#3498db',
  color: '#fff',
  border: 'none',
  padding: '10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 'bold'
};

const secondaryBtn = {
  marginTop: 10,
  background: '#ccc',
  border: 'none',
  padding: '8px',
  borderRadius: 4,
  cursor: 'pointer'
};
