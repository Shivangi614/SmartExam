// // pages/Dashboard.js
// import React, { useEffect, useState } from 'react';
// import api, { setAuthToken } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// export default function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) { navigate('/login'); return; }
//     setAuthToken(token);

//     async function fetchUser() {
//       try {
//         const res = await api.get('/auth/me');
//          const currentUser = res.data.user;  // <-- use this instead of `user`
//     setUser(currentUser);

//         // fetch classes depending on role
//         const classesRes = user.role === 'teacher'
//           ? await api.get('/classes/teacher')  // all classes created by teacher
//           : await api.get('/classes/student'); // all classes student joined

//         setClasses(classesRes.data.classes || []);
//       } catch (err) {
//         console.error(err);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setAuthToken(null);
//         navigate('/login');
//       }
//     }

//     fetchUser();
//   }, [navigate]);

//   if (!user) return <div style={{ padding:20 }}>Loading...</div>;

//   return (
//     <div style={{ padding:20 }}>
//       <h2>Hi, {user.name}</h2>
//       <div style={{ color:'#666' }}>{user.email} · <strong>{user.role}</strong></div>

//       <div style={{ marginTop:20 }}>
//         {user.role === 'teacher' ? (
//           <button style={buttonStyle} onClick={() => navigate('/dashboard/create-class')}>Create Class</button>
//         ) : (
//           <button style={buttonStyle} onClick={() => navigate('/dashboard/join-class')}>Join Class</button>
//         )}
//       </div>

//       <h3 style={{ marginTop:30 }}>{user.role === 'teacher' ? 'Your Classes' : 'My Classes'}</h3>
//       <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
//         {classes.map(c => (
//           <div key={c._id} style={cardStyle} onClick={() => navigate(`/${user.role}/class/${c._id}`)}>
//             <h4>{c.className}</h4>
//             <p>{c.subjectCode}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// const buttonStyle = { padding:'12px 18px', border:'none', background:'#2563eb', color:'#fff', borderRadius:6, cursor:'pointer' };
// const cardStyle = { padding:12, border:'1px solid #ccc', borderRadius:6, width:200, cursor:'pointer' };
// pages/Dashboard.js
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";
import JoinClass from "../components/JoinClass";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

useEffect(() => {
  fetchUser();
}, []);

useEffect(() => {
  if (user) fetchClasses();
}, [user]);

  // Fetch Logged-in user info (role)
  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      navigate("/login");
    }
  }

  // Fetch Classes (if teacher → own classes, student → all classes)
  async function fetchClasses() {
    try {
      const token = localStorage.getItem("token");
      let res;

if (user.role === "teacher") {
  res = await axios.get("http://localhost:5000/api/class/mine", {
    headers: { Authorization: `Bearer ${token}` }
  });
} else {
  res = await axios.get("http://localhost:5000/api/class/my", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

setClasses(res.data.classes);
      setClasses(res.data.classes);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.role.toUpperCase()}</p>

      <button onClick={logout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      {/* TEACHER DASHBOARD */}
      {user.role === "teacher" && (
        <>
          <button onClick={() => setOpenModal(true)}>+ Create Class</button>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
            {classes.map((c) => (
              <ClassCard key={c._id} classData={c} userRole="teacher" />
            ))}
          </div>

          {openModal && (
            <CreateClassModal
              onClose={() => setOpenModal(false)}
              refresh={fetchClasses}
            />
          )}
        </>
      )}

      {/* STUDENT DASHBOARD */}
      {user.role === "student" && (
        <JoinClass user={user} classes={classes} />
      )}
    </div>
  );
}
