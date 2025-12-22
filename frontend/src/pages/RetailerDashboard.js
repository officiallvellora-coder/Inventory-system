import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function RetailerDashboard() {
  const [inventory, setInventory] = useState([]);
  const [qrQuantity, setQrQuantity] = useState(1);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      axios
        .get(`${API_URL}/retailer/inventory/${user.id}`)
        .then((res) => setInventory(res.data))
        .catch((err) => console.error(err));
    }
  }, [user.id]);

  const generateQRs = async () => {
    try {
      const res = await axios.post(`${API_URL}/retailer/generate-qr/product-001`, {
        quantity: qrQuantity
      });
      alert(`✅ ${qrQuantity} QR codes generated!`);
    } catch (err) {
      alert('❌ Error generating QR codes');
    }
  };

  return (
    <div className="retailer-dashboard">
      <h1>🛍️ Retailer Dashboard</h1>

      <div className="section">
        <h2>📦 Current Inventory</h2>
        <p>Total Items: {inventory.length}</p>
      </div>

      <div className="section">
        <h2>🎫 Generate QR Codes</h2>
        <input
          type="number"
          min="1"
          value={qrQuantity}
          onChange={(e) => setQrQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <button onClick={generateQRs}>Generate QRs</button>
      </div>
    </div>
  );
}