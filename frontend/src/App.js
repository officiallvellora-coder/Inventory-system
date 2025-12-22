import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import AdminDashboard from './pages/AdminDashboard';
import SuperStockistDashboard from './pages/SuperStockistDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import CustomerScanner from './pages/CustomerScanner';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          role: decoded.role
        });
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />}
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              user.role === 'admin' ? (
                <AdminDashboard />
              ) : user.role === 'superstockist' ? (
                <SuperStockistDashboard />
              ) : user.role === 'distributor' ? (
                <DistributorDashboard />
              ) : user.role === 'retailer' ? (
                <RetailerDashboard />
              ) : (
                <CustomerScanner />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/scanner" element={<CustomerScanner />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
