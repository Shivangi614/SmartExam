// src/components/StudentList.js
import React from 'react';
import api from '../services/api';
import './StudentList.css';

export default function StudentList({ classKey, students = [], onChanged }) {
  const token = localStorage.getItem('token');

  async function clearAll(){
    if (!window.confirm('Are you sure you want to delete ALL the students? This cannot be undone!')) return;
    try{
      await api.delete(`/class/${encodeURIComponent(classKey)}/students`, { headers: { Authorization: `Bearer ${token}` }});
      onChanged && onChanged();
    }catch(err){
      console.error(err);
      alert(err?.response?.data?.message || 'Could not clear');
    }
  }

 return (
    <div className="student-list-container">
      <div className="student-list-header">
        <h4 className="student-list-title">👥 Student Directory</h4>
        {students.length > 0 && (
          <button onClick={clearAll} className="btn-delete-all">
            🗑️ Delete All Students
          </button>
        )}
      </div>

      {students.length === 0 ? (
        <div className="no-students-message">
          <p>No students uploaded yet. Upload an Excel file to add students.</p>
        </div>
      ) : (
        <div className="student-list-wrapper">
          <table className="student-data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Status</th>
                <th>Joined At</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="student-row">
                  <td className="roll-col">{s.rollNumber}</td>
                  <td className="name-col">{s.name || '-'}</td>
                  <td className="status-col">
                    <span className={`status-badge ${(s.status || 'Pending').toLowerCase()}`}>
                      {s.status || 'Pending'}
                    </span>
                  </td>
                  <td className="date-col">
                    {s.joinedAt ? new Date(s.joinedAt).toLocaleString() : '-'}
                  </td>
                  <td className="result-col">
                    {s.result == null ? '-' : s.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}