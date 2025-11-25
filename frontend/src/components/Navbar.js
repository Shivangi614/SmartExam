// components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/login');
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 700 }}>SmartExam</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {token && user && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} style={{ padding: '6px 10px' }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
