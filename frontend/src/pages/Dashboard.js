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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchClasses();
  }, [user]);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      navigate("/login");
    }
  }

  async function fetchClasses() {
    try {
      const token = localStorage.getItem("token");
      let res;

      if (user.role === "teacher") {
        res = await axios.get("http://localhost:5000/api/class/mine", {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.get("http://localhost:5000/api/class/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setClasses(res.data.classes);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p>Role: {user.role.toUpperCase()} • {user.email}</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* TEACHER DASHBOARD */}
      {user.role === "teacher" && (
        <>
          <button onClick={() => setOpenModal(true)}>
            + Create New Class
          </button>

          {classes.length === 0 ? (
            <div className="empty-state">
              <h3>No Classes Yet</h3>
              <p>Create your first class to get started!</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((c) => (
                <ClassCard key={c._id} classData={c} userRole="teacher" />
              ))}
            </div>
          )}

          {openModal && (
            <CreateClassModal
              onClose={() => setOpenModal(false)}
              refresh={fetchClasses}
            />
          )}
        </>
      )}

      {/* STUDENT DASHBOARD */}
      {user.role === "student" && (
        <JoinClass user={user} classes={classes} refresh={fetchClasses} />
      )}
    </div>
  );
}