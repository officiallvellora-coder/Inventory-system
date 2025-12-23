import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InventoryTable from '../components/InventoryTable';
import AddProductModal from '../components/AddProductModal';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [pendingUsers, setPendingUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const loadPending = async () => {
    const res = await axios.get(`${API_URL}/admin/pending-users`, { headers });
    setPendingUsers(res.data);
  };

  const loadInventory = async () => {
    const res = await axios.get(`${API_URL}/admin/inventory`, { headers });
    setInventory(res.data);
  };

  const approveUser = async (id) => {
    await axios.post(`${API_URL}/admin/approve-user/${id}`, {}, { headers });
    loadPending();
  };

  const rejectUser = async (id) => {
    await axios.delete(`${API_URL}/admin/reject-user/${id}`, { headers });
    loadPending();
  };

  useEffect(() => {
    loadPending();
    loadInventory();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>VELLORA HYBRID SYSTEM – ADMIN</h1>

      {/* Pending Approvals */}
      <h2>Pending Approvals</h2>
      {pendingUsers.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.location}</td>
                <td>
                  <button onClick={() => approveUser(u.id)}>Approve</button>
                  <button onClick={() => rejectUser(u.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Inventory */}
      <h2 style={{ marginTop: 30 }}>Inventory</h2>
      <button onClick={() => setShowAdd(true)}>➕ Add Product</button>

      <InventoryTable data={inventory} />

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            loadInventory();
          }}
        />
      )}
    </div>
  );
}
