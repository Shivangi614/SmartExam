import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VerifyOtp(){
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem('registerEmail');
  const tempToken = localStorage.getItem('tempToken');

  async function handleVerify(e){
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify', { email, otp, tempToken });
      // on success, store JWT
      localStorage.setItem('token', res.data.token);
      alert('Registered and logged in!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false) }
  }

  if (!email || !tempToken) return <div style={{padding:20}}>No pending registration data. Please start registration first.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Verify OTP</h2>
      <p>OTP sent to: <strong>{email}</strong></p>
      <form onSubmit={handleVerify}>
        <div>
          <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter 6-digit OTP" required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Create Account'}</button>
      </form>
    </div>
  );
}
