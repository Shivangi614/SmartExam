import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem('registerEmail');
  const tempToken = localStorage.getItem('tempToken');

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify', { email, otp, tempToken });
      localStorage.setItem('token', res.data.token);
      alert('Registered and logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    } finally { 
      setLoading(false);
    }
  }

  if (!email || !tempToken) {
    return (
      <div className="verify-container">
        <h2>⚠️ No Registration Data</h2>
        <p>Please start the registration process first.</p>
        <button onClick={() => navigate('/register')}>
          Go to Register
        </button>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <h2>Verify Your Email</h2>
      <p>
        We've sent a 6-digit OTP to<br/>
        <strong>{email}</strong>
      </p>
      
      <form onSubmit={handleVerify}>
        <div>
          <input 
            type="text"
            value={otp} 
            onChange={e => setOtp(e.target.value)} 
            placeholder="000000" 
            maxLength="6"
            required 
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>
      </form>
    </div>
  );
}