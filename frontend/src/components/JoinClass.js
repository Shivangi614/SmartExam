
// src/components/JoinClass.jsx
import React, { useState } from "react";
import api from "../services/api";

export default function JoinClass({ refresh }) {
  const [className, setClassName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e) {
    e.preventDefault();
    setMsg("");

    if (!className.trim() || !subjectCode.trim()) {
      setMsg("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/class/join", {
        className: className.trim(),
        subjectCode: subjectCode.trim(),
      });

      setMsg(res.data.message || "Class joined successfully");
      setClassName("");
      setSubjectCode("");

      // ✅ refresh ONLY on success
      if (refresh) refresh();

    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        "Unable to join class"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Join Class</h3>

      <form onSubmit={handleJoin}>
        <input
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />

        <input
          placeholder="Subject Code"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Joining..." : "Join"}
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
