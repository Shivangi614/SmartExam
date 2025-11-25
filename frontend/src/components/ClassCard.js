// src/components/ClassCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ClassCard({ classData, userRole }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        width: "260px",
        margin: "10px",
        boxShadow: "2px 2px 8px #ccc",
      }}
    >
      <h3>{classData.className}</h3>
      <p>Subject Code: {classData.subjectCode}</p>

      <button
        onClick={() => navigate(`/class/${classData._id}`)}
        style={{ marginTop: "10px" }}
      >
        Manage
      </button>
    </div>
  );
}
