import React, { useState } from "react";
import axios from "axios";

export default function JoinClass({ user, classes, refresh }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  async function joinClass() {
    if (!selectedClass) {
      alert("Please select a class");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/classes/join",
        { classId: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Joined class successfully!");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join class");
    }
    setLoading(false);
  }

  return (
    <div className="join-class-section">
      <h2>Join a Class</h2>

      {classes.length === 0 ? (
        <div className="empty-state">
          <p>No classes available at the moment. Please check back later.</p>
        </div>
      ) : (
        <>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select a Class --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} ({c.subjectCode})
              </option>
            ))}
          </select>

          <button onClick={joinClass} disabled={loading}>
            {loading ? "Joining..." : "Join Class"}
          </button>
        </>
      )}
    </div>
  );
}