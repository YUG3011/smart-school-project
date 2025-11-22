// src/pages/Teachers/AddTeacher.jsx
import { useState } from "react";
import api from "../../services/api";

export default function AddTeacher({ onAdded }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");

  const submitTeacher = async (e) => {
    e.preventDefault();

    if (!name || !subject || !phone) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await api.addTeacher({
        name,
        subject,
        phone,
      });

      alert("Teacher added successfully!");

      setName("");
      setSubject("");
      setPhone("");

      if (onAdded) onAdded(); // Refresh list in TeachersPage
    } catch (err) {
      console.error(err);
      alert("Error adding teacher");
    }
  };

  return (
    <form
      onSubmit={submitTeacher}
      className="bg-white p-5 rounded shadow mb-8 grid grid-cols-3 gap-4"
    >
      <input
        type="text"
        placeholder="Teacher Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="col-span-3 bg-purple-600 text-white p-2 rounded"
      >
        Add Teacher
      </button>
    </form>
  );
}
