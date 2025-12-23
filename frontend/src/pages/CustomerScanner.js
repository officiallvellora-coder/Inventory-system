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
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!role || !qrCode || !name || !mobile || !location) {
      setMessage('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/customer/scan`, {
        qrCode,
        role,
        name,
        mobile,
        location,
        pincode
      });

      setMessage(res.data.message || 'Scan successful');

      setQrCode('');
      setName('');
      setMobile('');
      setLocation('');
      setPincode('');
      setRole('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-scanner">
      <h1>QR Scan</h1>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Scan As</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select</option>
            <option value="superstockist">Super Stockist</option>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div className="form-group">
          <label>QR Code</label>
          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Scan / paste QR code"
          />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Mobile</label>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit Scan'}
        </button>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
}
