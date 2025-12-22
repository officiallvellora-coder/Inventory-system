import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    Promise.all([
      fetchStats(),
      fetchAlerts(),
      fetchPendingUsers(),
      fetchInventory()
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchStats = async () => {
    const res = await axios.get(`${API_URL}/admin/inventory-overview`, authHeader);
    setStats(res.data);
  };

  const fetchAlerts = async () => {
    const res = await axios.get(`${API_URL}/admin/alerts`, authHeader);
    setAlerts(res.data);
  };

  const fetchPendingUsers = async () => {
    const res = await axios.get(`${API_URL}/admin/pending-users`, authHeader);
    setPendingUsers(res.data);
  };

  const fetchInventory = async () => {
    const res = await axios.get(`${API_URL}/admin/inventory-showcase`, authHeader);
    setInventory(res.data);
  };

  const approveUser = async (id) => {
    await axios.post(`${API_URL}/admin/approve-user/${id}`, {}, authHeader);
    fetchPendingUsers();
  };

  const rejectUser = async (id) => {
    await axios.delete(`${API_URL}/admin/reject-user/${id}`, authHeader);
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
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>VELLORA HYBRID SYSTEM</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* INVENTORY STATS */}
      <h2>Inventory Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: 16, borderRadius: 8, background: '#f4f6ff' }}>
            <h3>{s.role}</h3>
            <p>Total Qty: {s.totalQuantity}</p>
            <p>Low Stock: {s.lowStockItems}</p>
          </div>
        ))}
      </div>

      {/* INVENTORY TABLE */}
      <h2 style={{ marginTop: 32 }}>Inventory Showcase</h2>
      {inventory.length === 0 ? (
        <p>No inventory data</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table width="100%" border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Holder</th>
                <th>Role</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.batchNumber}</td>
                  <td>{item.expiryDate}</td>
                  <td>{item.holderName}</td>
                  <td>{item.holderRole}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PENDING USERS */}
      <h2 style={{ marginTop: 32 }}>Pending Registrations</h2>
      {pendingUsers.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <table width="100%" border="1" cellPadding="8">
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
                  <button onClick={() => rejectUser(u.id)} style={{ marginLeft: 8 }}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ALERTS */}
      <h2 style={{ marginTop: 32 }}>System Alerts</h2>
      {alerts.length === 0 ? <p>No alerts</p> : (
        <ul>
          {alerts.map((a, i) => <li key={i}>{a.message}</li>)}
        </ul>
      )}
    </div>
  );
}
