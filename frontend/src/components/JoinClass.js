<<<<<<< HEAD
import React, { useState } from "react";
import axios from "axios";

export default function JoinClass({ user, classes, refresh }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  async function joinClass() {
    if (!selectedClass) {
      alert("Please select a class");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
=======
// // src/components/JoinClass.jsx
// import React, { useState } from "react";
// import axios from "axios";

// export default function JoinClass({ user, classes }) {
//   const [selectedClass, setSelectedClass] = useState("");

//   async function joinClass() {
//     if (!selectedClass) return alert("Select a class");

//     try {
//       const token = localStorage.getItem("token");
>>>>>>> d63e9c2 ( Teacher side Updated)

//       await axios.post(
//         "http://localhost:5000/api/classes/join",
//         { classId: selectedClass },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

<<<<<<< HEAD
      alert("Joined class successfully!");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join class");
=======
//       alert("Joined successfully!");
//     } catch (err) {
//       alert("Failed to join class");
//     }
//   }

//   return (
//     <div>
//       <h2>Select Your Class</h2>

//       <select
//         value={selectedClass}
//         onChange={(e) => setSelectedClass(e.target.value)}
//       >
//         <option value="">-- Select Class --</option>
//         {classes.map((c) => (
//           <option key={c._id} value={c._id}>
//             {c.className} ({c.subjectCode})
//           </option>
//         ))}
//       </select>

//       <br />
//       <button onClick={joinClass} style={{ marginTop: "10px" }}>
//         Join
//       </button>
//     </div>
//   );
// }
// src/components/JoinClass.js
import React, { useState } from 'react';
import api from '../services/api';

export default function JoinClass({ onJoined }){
  const [className, setClassName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoin(e){
    e.preventDefault();
    if (loading) return;
    if (!className || !subjectCode || !rollNumber) return setMsg('All fields required');

    try{
      setLoading(true);
      setMsg('Joining...');
      const res = await api.post('/class/join', { className, subjectCode, rollNumber }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMsg(res.data.message || 'Joined');
      onJoined && onJoined();
    }catch(err){
      setMsg(err?.response?.data?.message || 'Join failed');
    }finally{
      setLoading(false);
>>>>>>> d63e9c2 ( Teacher side Updated)
    }
    setLoading(false);
  }

  return (
<<<<<<< HEAD
    <div className="join-class-section">
      <h2>Join a Class</h2>

      {classes.length === 0 ? (
        <div className="empty-state">
          <p>No classes available at the moment. Please check back later.</p>
        </div>
      ) : (
        <>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select a Class --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} ({c.subjectCode})
              </option>
            ))}
          </select>

          <button onClick={joinClass} disabled={loading}>
            {loading ? "Joining..." : "Join Class"}
          </button>
        </>
      )}
    </div>
  );
}
=======
    <form onSubmit={handleJoin} style={{ display:'flex', gap:8, alignItems:'center' }}>
      <input placeholder="Class Name" value={className} onChange={e=>setClassName(e.target.value)} required />
      <input placeholder="Subject Code" value={subjectCode} onChange={e=>setSubjectCode(e.target.value)} required />
      <input placeholder="Roll Number" value={rollNumber} onChange={e=>setRollNumber(e.target.value)} required />
      <button type="submit" disabled={loading}>{loading ? 'Joining...' : 'Join'}</button>
      <div style={{ marginLeft: 8 }}>{msg}</div>
    </form>
  );
}

// // src/components/JoinClass.jsx
// import React, { useState } from 'react';
// import axios from 'axios';

// export default function JoinClass() {
//   const [className, setClassName] = useState('');
//   const [subjectCode, setSubjectCode] = useState('');
//   const [rollNumber, setRollNumber] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleJoin = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!className || !subjectCode || !rollNumber) {
//       setError("All fields are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         "http://localhost:5000/api/class/join",
//         {
//           className: className.trim().toLowerCase(),
//           subjectCode: subjectCode.trim().toLowerCase(),
//           rollNumber: rollNumber.trim()
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       console.log("Join Response:", res.data);

//       // ⚡ NO ALERT — using in-app UI is cleaner
//       alert("Class joined successfully!");

//       // Redirect student to dashboard after join
//       // window.location.href = "/student-dashboard";

//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to join the class");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleJoin} className="join-form">
//       <h2>Join Class</h2>

//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       <input
//         type="text"
//         placeholder="Class Name"
//         value={className}
//         onChange={(e) => setClassName(e.target.value)}
//       />

//       <input
//         type="text"
//         placeholder="Subject Code"
//         value={subjectCode}
//         onChange={(e) => setSubjectCode(e.target.value)}
//       />

//       <input
//         type="text"
//         placeholder="Roll Number"
//         value={rollNumber}
//         onChange={(e) => setRollNumber(e.target.value)}
//       />

//       <button type="submit" disabled={loading}>
//         {loading ? "Joining..." : "Join"}
//       </button>
//     </form>
//   );
// }
>>>>>>> d63e9c2 ( Teacher side Updated)
