import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function UniversalAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user } = useAuth();

  const [statusMessage, setStatusMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

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

  const stopCamera = () => {
    setCameraActive(false);

    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg");
  };

  const recognizeLoop = async () => {
    if (!cameraActive) return;

    if (!processing) {
      await recognizeFace();
    }

    setTimeout(recognizeLoop, 500);
  };

  // NEW UNIFIED RECOGNITION ENDPOINT
  const recognizeFace = async () => {
    setProcessing(true);

    const frame = captureFrame();

    try {
      const res = await api.post("/face/recognize", {
        image_base64: frame
      });

      const data = res.data;

      if (data.match === true) {
        drawBoundingBox("green");
        setStatusMessage(`Recognized: ${data.name} (${data.role})`);

        await markAttendance(data);
      } else {
        drawBoundingBox("red");
        setStatusMessage("Unknown Face");
      }
    } catch (err) {
      console.error("Recognition error:", err);
      drawBoundingBox("red");
      setStatusMessage("Error processing face");
    }

    setProcessing(false);
  };

  const markAttendance = async (data) => {
    try {
      if (data.role === "student") {
        await api.post("/student-attendance/mark", {
          student_id: data.id,
          date: new Date().toISOString().split("T")[0],
          status: "present"
        });
      } else if (data.role === "teacher") {
        await api.post("/teacher-attendance/mark", {
          teacher_id: data.id,
          date: new Date().toISOString().split("T")[0],
          status: "present"
        });
      }

      setStatusMessage("Attendance marked");
    } catch (err) {
      console.error("Attendance error:", err);
      setStatusMessage("Error marking attendance");
    }
  };

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

      <div className="relative w-full flex justify-center border rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full max-w-2xl" autoPlay muted />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      <p className="text-center text-lg font-semibold mt-4">
        {statusMessage}
      </p>

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
