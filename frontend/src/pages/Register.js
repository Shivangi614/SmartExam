import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    role: 'student', 
    employeeId: '', 
    rollNumber: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register/init', form);
      localStorage.setItem('tempToken', res.data.tempToken);
      localStorage.setItem('registerEmail', form.email);
      alert('OTP sent to your email. Redirecting to verify page.');
      navigate('/verify-otp');
    } catch (err) {
      alert(err.response?.data?.message || 'Error initiating registration');
    } finally { 
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input 
            type="text"
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label>University Email</label>
          <input 
            type="email" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            placeholder="your.email@university.edu"
            required
          />
        </div>

        <div>
          <label>I am a</label>
          <select 
            value={form.role} 
            onChange={e => setForm({...form, role: e.target.value})}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {form.role === 'teacher' && (
          <div>
            <label>Employee ID</label>
            <input 
              type="text"
              value={form.employeeId} 
              onChange={e => setForm({...form, employeeId: e.target.value})} 
              placeholder="Enter employee ID"
              required={form.role === 'teacher'}
            />
          </div>
        )}

        {form.role === 'student' && (
          <div>
            <label>Roll Number</label>
            <input 
              type="text"
              value={form.rollNumber} 
              onChange={e => setForm({...form, rollNumber: e.target.value})} 
              placeholder="Enter roll number"
              required={form.role === 'student'}
            />
          </div>
        )}

        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            placeholder="Create a strong password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Register & Send OTP'}
        </button>
      </form>

      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}