import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AddProductModal({ onClose, onSuccess }) {
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0
  });

  const submit = async () => {
    await axios.post(`${API_URL}/admin/products`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="modal">
      <h3>Add Product</h3>
      {Object.keys(form).map(k => (
        <input
          key={k}
          placeholder={k}
          value={form[k]}
          onChange={e => setForm({ ...form, [k]: e.target.value })}
        />
      ))}
      <button onClick={submit}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
