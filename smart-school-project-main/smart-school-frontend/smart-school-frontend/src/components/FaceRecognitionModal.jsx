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
    setLastResult(rec);
  }, []);

  // user clicked Capture & Mark: capture a high-res frame and mark attendance
  const handleCaptureAndMark = async () => {
    if (busy) return;
    setBusy(true);

    try {
      // dispatch the hidden capture button to get high-res data
      const captureBtn = document.getElementById("recognition_capture");
      // prepare promise to receive captured data
      const capturedPromise = new Promise((resolve) => {
        function onCaptured(ev) {
          window.removeEventListener("recognition-captured", onCaptured);
          resolve(ev.detail.dataUrl);
        }
        window.addEventListener("recognition-captured", onCaptured);
      });

      // click hidden button to produce capture
      if (captureBtn) {
        captureBtn.click();
      } else {
        console.warn("capture button not found");
      }

      const dataUrl = await capturedPromise;
      if (!dataUrl) {
        alert("Could not capture image.");
        setBusy(false);
        return;
      }

      // before marking, we may want to re-run recognition on full-res image
      const recognizeRes = await api.recognizeFace(dataUrl);
      const payload = (recognizeRes && recognizeRes.data) || {};
      if (!payload.success) {
        alert("Recognition failed. Try again.");
        setBusy(false);
        return;
      }

      if (!payload.matched) {
        // optional: allow enroll flow or show unknown
        alert("No face recognized. Please enroll the face first or try again.");
        setBusy(false);
        return;
      }

      // payload should contain id and role (e.g., student/teacher)
      const markPayload = {
        person_id: payload.id,
        role: payload.role || "student",
        // any other required fields your backend needs
      };

      const markRes = await api.markAttendance(markPayload);
      if (markRes && markRes.data && markRes.data.success) {
        alert("Attendance marked successfully.");
        onMarked(markRes.data); // inform parent
      } else {
        // backend responded but didn't succeed
        alert("Attendance marking failed. Check backend logs.");
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
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 760, background: "#fff", borderRadius: 6, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Face Recognition Attendance</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div>
            <RecognitionCamera onRecognized={handleRecognized} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 10 }}>
              <strong>Last Recognition:</strong>
              <div style={{ marginTop: 6 }}>
                {lastResult ? (
                  <div>
                    <div>Matched: {String(lastResult.matched)}</div>
                    <div>Name: {lastResult.name || "-"}</div>
                    <div>ID: {lastResult.id || "-"}</div>
                    <div>Role: {lastResult.role || "-"}</div>
                  </div>
                ) : (
                  <div>No recent recognition</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn-success" onClick={handleCaptureAndMark} disabled={busy}>
                {busy ? "Processing..." : "Capture & Mark"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
