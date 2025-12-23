import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [pendingUsers, setPendingUsers] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchPendingUsers();
    fetchInventory();
  }, []);

  const fetchPendingUsers = async () => {
    const res = await axios.get(`${API_URL}/admin/pending-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPendingUsers(res.data);
  };

  const fetchInventory = async () => {
    const res = await axios.get(`${API_URL}/admin/inventory-overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setInventory(res.data);
  };

  const approveUser = async (id) => {
    await axios.post(
      `${API_URL}/admin/approve-user/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchPendingUsers();
  };

  const rejectUser = async (id) => {
    await axios.delete(
      `${API_URL}/admin/reject-user/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchPendingUsers();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>VELLORA HYBRID SYSTEM – ADMIN</h1>

      {/* PENDING APPROVALS */}
      <h2>Pending Approvals</h2>

      {pendingUsers.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table border="1" cellPadding="10">
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

      {/* INVENTORY */}
      <h2 style={{ marginTop: 40 }}>Inventory Overview</h2>

      <ul>
        {inventory.map((i, idx) => (
          <li key={idx}>
            {i.role} – Total: {i.totalQuantity}, Low Stock: {i.lowStockItems}
          </li>
        ))}
      </ul>
    </div>
  );
}
