// import React, { useState } from 'react';
// import api from '../services/api';
// import { useNavigate } from 'react-router-dom';

// export default function Login(){
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   async function handleSubmit(e){
//     e.preventDefault();
//     try{
//       const res = await api.post('/auth/login', { email, password });
//       localStorage.setItem('token', res.data.token);
//       alert('Login successful');
//       navigate('/dashboard');
//     }catch(err){
//       alert(err.response?.data?.message || 'Login failed');
//     }
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
//         <div><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }
// pages/Login.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      // store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);

      navigate('/dashboard');  // go to dashboard
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div><input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
