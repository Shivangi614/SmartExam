// // src/components/ClassCard.jsx
// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function ClassCard({ classData, userRole }) {
//   const navigate = useNavigate();

//   return (
//     <div
//       style={{
//         border: "1px solid #ddd",
//         borderRadius: "10px",
//         padding: "15px",
//         width: "260px",
//         margin: "10px",
//         boxShadow: "2px 2px 8px #ccc",
//       }}
//     >
//       <h3>{classData.className}</h3>
//       <p>Subject Code: {classData.subjectCode}</p>

//       <button
//         onClick={() => navigate(`/class/${classData._id}`)}
//         style={{ marginTop: "10px" }}
//       >
//         Manage
//       </button>
//     </div>
//   );
// }

// src/components/ClassCard.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ClassCard({ cls, teacherView, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const key = cls.classKey || cls._id || cls.classId;

  
  const handleDeleteClass = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${cls.className}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `http://localhost:5000/api/class/${encodeURIComponent(key)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Class deleted successfully!");
      
      // Call parent refresh function if provided
      if (onDelete) {
        onDelete();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting class");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="class-card">
      <div className="class-card-header">
        <h3>{cls.className}</h3>
        <span className="badge">{cls.subjectCode}</span>
      </div>
      
      <p className="class-key">
        <span className="label">Class Code:</span> {key}
      </p>

      {teacherView ? (
        <div className="card-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate(`/manage-class/${encodeURIComponent(key)}`)}
          >
            📚 Manage
          </button>
          <button 
            className="btn-danger"
            onClick={handleDeleteClass}
            // disabled={deleting}
          >
            {deleting ? '⏳ Deleting...' : '🗑️ Delete'}
          </button>
        </div>
      ) : (
        <div className="card-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate(`/student/class/${encodeURIComponent(key)}`)}
          >
            📝 View Exams
          </button>
          <button 
            className="btn-success"
            onClick={() => alert('Start Test - to be implemented')}
          >
            ▶️ Start Test
          </button>
        </div>
      )}
    </div>
  );
}
