
// src/components/UploadExcel.js
import React, { useState } from 'react';
import api from '../services/api';

export default function UploadExcel({ classKey, onUploaded }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploaded, setUploaded] = useState([]); // show newly added rows

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setMsg('Select a file first (.xlsx)');

    const fd = new FormData();
    fd.append('file', file); // backend expects "file"

    try {
      setMsg('Uploading...');
      const res = await api.post(`/class/${encodeURIComponent(classKey)}/upload-students`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
          // do NOT set Content-Type; axios will set boundary
        }
      });

      setMsg(`Uploaded. Added ${res.data.added} students.`);
      setUploaded(res.data.newStudents || []);
      setFile(null);
      onUploaded && onUploaded(); // refresh parent list
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || 'Upload failed');
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" style={{ marginLeft: 8 }}>Upload Excel</button>
      </form>
      <div style={{ marginTop: 8, color: '#333' }}>{msg}</div>

      {uploaded.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>Newly added students</h4>
          <table border="1" cellPadding="6">
            <thead>
              <tr><th>Roll</th><th>Name</th><th>Status</th></tr>
            </thead>
            <tbody>
              {uploaded.map((s, i) => (
                <tr key={i}>
                  <td>{s.rollNumber}</td>
                  <td>{s.name}</td>
                  <td>{s.status || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
