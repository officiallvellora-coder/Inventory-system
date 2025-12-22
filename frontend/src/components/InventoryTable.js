import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function InventoryTable({ data, refresh }) {
  const token = localStorage.getItem('token');
  const [editing, setEditing] = useState({});

  const save = async (productId, qty) => {
    await axios.put(
      `${API_URL}/admin/inventory/${productId}`,
      { quantity: qty },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    refresh();
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Batch</th>
          <th>Expiry</th>
          <th>Holder</th>
          <th>Qty</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map(p => (
          <tr key={p.productId}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.batchNumber}</td>
            <td>{p.expiryDate}</td>
            <td>{p.holder || 'ADMIN'}</td>
            <td>
              <input
                type="number"
                value={editing[p.productId] ?? p.quantity}
                onChange={e =>
                  setEditing({ ...editing, [p.productId]: e.target.value })
                }
              />
            </td>
            <td>
              <button onClick={() => save(p.productId, editing[p.productId])}>
                Save
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
