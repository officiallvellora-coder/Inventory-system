import React from 'react';

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 14px',
        background: '#e74c3c',
        color: '#ffffff',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer'
      }}
    >
      Logout
    </button>
  );
}
