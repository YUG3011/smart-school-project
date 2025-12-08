// src/components/camera/CameraCapture.jsx
import React, { useRef, useState, useEffect } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera Error:", error);
      alert("Unable to access camera");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    setCameraActive(false);
    let stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Capture Snapshot
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg");

    onCapture(base64);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        className="w-full rounded border"
        autoPlay
        muted
        playsInline
      />

      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="flex gap-3">
        {!cameraActive ? (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={startCamera}
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={captureImage}
            >
              Capture Photo
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={stopCamera}
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
