// // src/components/CreateClassModal.jsx
// import React, { useState } from "react";
// import axios from "axios";

// export default function CreateClassModal({ onClose, refresh }) {
//   const [className, setClassName] = useState("");
//   const [subjectCode, setSubjectCode] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function createClass() {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       await axios.post(
//         "http://localhost:5000/api/class/create",
//         { className, subjectCode },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       refresh();
//       onClose();
//     } catch (err) {
//       alert("Error creating class");
//     }
//     setLoading(false);
//   }

//   return (
//     <div
//       style={{
//         background: "#00000080",
//         position: "fixed",
//         inset: 0,
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
//         <h2>Create New Class</h2>

//         <input
//           type="text"
//           placeholder="Class Name"
//           value={className}
//           onChange={(e) => setClassName(e.target.value)}
//         />

//         <input
//           type="text"
//           placeholder="Subject Code"
//           value={subjectCode}
//           onChange={(e) => setSubjectCode(e.target.value)}
//           style={{ marginLeft: "10px" }}
//         />

//         <br />
//         <button onClick={createClass} disabled={loading}>
//           {loading ? "Creating..." : "Create"}
//         </button>
//         <button onClick={onClose} style={{ marginLeft: "10px" }}>
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// }
// src/components/CreateClassModal.jsx
import React, { useState } from "react";
import axios from "axios";

const CreateClassModal = ({ isOpen, onClose, onCreated }) => {
  const [className, setClassName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("userId");

  if (!isOpen) return null; // FIXED: modal now controls visibility correctly

  const createClassHandler = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/class/create",
        {
          className,
          subjectCode,
          teacherId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Class Created Successfully");
      onCreated(); // FIXED: refresh class list
      onClose();   // FIXED: close modal
    } catch (err) {
      console.log(err.response?.data);
      alert("ERROR IN CLASS CREATION");
    }
  };

  return (
    <div className="modal-bg" style={styles.bg}>
      <div className="modal-box" style={styles.box}>
        <h2>Create Class</h2>

        <input
          type="text"
          placeholder="Class Name (e.g., BCA 3rd)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Subject Code (e.g., CS301)"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          style={styles.input}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={createClassHandler} style={styles.btnPrimary}>
            Create
          </button>
          <button onClick={onClose} style={styles.btnCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;

const styles = {
  bg: {
    background: "#00000080",
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  box: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
    display: "flex",
    flexDirection: "column"
  },
  input: {
    padding: 8,
    marginTop: 10,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  btnPrimary: {
    padding: "8px 14px",
    marginRight: 10,
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 6
  },
  btnCancel: {
    padding: "8px 14px",
    background: "#777",
    color: "#fff",
    border: "none",
    borderRadius: 6
  }
};
