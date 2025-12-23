import React, { useState } from 'react';
import axios from 'axios';
import QRPreviewModal from './QRPreviewModal';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function GenerateQRBox() {
  const token = localStorage.getItem('token');

  const [qrValue, setQrValue] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');

  const generateQR = async () => {
    setError('');

    try {
      const res = await axios.post(
        `${API_URL}/super-stockist/generate-box`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend already generates QR string
      setQrValue(res.data.boxId || 'TEST-QR');
      setShowQR(true);
    } catch (err) {
      setError('QR generation failed');
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Generate QR</h3>

      <button onClick={generateQR}>
        Generate QR Code
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showQR && (
        <QRPreviewModal
          qrValue={qrValue}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
