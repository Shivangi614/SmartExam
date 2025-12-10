// src/pages/ManageClass.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import UploadExcel from '../components/UploadExcel';
import StudentList from '../components/StudentList';

export default function ManageClass(){
  const { classKey } = useParams(); // route: /manage-class/:classKey
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(()=>{ load(); }, [classKey]);

  async function load(){
    setLoading(true);
    try{
      const res = await api.get(`/class/${encodeURIComponent(classKey)}`, { headers: { Authorization: `Bearer ${token}` } });
      setCls(res.data.class);
    }catch(err){
      console.error(err);
      alert(err.response?.data?.message || 'Could not load class');
    }finally{ setLoading(false); }
  }

  if (loading) return <div style={{padding:20}}>Loading class...</div>;
  if (!cls) return <div style={{padding:20}}>Class not found or access denied.</div>;

  const downloadStudents = async (classKey) => {
  try {
    const token = localStorage.getItem("token");

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


  return (
    <div style={{padding:20}}>
      <h2>Manage Class: {cls.className} — {cls.subjectCode}</h2>
      <p>ClassKey: {cls.classKey}</p>

      <section style={{marginTop:16}}>
        <h3>Students</h3>
        <UploadExcel classKey={cls.classKey} onUploaded={load} />
        <StudentList classKey={cls.classKey} students={cls.students || []} onChanged={load} />
        <div style={{marginTop:10}}>
          <button onClick={() => downloadStudents(cls.classKey)}>
  Download
</button>
</div>
      </section>

      <section style={{marginTop:20}}>
        <h3>Assignments</h3>
        <CreateAssignmentPanel classKey={cls.classKey} onCreated={load} />
      </section>
    </div>
  );
}

/* Small panel to create assignment quickly */
function CreateAssignmentPanel({ classKey, onCreated }){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const token = localStorage.getItem('token');

  async function submit(e){
    e.preventDefault();
    try{
      await api.post(`/class/${encodeURIComponent(classKey)}/assignment`, { title, description }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle(''); setDescription('');
      onCreated && onCreated();
      alert('Assignment created');
    }catch(err){
      console.error(err);
      alert(err.response?.data?.message || 'Could not create assignment');
    }
  }

  return (
    <form onSubmit={submit} style={{marginTop:8}}>
      <div><input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required /></div>
      <div><textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} /></div>
      <div style={{marginTop:8}}><button type="submit">Create Assignment</button></div>
    </form>
  );
}
