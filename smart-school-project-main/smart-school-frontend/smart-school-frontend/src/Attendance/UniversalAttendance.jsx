// smart-school-frontend/src/pages/Attendance/UniversalAttendance.jsx

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/face-recognition";

export default function UniversalAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("");
  const [boxColor, setBoxColor] = useState("red");
  const [loading, setLoading] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState(null);

  // ----------------------------
  // START CAMERA
  // ----------------------------
  const startCamera = async () => {
    setRecognizedUser(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setMessage("");
    } catch (err) {
      alert("Unable to access camera");
    }
  };

  // ----------------------------
  // STOP CAMERA
  // ----------------------------
  const stopCamera = () => {
    let stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  // ----------------------------
  // CAPTURE A FRAME AS BASE64
  // ----------------------------
  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg");
  };

  // ----------------------------
  // SEND TO BACKEND FOR RECOGNITION
  // ----------------------------
  const handleRecognition = async () => {
    if (!cameraActive) return;

    setLoading(true);
    const base64 = captureFrame();

    try {
      const res = await axios.post(`${API_URL}/recognize`, {
        image_base64: base64,
      });

      if (!res.data.match) {
        setMessage("Unknown Face!");
        setBoxColor("red");
        setRecognizedUser(null);
        setLoading(false);
        return;
      }

      // KNOWN FACE
      setBoxColor("green");
      setRecognizedUser(res.data);

      // ----------------------------
      // MARK ATTENDANCE
      // ----------------------------
      await axios.post(`${API_URL}/mark-attendance`, {
        name: res.data.name,
        role: res.data.role,
      });

      setMessage(`Attendance Marked for ${res.data.name}`);
    } catch (err) {
      console.log(err);
      setMessage("Error recognizing face");
    }

    setLoading(false);
  };

  // ----------------------------
  // AUTO RECOGNITION INTERVAL
  // ----------------------------
  useEffect(() => {
    let interval;
    if (cameraActive) {
      interval = setInterval(handleRecognition, 2000); // every 2 sec
    }
    return () => clearInterval(interval);
  }, [cameraActive]);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg mt-4">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Universal Face Attendance
      </h2>

      <div className="flex flex-col items-center">
        <div className="relative">
          {/* VIDEO FEED */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg border w-[600px] h-auto"
          />

          {/* FACE BOX */}
          {cameraActive && (
            <div
              className="absolute border-4"
              style={{
                borderColor: boxColor,
                width: "300px",
                height: "300px",
                top: "20%",
                left: "25%",
                borderRadius: "6px",
                transition: "0.2s",
              }}
            ></div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden"></canvas>

        <div className="flex gap-3 mt-4">
          {!cameraActive ? (
            <button
              className="bg-green-600 text-white px-6 py-2 rounded text-lg"
              onClick={startCamera}
            >
              Start Camera
            </button>
          ) : (
            <button
              className="bg-red-600 text-white px-6 py-2 rounded text-lg"
              onClick={stopCamera}
            >
              Stop Camera
            </button>
          )}
        </div>

        {/* RESULT MESSAGE */}
        {loading && <p className="text-blue-500 mt-4">Processing...</p>}
        {message && <p className="text-lg font-semibold mt-3">{message}</p>}

        {/* SHOW USER DETAILS */}
        {recognizedUser && (
          <div className="mt-4 p-4 bg-green-100 rounded shadow-md w-[60%] text-center">
            <h3 className="text-xl font-bold">{recognizedUser.name}</h3>
            <p>Role: {recognizedUser.role}</p>
            {recognizedUser.role === "student" && (
              <>
                <p>Class: {recognizedUser.class}</p>
                <p>Section: {recognizedUser.section}</p>
              </>
            )}
            <p className="text-sm text-gray-600">
              Confidence Score: {recognizedUser.distance.toFixed(3)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
