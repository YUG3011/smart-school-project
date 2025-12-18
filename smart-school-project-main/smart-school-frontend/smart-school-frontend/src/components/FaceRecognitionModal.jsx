// src/components/FaceRecognitionModal.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import RecognitionCamera from "./camera/RecognitionCamera";
import api from "../services/api";

/*
Props:
 - open (boolean)
 - onClose() callback
 - onMarked(attendance) // optional callback when attendance is marked successfully
*/

export default function FaceRecognitionModal({ open = false, onClose = () => {}, onMarked = () => {} }) {
  const [lastResult, setLastResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const lastMarkedRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    const handler = (ev) => {
      // when a capture is triggered globally (hidden button), we receive a dataUrl
      // not used currently
    };
    window.addEventListener("recognition-captured", handler);
    return () => {
      mounted.current = false;
      window.removeEventListener("recognition-captured", handler);
    };
  }, []);

  const handleRecognized = useCallback((rec) => {
    // rec is normalized: { id, full_id, name, role, distance }
    setLastResult(rec);

    // Auto-mark attendance once per recognized person during modal session
    (async () => {
      if (!rec || busy) return;
      const uniqueId = rec.person_id || rec.id || rec.full_id;
      if (!uniqueId) return;
      if (lastMarkedRef.current === uniqueId) return;

      setBusy(true);
      try {
        if (rec.role === "student") {
          const res = await api.post("/student-attendance/mark", {
            student_id: uniqueId,
            date: new Date().toISOString().split("T")[0],
            status: "present",
          });
          if (res && res.data) {
            lastMarkedRef.current = uniqueId;
            onMarked(res.data);
            // keep modal open for continuous recognition
          }
        } else if (rec.role === "teacher") {
          const res = await api.post("/teacher-attendance/mark", {
            teacher_id: uniqueId,
            date: new Date().toISOString().split("T")[0],
            status: "present",
          });
          if (res && res.data) {
            lastMarkedRef.current = uniqueId;
            onMarked(res.data);
          }
        }
      } catch (err) {
        console.error("Auto mark failed:", err);
      } finally {
        setBusy(false);
      }
    })();
  }, [busy, onMarked]);

  // user clicked Capture & Mark: capture a high-res frame and mark attendance
  const handleCaptureAndMark = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!lastResult) {
        alert("No recognition result yet. Please wait for the camera to detect a face.");
        setBusy(false);
        return;
      }

      // lastResult contains {id, full_id, name, role}
      if (lastResult.role === "student") {
        const res = await api.post("/student-attendance/mark", {
          student_id: lastResult.id,
          date: new Date().toISOString().split("T")[0],
          status: "present",
        });
        if (res && res.data && res.data.success) {
          alert("Attendance marked for " + (lastResult.name || lastResult.full_id));
          onMarked(res.data);
        } else {
          alert("Failed to mark student attendance.");
        }
      } else if (lastResult.role === "teacher") {
        const res = await api.post("/teacher-attendance/mark", {
          teacher_id: lastResult.id,
          date: new Date().toISOString().split("T")[0],
          status: "present",
        });
        if (res && res.data && res.data.success) {
          alert("Attendance marked for " + (lastResult.name || lastResult.full_id));
          onMarked(res.data);
        } else {
          alert("Failed to mark teacher attendance.");
        }
      } else {
        alert("Unknown role for recognized face.");
      }
    } catch (err) {
      console.error("Capture & Mark error:", err);
      alert("Error while marking attendance. See console.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ width: 720, background: "#fff", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", alignItems: 'center' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: '100%', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Face Recognition</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, flex: 1, width: '100%', justifyContent: 'center', paddingBottom: 8 }}>
          <RecognitionCamera onRecognized={handleRecognized} autoRecognize={true} showControls={false} />
        </div>
      </div>
    </div>
  );
}
