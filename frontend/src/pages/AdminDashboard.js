import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    Promise.all([fetchStats(), fetchAlerts(), fetchPendingUsers()])
      .finally(() => setLoading(false));
    // eslint-disable-next-line
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  return (
    <div className="admin-dashboard" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
      }}>
        <h1>VELLORA HYBRID SYSTEM</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Inventory Overview */}
      <h2>Inventory Overview</h2>
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 30
      }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{
            padding: 16,
            borderRadius: 8,
            background: '#f5f6fa'
          }}>
            <h3 style={{ textTransform: 'capitalize' }}>{s.role}</h3>
            <p>Total Qty: {s.totalQuantity}</p>
            <p>Low Stock: {s.lowStockItems}</p>
          </div>
        ))}
      </div>

      {/* Pending Users */}
      <h2>Pending Registrations</h2>
      {pendingUsers.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Role</th>
                <th align="left">Location</th>
                <th align="left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.location}</td>
                  <td>
                    <button
                      onClick={() => approveUser(u.id)}
                      style={{ marginRight: 8 }}
                    >
                      Approve
                    </button>
                    <button onClick={() => rejectUser(u.id)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alerts */}
      <h2 style={{ marginTop: 30 }}>System Alerts</h2>
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
