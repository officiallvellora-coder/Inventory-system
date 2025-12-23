import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AddProductModal({ onClose, onSuccess }) {
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    batchNumber: '',
    expiryDate: '',
    quantity: ''
  });

  const submit = async (e) => {
    e.preventDefault();

    await axios.post(
      `${API_URL}/admin/create-product`,
      { ...form, quantity: Number(form.quantity) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    onSuccess();
  };

  return (
    <div className="modal">
      <form onSubmit={submit} className="modal-box">
        <h3>Add Product</h3>

        {Object.keys(form).map(k => (
          <input
            key={k}
            placeholder={k}
            type={k === 'expiryDate' ? 'date' : 'text'}
            value={form[k]}
            onChange={e => setForm({ ...form, [k]: e.target.value })}
            required
          />
        ))}

        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
