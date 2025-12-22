import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://inventory-system-9k38.onrender.com/api';

export default function LoginPage({ setUser }) {
  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [role, setRole] = useState('superstockist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');

  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        mobile,
        location,
        pincode
      });

      setMessage(res.data.message);
      setMode('login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>VELLORA HYBRID SYSTEM</h1>

        {mode === 'login' ? (
          <>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>

            <p onClick={() => setMode('register')} style={{ cursor: 'pointer' }}>
              Register as Super Stockist / Distributor / Retailer
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister}>
              <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="superstockist">Super Stockist</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
              </select>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <input
                placeholder="Mobile"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
              />

              <input
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />

              <input
                placeholder="Pincode"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
              />

              <button type="submit">Register</button>
            </form>

            <p onClick={() => setMode('login')} style={{ cursor: 'pointer' }}>
              Back to Login
            </p>
          </>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

