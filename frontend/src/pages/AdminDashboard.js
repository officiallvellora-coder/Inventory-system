import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchAlerts();
    fetchPendingUsers();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(`${API_URL}/admin/inventory-overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(res.data);
  };

  const fetchAlerts = async () => {
    const res = await axios.get(`${API_URL}/admin/alerts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAlerts(res.data);
  };

  const fetchPendingUsers = async () => {
    const res = await axios.get(`${API_URL}/admin/pending-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPendingUsers(res.data);
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
    <div className="admin-dashboard">
      <h1>VELLORA HYBRID SYSTEM</h1>

      <h2>Inventory Overview</h2>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <h3>{s.role}</h3>
            <p>Total Qty: {s.totalQuantity}</p>
            <p>Low Stock: {s.lowStockItems}</p>
          </div>
        ))}
      </div>

      <h2>Pending Registrations</h2>
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

      <h2>System Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts</p>
      ) : (
        <ul>
          {alerts.map((a, i) => (
            <li key={i}>{a.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
