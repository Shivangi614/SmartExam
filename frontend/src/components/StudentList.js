// src/components/StudentList.js
import React from 'react';
import api from '../services/api';

export default function StudentList({ classKey, students = [], onChanged }) {
  const token = localStorage.getItem('token');

  async function clearAll(){
    if (!window.confirm('Clear all students?')) return;
    try{
      await api.delete(`/class/${encodeURIComponent(classKey)}/students`, { headers: { Authorization: `Bearer ${token}` }});
      onChanged && onChanged();
    }catch(err){
      console.error(err);
      alert(err?.response?.data?.message || 'Could not clear');
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h4>Students</h4>
        <div>
          <button onClick={clearAll}>Delete All</button>
        </div>
      </div>

      {students.length === 0 ? <div>No students uploaded</div> : (
        <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left' }}>Roll</th>
                <th style={{ textAlign:'left' }}>Name</th>
                <th style={{ textAlign:'left' }}>Status</th>
                <th style={{ textAlign:'left' }}>Joined At</th>
                <th style={{ textAlign:'left' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s,i) => (
                <tr key={i}>
                  <td>{s.rollNumber}</td>
                  <td>{s.name || '-'}</td>
                  <td>{s.status || 'Pending'}</td>
                  <td>{s.joinedAt ? (new Date(s.joinedAt)).toLocaleString() : '-'}</td>
                  <td>{s.result == null ? '-' : s.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
