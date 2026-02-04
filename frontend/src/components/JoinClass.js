import React, { useState } from "react";
import axios from "axios";

export default function JoinClass({ user, classes, refresh }) {
  const [subjectCode, setSubjectCode] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleJoin(e) {
    e.preventDefault();
    setMsg("");

    // Trim inputs
    const trimmedClassName = className.trim();
    const trimmedSubjectCode = subjectCode.trim();

    // Prevent duplicate join (already in classes list)
    const alreadyJoined = classes.some(
      (c) =>
        c.subjectCode.trim().toLowerCase() === trimmedSubjectCode.toLowerCase() &&
        c.className.trim().toLowerCase() === trimmedClassName.toLowerCase()
    );

    if (alreadyJoined) {
      return setMsg("⚠️ You already joined this class");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/class/join",
        { className: trimmedClassName, subjectCode: trimmedSubjectCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data.message || "✅ Joined successfully");
      setSubjectCode("");
      setClassName("");

      refresh(); // reload joined classes
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Join failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="join-class-box">
      <h2>Join a Class</h2>
      <form onSubmit={handleJoin} className="join-form">
        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject Code"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          required
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "Joining..." : "Join Class"}
        </button>
      </form>
      {msg && <p className="join-msg">{msg}</p>}
    </div>
  );
}


// export default function JoinClass({ user, classes, refresh }) {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function joinClass({ user, classes = [], refresh }) {
//     if (!selectedClass) {
//       alert("Please select a class");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

// //       await axios.post(
// //         "http://localhost:5000/api/classes/join",
// //         { classId: selectedClass },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

//       alert("Joined class successfully!");
//       refresh();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to join class");
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="join-class-section">
//       <h2>Join a Class</h2>

//       {classes.length === 0 ? (
//         <div className="empty-state">
//           <p>No classes available at the moment. Please check back later.</p>
//         </div>
//       ) : (
//         <>
//           <select
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//           >
//             <option value="">-- Select a Class --</option>
//             {classes.map((c) => (
//               <option key={c._id} value={c._id}>
//                 {c.className} ({c.subjectCode})
//               </option>
//             ))}
//           </select>

//           <button onClick={joinClass} disabled={loading}>
//             {loading ? "Joining..." : "Join Class"}
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
