import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InventoryTable from '../components/InventoryTable';
import AddProductModal from '../components/AddProductModal';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');
  const [inventory, setInventory] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const res = await axios.get(`${API_URL}/admin/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setInventory(res.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="admin-dashboard">
      <h1>VELLORA HYBRID SYSTEM</h1>

      <button onClick={() => setShowAdd(true)}>Add Product</button>

      <InventoryTable data={inventory} refresh={load} />

      {showAdd && (
        <AddProductModal onClose={() => setShowAdd(false)} onSuccess={load} />
      )}
    </div>
  );
}
<GenerateQRBox />
