// src/components/CreateClassModal.jsx
import React, { useState } from "react";
import axios from "axios";

export default function CreateClassModal({ onClose, refresh }) {
  const [className, setClassName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function createClass() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/class/create",
        { className, subjectCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      refresh();
      onClose();
    } catch (err) {
      alert("Error creating class");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        background: "#00000080",
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
        <h2>Create New Class</h2>

        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Subject Code"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          style={{ marginLeft: "10px" }}
        />

        <br />
        <button onClick={createClass} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
