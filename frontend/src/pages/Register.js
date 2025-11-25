import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', role:'student', employeeId:'', rollNumber:'', password:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    try{
      const res = await api.post('/auth/register/init', form);
      // res.data.tempToken should be saved and passed to OTP verify page
      localStorage.setItem('tempToken', res.data.tempToken);
      localStorage.setItem('registerEmail', form.email);
      alert('OTP sent to your email. Redirecting to verify page.');
      navigate('/verify-otp');
    }catch(err){
      alert(err.response?.data?.message || 'Error initiating registration');
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Name</label><br/>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
        </div>
        <div><label>Email (university)</label><br/>
          <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
        </div>
        <div>
          <label>Role</label><br/>
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {form.role === 'teacher' && (
          <div><label>Employee ID</label><br/>
            <input value={form.employeeId} onChange={e=>setForm({...form, employeeId:e.target.value})} required={form.role==='teacher'} />
          </div>
        )}
        {form.role === 'student' && (
          <div><label>Roll Number</label><br/>
            <input value={form.rollNumber} onChange={e=>setForm({...form, rollNumber:e.target.value})} required={form.role==='student'} />
          </div>
        )}

        <div><label>Password</label><br/>
          <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Sending OTP...' : 'Register (Send OTP)'}</button>
      </form>
    </div>
  );
}
