// src/components/JoinClass.jsx
import React, { useState } from "react";
import axios from "axios";

export default function JoinClass({ user, classes }) {
  const [selectedClass, setSelectedClass] = useState("");

  async function joinClass() {
    if (!selectedClass) return alert("Select a class");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/classes/join",
        { classId: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Joined successfully!");
    } catch (err) {
      alert("Failed to join class");
    }
  }

  return (
    <div>
      <h2>Select Your Class</h2>

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">-- Select Class --</option>
        {classes.map((c) => (
          <option key={c._id} value={c._id}>
            {c.className} ({c.subjectCode})
          </option>
        ))}
      </select>

      <br />
      <button onClick={joinClass} style={{ marginTop: "10px" }}>
        Join
      </button>
    </div>
  );
}
