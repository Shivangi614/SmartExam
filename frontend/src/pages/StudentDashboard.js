import React, { useEffect, useState } from 'react';
import api from '../services/api';
import JoinClass from '../components/JoinClass';

export default function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadClasses();
  }, []);

  // Fetch joined classes
  async function loadClasses() {
    setLoading(true);
    try {
      const res = await api.get('/class/my', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Defensive check
      setClasses(Array.isArray(res.data.classes) ? res.data.classes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Student Dashboard</h2>
        <JoinClass onJoined={loadClasses} />
      </header>

      <main style={{ marginTop: 20 }}>
        {loading ? (
          <div>Loading your classes...</div>
        ) : classes.length === 0 ? (
          <div>You have not joined any classes yet.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 12
            }}
          >
            {classes.map((cls) => (
              <div
                key={cls.classKey}
                style={{
                  border: '1px solid #ddd',
                  padding: 12,
                  borderRadius: 6
                }}
              >
                <h4>{cls.className}</h4>
                <p>Subject: {cls.subjectCode}</p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() =>
                      (window.location.href =
                        `/student/class/${encodeURIComponent(cls.classKey)}`)
                    }
                  >
                    View Class
                  </button>

                  <button
                    onClick={() => alert('Start Test — feature coming soon')}
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}

// // src/pages/StudentDashboard.jsx
// import React, { useEffect, useState } from 'react';
// import api from '../services/api';
// import JoinClass from '../components/JoinClass';

// export default function StudentDashboard(){
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem('token');

//   useEffect(()=>{ load(); }, []);

//   async function load(){
//     setLoading(true);
//     try{
//       const res = await api.get('/class/my', { headers: { Authorization: `Bearer ${token}` } });
//       setClasses(res.data.classes || []);
//     }catch(err){
//       console.error(err);
//       alert(err.response?.data?.message || 'Could not load your classes');
//     }finally{ setLoading(false); }
//   }

//   return (
//     <div style={{padding:20}}>
//       <header style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//         <h2>Student Dashboard</h2>
//         <div>
//           <JoinClass onJoined={load} />
//         </div>
//       </header>

//       <main style={{marginTop:20}}>
//         {loading ? <div>Loading your classes...</div> : (
//           classes.length === 0 ? <div>You have not joined any classes yet.</div> : (
//             <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:12}}>
//               {classes.map(c => (
//                 <div key={c.classKey} style={{border:'1px solid #ddd', padding:12, borderRadius:6}}>
//                   <h4>{c.className || c.classKey}</h4>
//                   <p>Subject: {c.subjectCode}</p>
//                   <div style={{display:'flex', gap:8}}>
//                     <button onClick={()=>window.location.href=`/student/class/${encodeURIComponent(c.classKey)}`}>View Exam</button>
//                     <button onClick={()=>alert('Start Test — implemented later')}>Start Test</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )
//         )}
//       </main>
//     </div>
//   );
// }
