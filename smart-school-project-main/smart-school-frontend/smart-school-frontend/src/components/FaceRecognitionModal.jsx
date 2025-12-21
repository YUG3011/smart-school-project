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
  const isMarkingRef = useRef(false);
  const lastMarkedRef = useRef(null);

  useEffect(() => {
    // Reset state when modal opens
    if (open) {
      setLastResult(null);
      isMarkingRef.current = false;
      lastMarkedRef.current = null;
    }
  }, [open]);

  const handleRecognized = useCallback((rec) => {
    setLastResult(rec);

    // Prevent duplicate marking if a request is already in flight
    if (isMarkingRef.current) {
      return;
    }

    (async () => {
      if (!rec) return;
      const uniqueId = rec.id || rec.person_id;
      if (!uniqueId) return;

      // Prevent re-marking the same person in the same modal session
      if (lastMarkedRef.current === uniqueId) return;

      isMarkingRef.current = true;
      try {
        let res = null;
        if (rec.role === "student") {
          res = await api.post("/student-attendance/mark", { student_id: uniqueId });
        } else if (rec.role === "teacher") {
          res = await api.post("/teacher-attendance/mark", { teacher_id: uniqueId });
        } else {
          console.warn("Unknown role for recognized face:", rec.role);
          return;
        }

        if (res && res.data) {
          console.log(`Attendance marked for ${rec.name} (${rec.role})`);
          lastMarkedRef.current = uniqueId;
          if (onMarked) {
            onMarked(res.data);
          }
          window.dispatchEvent(new CustomEvent("entityChanged"));
        }
      } catch (err) {
        console.error("Auto mark failed:", err);
      } finally {
        isMarkingRef.current = false;
      }
    })();
  }, [onMarked]);

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
        
        {lastResult && (
          <div style={{marginTop: '10px', padding: '8px', background: '#f0f0f0', borderRadius: '4px', fontSize: '14px'}}>
            Last recognized: <strong>{lastResult.name}</strong> ({lastResult.role}) - Confidence: {lastResult.distance ? (1 - lastResult.distance).toFixed(2) : 'N/A'}
          </div>
        )}
      </div>
    </div>
  );
}