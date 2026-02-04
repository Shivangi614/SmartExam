
// src/components/UploadExcel.js
import React, { useState } from 'react';
import api from '../services/api';
import './UploadExcel.css';

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
    <div className="upload-excel-container">
      <form onSubmit={handleUpload} className="upload-form">
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept=".xlsx" 
            onChange={e => setFile(e.target.files[0])}
            id="excel-file-input"
            className="file-input"
          />
          <label htmlFor="excel-file-input" className="file-label">
            {file ? file.name : '📤 Choose Excel File'}
          </label>
        </div>
        <button type="submit" className="upload-btn">Upload</button>
      </form>

      {msg && (
        <div className={`upload-message ${msg.includes('Failed') || msg.includes('Select') ? 'error' : 'success'}`}>
          {msg}
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="uploaded-section">
          <h4 className="uploaded-title">✅ Newly Added Students</h4>
          <div className="uploaded-table-wrapper">
            <table className="uploaded-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {uploaded.map((s, i) => (
                  <tr key={i}>
                    <td>{s.rollNumber}</td>
                    <td>{s.name}</td>
                    <td><span className="status-badge">{s.status || 'Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}