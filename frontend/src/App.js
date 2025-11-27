import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const token = localStorage.getItem('token');
  
  return (
    <BrowserRouter>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Navigation */}
      <nav>
        <div>SmartExam</div>
        <div>
          {!token ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

// Home Page Component
function HomePage() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to SmartExam</h1>
        <p>
          A modern, intelligent examination management system designed for educational excellence. 
          Create, manage, and conduct exams seamlessly with our advanced platform.
        </p>
        <button onClick={() => window.location.href = '/register'}>
          Get Started →
        </button>

        {/* Feature Cards */}
        <div className="features">
          <div className="feature-card">
            <h3>📝 Smart Exams</h3>
            <p>Create and manage exams with ease using our intuitive interface</p>
          </div>
          <div className="feature-card">
            <h3>📊 Analytics</h3>
            <p>Track performance with detailed insights and reports</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Secure</h3>
            <p>Enterprise-grade security for your examination data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;