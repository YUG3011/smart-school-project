// src/pages/Attendance/UniversalAttendance.jsx

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function UniversalAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user } = useAuth();

  const API = "http://127.0.0.1:5000/api";

  const [statusMessage, setStatusMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Start the camera
  const startCamera = async () => {
    try {
      setCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      recognizeLoop();
    } catch (error) {
      console.error("Camera Error:", error);
      setStatusMessage("Unable to access camera.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    setCameraActive(false);

    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  // Capture current frame
  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg");
  };

  // Loop for face recognition
  const recognizeLoop = async () => {
    if (!cameraActive) return;

    if (processing === false) {
      await recognizeFace();
    }

    setTimeout(recognizeLoop, 500); // every 0.5 sec
  };

  // Send frame to backend for recognition
  const recognizeFace = async () => {
    setProcessing(true);

    const frame = captureFrame();

    try {
      const res = await axios.post(`${API}/face-recognition/recognize`, {
        image_base64: frame
      });

      const data = res.data;

      if (data.success === true && data.match === true) {
        drawBoundingBox("green");
        setStatusMessage(`Recognized: ${data.name} (${data.role})`);

        await markAttendance(data);
      } else {
        drawBoundingBox("red");
        setStatusMessage("Unknown Face");
      }
    } catch {
      drawBoundingBox("red");
      setStatusMessage("Error processing face");
    }

    setProcessing(false);
  };

  // Mark attendance depending on role
  const markAttendance = async (data) => {
    try {
      let endpoint = "";

      if (data.role === "student") {
        endpoint = `${API}/student-attendance/mark`;
      } else if (data.role === "teacher") {
        endpoint = `${API}/teacher-attendance/mark`;
      }

      if (endpoint === "") return;

      const res = await axios.post(endpoint, {
        person_id: data.id
      });

      setStatusMessage(res.data.message || "Attendance Marked");
    } catch (err) {
      console.error("Attendance error:", err);
      setStatusMessage("Error marking attendance");
    }
  };

  // Draw bounding box on the overlay canvas
  const drawBoundingBox = (color) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Face Recognition Attendance</h1>

      {/* Video + Canvas */}
      <div className="relative w-full flex justify-center border rounded-lg overflow-hidden">

        <video
          ref={videoRef}
          className="w-full max-w-2xl"
          autoPlay
          muted
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />

      </div>

      {/* Status */}
      <p className="text-center text-lg font-semibold mt-4">
        {statusMessage}
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        {!cameraActive ? (
          <button
            className="bg-green-600 text-white px-6 py-3 rounded"
            onClick={startCamera}
          >
            Start Attendance
          </button>
        ) : (
          <button
            className="bg-red-600 text-white px-6 py-3 rounded"
            onClick={stopCamera}
          >
            Stop Camera
          </button>
        )}
      </div>

    </div>
  );
}
