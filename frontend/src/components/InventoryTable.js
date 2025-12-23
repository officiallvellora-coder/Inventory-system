import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function InventoryTable({ data, refresh }) {
  const token = localStorage.getItem('token');
  const [editingId, setEditingId] = useState(null);
  const [qty, setQty] = useState('');

  const startEdit = (row) => {
    setEditingId(row.productId);
    setQty(row.quantity);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setQty('');
  };

  const saveQty = async (productId) => {
    try {
      await axios.put(
        `${API_URL}/admin/inventory/${productId}`,
        { quantity: Number(qty) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  if (!data || data.length === 0) {
    return <p>No inventory available</p>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 20 }}>
      <table style={table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Batch</th>
            <th>Expiry</th>
            <th>Holder</th>
            <th>Role</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.productId}>
              <td>{row.name}</td>
              <td>{row.sku}</td>
              <td>{row.batchNumber}</td>
              <td>{row.expiryDate}</td>
              <td>{row.holder || 'ADMIN'}</td>
              <td>{row.role || 'admin'}</td>

              <td>
                {editingId === row.productId ? (
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    style={{ width: 80 }}
                  />
                ) : (
                  row.quantity
                )}
              </td>

              <td>
                {editingId === row.productId ? (
                  <>
                    <button onClick={() => saveQty(row.productId)}>Save</button>
                    <button onClick={cancelEdit} style={{ marginLeft: 6 }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => startEdit(row)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== STYLES ===== */

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};
