import React, { useEffect, useState } from 'react';
import axios from 'axios';

import InventoryTable from '../components/InventoryTable';
import AddProductModal from '../components/AddProductModal';
import GenerateQRBox from '../components/GenerateQRBox';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');

  const [inventory, setInventory] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =====================
     AUTH CHECK
     ===================== */
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadAll();
    // eslint-disable-next-line
  }, []);

  /* =====================
     LOAD ALL DATA
     ===================== */
  const loadAll = async () => {
    try {
      await Promise.all([
        loadInventory(),
        loadPendingUsers()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    const res = await axios.get(
      `${API_URL}/admin/inventory`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInventory(res.data);
  };

  const loadPendingUsers = async () => {
    const res = await axios.get(
      `${API_URL}/admin/pending-users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPendingUsers(res.data);
  };

  /* =====================
     APPROVAL ACTIONS
     ===================== */
  const approveUser = async (id) => {
    await axios.post(
      `${API_URL}/admin/approve-user/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadPendingUsers();
  };

  const rejectUser = async (id) => {
    await axios.delete(
      `${API_URL}/admin/reject-user/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadPendingUsers();
  };

  /* =====================
     LOGOUT
     ===================== */
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <div style={header}>
        <h1>VELLORA HYBRID SYSTEM</h1>
        <button onClick={logout} style={logoutBtn}>Logout</button>
      </div>

      {/* =====================
          PENDING APPROVALS
          ===================== */}
      <section style={section}>
        <h2>Pending Registrations</h2>

        {pendingUsers.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table style={table}>
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
                    <button
                      onClick={() => rejectUser(u.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* =====================
          INVENTORY SECTION
          ===================== */}
      <section style={section}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Inventory</h2>
          <button onClick={() => setShowAdd(true)}>+ Add Product</button>
        </div>

        <InventoryTable data={inventory} refresh={loadInventory} />
      </section>

      {/* =====================
          QR GENERATION
          ===================== */}
      <section style={section}>
        <GenerateQRBox />
      </section>

      {/* ADD PRODUCT MODAL */}
      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSuccess={loadInventory}
        />
      )}
    </div>
  );
}

/* =====================
   STYLES
   ===================== */

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24
};

const logoutBtn = {
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 4,
  cursor: 'pointer'
};

const section = {
  marginBottom: 40
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};
