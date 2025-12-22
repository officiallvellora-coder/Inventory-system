import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function CustomerScanner() {
  const [role, setRole] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role || !qrCode || !shopName || !ownerName || !mobile || !location) {
      setMessage('All required fields must be filled');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/customer/scan`, {
        qrCode,
        role,
        shopName,
        ownerName,
        mobile,
        location,
        pincode
      });

      setMessage(res.data.message);

      setQrCode('');
      setShopName('');
      setOwnerName('');
      setMobile('');
      setLocation('');
      setPincode('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Scan failed');
    }
  };

  return (
    <div className="customer-scanner">
      <h1>QR Scan Registration</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Scan As</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div className="form-group">
          <label>QR Code</label>
          <input value={qrCode} onChange={e => setQrCode(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Shop Name</label>
          <input value={shopName} onChange={e => setShopName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Owner Name</label>
          <input value={ownerName} onChange={e => setOwnerName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input value={pincode} onChange={e => setPincode(e.target.value)} />
        </div>

        <button type="submit">Submit Scan</button>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
}