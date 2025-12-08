// smart-school-frontend/src/components/camera/RecognitionCamera.jsx

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

export default function RecognitionCamera({ onRecognized }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [borderColor, setBorderColor] = useState("#999"); // default grey
  const [statusText, setStatusText] = useState("Camera idle");

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRunning(true);
      setStatusText("Camera active - scanning...");
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera");
    }
  };

  // Stop camera and polling
  const stopCamera = () => {
    setIsRunning(false);
    setStatusText("Camera stopped");
    setBorderColor("#999");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Capture current frame as base64
  const captureFrameBase64 = () => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    // Backend expects full data URL or just base64; we send full data URL for now
    return dataUrl;
  };

  // Poll backend every 1.5s when running
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      const frameBase64 = captureFrameBase64();
      if (!frameBase64) return;

      try {
        const res = await axios.post(
          `${API_URL}/face-recognition/recognize`,
          { image_base64: frameBase64 }
        );

        // EXPECTED RESPONSE SHAPE (adjust if your backend differs):
        // { match: true/false, name: "Chetan", role: "student"/"teacher" }
        const { match, name, role } = res.data;

        if (match) {
          setBorderColor("limegreen");
          setStatusText(`Recognized: ${name} (${role})`);
          if (onRecognized) {
            onRecognized({ match, name, role });
          }
        } else {
          setBorderColor("red");
          setStatusText("Unknown face");
          if (onRecognized) {
            onRecognized({ match: false });
          }
        }
      } catch (err) {
        console.error("Recognition error:", err);
        setBorderColor("red");
        setStatusText("Error contacting recognition API");
      }
    }, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onRecognized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div
        style={{
          border: `4px solid ${borderColor}`,
          borderRadius: "10px",
          display: "inline-block",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "640px", height: "auto", borderRadius: "6px" }}
        />
      </div>

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={startCamera}
          >
            Start Camera
          </button>
        ) : (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={stopCamera}
          >
            Stop Camera
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">{statusText}</div>
    </div>
  );
}
