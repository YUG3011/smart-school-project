// src/components/camera/RecognitionCamera.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";

export default function RecognitionCamera({ onRecognized }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [borderColor, setBorderColor] = useState("#aaa");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsRunning(true);
      setStatus("Camera active");
    } catch (err) {
      console.error("Camera start error:", err);
      setStatus("Camera error");
    }
  };

  const stopCamera = () => {
    setIsRunning(false);
    setStatus("Stopped");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setBorderColor("#aaa");
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg");
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(async () => {
      const img = captureFrame();
      if (!img) return;

      try {
        const res = await api.post("/face-recognition/recognize", { image_base64: img });
        const data = res.data;
        if (data.match) {
          setBorderColor("limegreen");
          setStatus(`Recognized: ${data.name || data.face_id}`);
        } else {
          setBorderColor("red");
          setStatus("Unknown face");
        }

        if (onRecognized) onRecognized(data);
      } catch (err) {
        console.error("Recognition API error:", err);
        setBorderColor("red");
        setStatus("Recognition error");
        if (onRecognized) onRecognized({ error: true });
      }
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onRecognized]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div>
      <div style={{ border: `4px solid ${borderColor}`, display: "inline-block", borderRadius: 8 }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: 640, borderRadius: 6 }} />
      </div>

      <div className="mt-2">
        {!isRunning ? (
          <button className="bg-green-600 px-4 py-2 text-white rounded" onClick={startCamera}>Start Camera</button>
        ) : (
          <button className="bg-red-600 px-4 py-2 text-white rounded" onClick={stopCamera}>Stop Camera</button>
        )}
        <span style={{ marginLeft: 12 }} className="text-sm text-gray-600">{status}</span>
      </div>
    </div>
  );
}
