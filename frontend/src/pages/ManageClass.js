// // src/pages/ManageClass.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UploadExcel from '../components/UploadExcel';
import StudentList from '../components/StudentList';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ManageClass() {
  const { classKey } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log("ClassKey from URL:", classKey);
    load();
  }, [classKey]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching class data for:", classKey);

      // Try the API call
      const res = await axios.get(
        `http://localhost:5000/api/class/${encodeURIComponent(classKey)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("Class data received:", res.data);

      setCls(res.data.class || res.data);
    } catch (err) {
      console.error("Error loading class:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || 'Could not load class');
    } finally {
      setLoading(false);
    }
  }


  const downloadStudents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/class/${encodeURIComponent(classKey)}/download-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${classKey}_students.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      alert("Student list downloaded successfully!");

    } catch (error) {
      console.error(error);
      alert("Failed to download student list");
    }
  };

  const deleteStudent = async (rollNumber) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;

    try {
      await api.delete(
        `/class/${encodeURIComponent(classKey)}/student/${encodeURIComponent(rollNumber)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Student removed successfully!');
      load();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to remove the student');
    }
  };


  // Loading State
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading class details...</p>
        <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
          Class Key: {classKey}
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="dashboard-container">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <div className="empty-state">
          <h3>⚠️ Error Loading Class</h3>
          <p>{error}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
            Class Key: {classKey}
          </p>
          <button onClick={load} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Class Data
  if (!cls) {
    return (
      <div className="dashboard-container">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <div className="empty-state">
          <h3>⚠️ Class Not Found</h3>
          <p>The class you're looking for doesn't exist or you don't have access.</p>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
            Class Key: {classKey}
          </p>
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const totalStudents = cls.students ? cls.students.length : 0;
  const totalAssignments = cls.assignments ? cls.assignments.length : 0;
  const completedExams = cls.exams ? cls.exams.filter(exam => exam.status === 'completed').length : 0;

  // Main Content
  return (
    <div className="dashboard-container">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboard')} className="btn-back">
        ← Back to Dashboard
      </button>

      {/* Class Header */}
      <div className="class-header">
        <div className="class-header-content">
          <h1>{cls.className || 'Class Name'}</h1>
          <div className="class-meta">
            <span className="badge-large">{cls.subjectCode || 'N/A'}</span>
            <span className="class-code">Class Code: {cls.classKey || classKey}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{totalStudents}</h3>
            <p>Students Enrolled</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{totalAssignments}</h3>
            <p>Active Assignments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{completedExams}</h3>
            <p>Completed Exams</p>
          </div>
        </div>
      </div>

      {/* Students Section */}
      <section className="manage-section">
        <div className="section-header">
          <h2>👥 Students Management</h2>
          <UploadExcel
            classKey={cls.classKey}
            onUploaded={load}
          />


          <StudentList classKey={cls.classKey} students={cls.students || []} onChanged={load} />
          <div style={{ marginTop: 10 }}>
            <button onClick={downloadStudents} className="btn-secondary">
              📥 Download List
            </button>
          </div>
        </div>

        <div className="section-content">
          {/* Student List */}
          {cls.students && cls.students.length > 0 ? (
            <div className="student-list">

              <table className="student-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.students.map((student, index) => (
                    <tr key={student._id || index}>
                      <td>{index + 1}</td>
                      <td>{student.name || 'N/A'}</td>
                      <td>{student.email || 'N/A'}</td>
                      <td>{student.rollNumber || 'N/A'}</td>
                      <td className="status-col">
                        <span className={`status-badge ${(student.status || 'Pending').toLowerCase()}`}>
                          {student.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-sm btn-danger" onClick={() => deleteStudent(student.rollNumber)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-students">
              <h4>No Students Enrolled</h4>
              <p>Upload an Excel file or wait for students to join this class.</p>
            </div>
          )}
        </div>
      </section>

      {/* Assignments Section */}
      <section className="manage-section">
        <div className="section-header">
          <h2>📝 Assignments</h2>
        </div>
        <div className="section-content">
          <CreateAssignmentPanel classKey={cls.classKey || classKey} onCreated={load} />

          {cls.assignments && cls.assignments.length > 0 ? (
            <div className="assignments-list" style={{ marginTop: '20px' }}>
              {cls.assignments.map((assignment) => (
                <div key={assignment._id} className="assignment-item">
                  <h4>{assignment.title}</h4>
                  <p>{assignment.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-assignments">
              <p>No assignments created yet. Create one above!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}




/* Assignment Creation Panel */
function CreateAssignmentPanel({ classKey, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const token = localStorage.getItem('token');

  async function submit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an assignment title');
      return;
    }
    setCreating(true);

    try {
      await axios.post(
        `http://localhost:5000/api/class/${encodeURIComponent(classKey)}/assignment`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setDescription('');
      onCreated && onCreated();
      alert('Assignment created successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not create assignment');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="create-assignment-panel">
      <h3>Create New Assignment</h3>
      <form onSubmit={submit} className="assignment-form">
        <div className="form-group">
          <label>Assignment Title</label>
          <input
            type="text"
            placeholder="e.g., Final Project Submission"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Enter assignment details and instructions..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="5"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? '⏳ Creating...' : '+ Create Assignment'}
        </button>
      </form>
    </div>
  );
}
