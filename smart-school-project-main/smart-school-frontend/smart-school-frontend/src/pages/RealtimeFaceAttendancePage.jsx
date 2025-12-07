import React, { useState, useRef, useEffect } from "react";
import API from "../services/api";

export default function RealtimeFaceAttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [markedAttendance, setMarkedAttendance] = useState([]);
  const [tolerance, setTolerance] = useState(0.52);
  const intervalRef = useRef(null);
  const processedFacesRef = useRef(new Set());

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatusMessage("📹 Camera active - Face detection running...");
        
        // Wait for video to be ready
        setTimeout(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            // Start frame processing loop
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(processFrame, 500);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatusMessage("❌ Camera access denied");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsCameraActive(false);
    setDetectedFaces([]);
    processedFacesRef.current.clear();
    setStatusMessage("");
  };

  // Process each frame
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Set canvas to match video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0);

      // Convert to JPEG and send to backend
      const frameData = canvas.toDataURL("image/jpeg", 0.7);
      const base64Frame = frameData.replace(/^data:image\/jpeg;base64,/, "");

      console.log(`Processing frame: ${(base64Frame.length / 1024).toFixed(2)}KB, video: ${video.videoWidth}x${video.videoHeight}`);

      // Send to backend for face detection
      const response = await API.post("/api/realtime-attendance/process-frame", {
        frame: base64Frame,
        tolerance: parseFloat(tolerance),
      });

      console.log("Backend response:", response.data);

      if (response.data.success) {
        const faces = response.data.faces || [];
        console.log(`Received ${faces.length} faces from backend`);
        setDetectedFaces(faces);

        // Handle newly marked attendance
        faces.forEach((face) => {
          if (face.marked && face.color === "green") {
            const faceKey = `${face.name}-${new Date().toDateString()}`;
            if (!processedFacesRef.current.has(faceKey)) {
              processedFacesRef.current.add(faceKey);
              setMarkedAttendance((prev) => [
                {
                  name: face.name,
                  time: new Date().toLocaleTimeString(),
                  confidence: face.confidence,
                },
                ...prev,
              ]);
              setStatusMessage(`✅ Attendance marked for ${face.name}`);
            }
          }
        });

        // Draw boxes on overlay canvas
        drawFaceBoxes(faces);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        console.error("422 Error:", err.response.data);
      } else if (err.response) {
        console.error("API Error:", err.response.status, err.response.data);
      } else {
        console.error("Error processing frame:", err.message);
      }
    }
  };

  // Draw face boxes on overlay
  const drawFaceBoxes = (faces, dimensions) => {
    const overlayCanvas = overlayCanvasRef.current;
    const video = videoRef.current;
    
    if (!overlayCanvas || !video) return;

    // Use video dimensions for canvas
    const width = video.videoWidth;
    const height = video.videoHeight;
    
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    const ctx = overlayCanvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    console.log(`Drawing ${faces.length} faces on ${width}x${height} canvas`);

    faces.forEach((face, idx) => {
      const [top, right, bottom, left] = face.box;
      const color = face.color === "green" ? "#00FF00" : "#FF0000";
      const boxWidth = right - left;
      const boxHeight = bottom - top;

      console.log(`Face ${idx}: ${face.name}, box: [${top}, ${right}, ${bottom}, ${left}], color: ${color}`);

      // Draw rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(left, top, boxWidth, boxHeight);

      // Draw label background
      ctx.fillStyle = color;
      ctx.fillRect(left, bottom, boxWidth, 30);

      // Draw label text
      ctx.fillStyle = "#000000";
      ctx.font = "14px Arial";
      ctx.fillText(
        `${face.name} (${(face.confidence * 100).toFixed(0)}%)`,
        left + 5,
        bottom + 20
      );
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">
        🎥 Real-Time Face Recognition Attendance
      </h1>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              📹 START CAMERA
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              ⏹️ STOP CAMERA
            </button>
          )}

          <div className="flex items-center gap-2">
            <label>Tolerance:</label>
            <input
              type="number"
              min="0.3"
              max="0.8"
              step="0.05"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              className="border px-3 py-1 rounded w-20"
              disabled={isCameraActive}
            />
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Video and Canvas Container */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ maxWidth: "640px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full bg-black"
          style={{ display: "block" }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Faces Detected</p>
          <p className="text-2xl font-bold text-blue-600">
            {detectedFaces.length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Attendance Marked</p>
          <p className="text-2xl font-bold text-green-600">
            {markedAttendance.length}
          </p>
        </div>
      </div>

      {/* Marked Attendance List */}
      {markedAttendance.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">✅ Marked Attendance</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {markedAttendance.map((record, idx) => (
              <div key={idx} className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-semibold">{record.name}</p>
                <p className="text-sm text-gray-600">
                  Time: {record.time} | Confidence: {(record.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Face Detection Status */}
      {detectedFaces.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Currently Detected</h2>
          <div className="space-y-2">
            {detectedFaces.map((face, idx) => (
              <div
                key={idx}
                className={`p-3 rounded ${
                  face.color === "green"
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "bg-red-50 border-l-4 border-red-500"
                }`}
              >
                <p className="font-semibold">
                  {face.name}{" "}
                  <span className="text-xs text-gray-600">
                    ({(face.confidence * 100).toFixed(0)}%)
                  </span>
                </p>
                {face.marked && (
                  <p className="text-xs text-green-600">✅ Attendance just marked</p>
                )}
                {face.already_marked && (
                  <p className="text-xs text-yellow-600">⚠️ Already marked today</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
