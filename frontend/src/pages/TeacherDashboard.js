// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CreateClassModal from '../components/CreateClassModal';
import ClassCard from '../components/ClassCard';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/class/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not load classes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Teacher Dashboard</h2>
        <button onClick={() => setShowCreate(true)}>+ Create Class</button>
      </header>

      <main style={{ marginTop: 20 }}>
        {loading ? (
          <div>Loading classes...</div>
        ) : classes.length === 0 ? (
          <div>No classes yet. Create one.</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
            gap: 12
          }}>
            {classes.map((c) => (
              <ClassCard key={c.classKey} cls={c} teacherView onCreatedClass={load} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateClassModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
