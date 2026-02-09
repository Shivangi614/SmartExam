
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";
import JoinClass from "../components/JoinClass";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  /* ============================
      FETCH LOGGED-IN USER
  ============================ */
  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(
        "http://localhost:5000/api/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data.user);
    } catch (err) {
      console.error("Auth failed");
      navigate("/login");
    }
  }

  /* ============================
      FETCH CLASSES AFTER USER
  ============================ */
  useEffect(() => {
    if (user) fetchClasses();
  }, [user]);

  async function fetchClasses() {
    try {
      const token = localStorage.getItem("token");
      let res;

      if (user.role === "teacher") {
        // TEACHER → OWN CLASSES
        res = await axios.get(
          "http://localhost:5000/api/class/mine",
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // STUDENT → JOINED CLASSES
        res = await axios.get(
          "http://localhost:5000/api/class/classes",
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setClasses(res.data.classes || []);
    } catch (err) {
      console.error("Failed to fetch classes", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  /* ============================
      LOGOUT
  ============================ */
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  /* ============================
      LOADING STATE
  ============================ */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  /* ============================
      UI
  ============================ */
  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p>
            Role: {user.role.toUpperCase()} • {user.email}
          </p>
        </div>
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </div>

      {/* ============================
          TEACHER VIEW
      ============================ */}
      {user.role === "teacher" && (
        <>
          <button
            className="btn-primary"
            onClick={() => setOpenModal(true)}
          >
            + Create New Class
          </button>

          {classes.length === 0 ? (
            <div className="empty-state">
              <h3>No Classes Yet</h3>
              <p>Create your first class to get started.</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.classKey || cls._id}
                  cls={cls}
                  teacherView
                  onDelete={fetchClasses}
                />
              ))}
            </div>
          )}

          {openModal && (
            <CreateClassModal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              onCreated={fetchClasses}
            />
          )}
        </>
      )}

      {/* ============================
          STUDENT VIEW
      ============================ */}
      {user.role === "student" && (
        <>
          <JoinClass refresh={fetchClasses} />

          <h2 style={{ marginTop: 20 }}>My Classes</h2>

          {classes.length === 0 && (
            <p>No classes joined yet.</p>
          )}

          {classes.length > 0 && (
            <div className="classes-grid">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.classKey || cls._id}
                  cls={cls}
                  teacherView={false}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
