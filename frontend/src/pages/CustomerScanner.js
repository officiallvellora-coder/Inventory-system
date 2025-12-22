import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function CustomerScanner() {
  const [role, setRole] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role || !qrCode || !name || !mobile || !location) {
      setMessage('All required fields must be filled');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/customer/scan`, {
        qrCode,
        role,
        name,
        mobile,
        location,
        pincode
      });

      setMessage(res.data.message);

      setQrCode('');
      setName('');
      setMobile('');
      setLocation('');
      setPincode('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Scan failed');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <h1>QR Scan</h1>

      <form onSubmit={handleSubmit}>
        <label>Scan As</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="superstockist">Super Stockist</option>
          <option value="distributor">Distributor</option>
          <option value="retailer">Retailer</option>
          <option value="customer">Customer</option>
        </select>

        <label>QR Code</label>
        <input
          value={qrCode}
          onChange={e => setQrCode(e.target.value)}
          placeholder="UNIT-XXXX"
        />

        <label>Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label>Mobile</label>
        <input
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />

        <label>Location</label>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
        />

        <label>Pincode</label>
        <input
          value={pincode}
          onChange={e => setPincode(e.target.value)}
        />

        <button type="submit" style={{ marginTop: 16 }}>
          Submit Scan
        </button>
      </form>

      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}
