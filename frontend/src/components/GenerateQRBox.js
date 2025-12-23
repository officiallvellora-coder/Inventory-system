import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function GenerateQRBox({ onGenerated }) {
  const token = localStorage.getItem('token');

  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!batchNumber || !expiryDate || !productId) {
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
          productId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage('QR box generated successfully');
      setBatchNumber('');
      setExpiryDate('');
      setProductId('');

      if (onGenerated) onGenerated(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'QR generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={box}>
      <h3>Generate QR Box</h3>

      <form onSubmit={submit}>
        <input
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
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

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

/* ===== STYLES ===== */

const box = {
  marginTop: 30,
  padding: 20,
  background: '#f5f6fa',
  borderRadius: 8
};
