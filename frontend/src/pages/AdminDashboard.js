import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`${API_URL}/admin/supply-chain-status`);
        const alertsRes = await axios.get(`${API_URL}/admin/low-stock-alerts`);
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>📊 Admin Control Panel</h1>

      <div className="stats-grid">
        {stats?.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <h3>{stat.level}</h3>
            <p className="big-number">{stat.count}</p>
            <p className="sub-text">Active: {stat.active}</p>
          </div>
        ))}
      </div>

      <div className="alerts-section">
        <h2>⚠️ Low Stock Alerts</h2>
        {alerts.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Role</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr key={idx}>
                  <td>{alert.location}</td>
                  <td>{alert.role}</td>
                  <td style={{ color: 'red' }}>{alert.currentStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No low stock alerts</p>
        )}
      </div>
    </div>
  );
}