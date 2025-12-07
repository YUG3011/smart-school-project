import { useEffect, useRef, useState } from "react";
import API from "../../services/api";

export default function AutomaticAttendancePage() {
  // State management
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const processedFacesRef = useRef(new Set());
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tolerance, setTolerance] = useState(0.5);
  const [result, setResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [entityType, setEntityType] = useState("student");
  const [stream, setStream] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Auto-capture and mark attendance every 500ms
  const autoProcessFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    try {
      const context = canvasRef.current.getContext("2d");
      const video = videoRef.current;

      // Check if video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      // Set canvas size to match video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0);
      
      // Get image as data URL and extract base64
      // Use lower quality (0.7) to keep payload size small and reduce 422 errors
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.7);
      const base64Image = imageData.replace(/^data:image\/jpeg;base64,/, "");

      if (!base64Image || base64Image.length < 100) {
        console.log("Image too small, skipping frame");
        return;
      }

      console.log(`Image size: ${(base64Image.length / 1024).toFixed(2)}KB`);

      // Send to backend for processing
      const endpoint =
        entityType === "student"
          ? "/api/auto-attendance/mark-student"
          : "/api/auto-attendance/mark-teacher";

      console.log(`Sending ${entityType} attendance request...`);
      
      const response = await API.post(endpoint, {
        image: base64Image,
        tolerance: parseFloat(tolerance),
      });

      console.log("API Response:", response.data);

      // Only process if successful
      if (response.data.success) {
        const personId = response.data.student_id || response.data.teacher_id;
        const personKey = `${entityType}-${personId}`;

        // Check if we already processed this person to avoid duplicates
        if (!processedFacesRef.current.has(personKey)) {
          processedFacesRef.current.add(personKey);

          // Show success
          setResult(response.data);
          setShowPopup(true);
          setStatusMessage(
            `✅ Attendance marked for ${
              response.data.student_name || response.data.teacher_name
            }`
          );

          // Add to history
          setSessionHistory([
            {
              ...response.data,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...sessionHistory,
          ]);

          // Auto-hide popup after 3 seconds
          setTimeout(() => {
            setShowPopup(false);
          }, 3000);

          // Stop camera after successful marking
          setTimeout(() => {
            stopCamera();
          }, 2000);
        }
      } else if (response.data.already_marked) {
        // Person already marked today - show warning
        const personId = response.data.student_id || response.data.teacher_id;
        const personKey = `${entityType}-${personId}`;

        if (!processedFacesRef.current.has(`warned-${personKey}`)) {
          processedFacesRef.current.add(`warned-${personKey}`);
          setResult(response.data);
          setShowPopup(true);
          setStatusMessage(
            `⚠️ Already marked today for ${
              response.data.student_name || response.data.teacher_name
            }`
          );

          setTimeout(() => {
            setShowPopup(false);
          }, 2000);
        }
      }
    } catch (err) {
      // Log errors for debugging
      if (err.response?.status === 422) {
        console.error("422 Error - Malformed request:", err.response.data);
        console.error("Request config:", err.config);
      } else if (err.response) {
        console.error("API Error:", err.response.status, err.response.data);
      } else {
        console.error("Error processing frame:", err.message);
      }
    }
  };

  // Start camera and begin face recognition
  const startCamera = async () => {
    try {
      processedFacesRef.current.clear();
      setStatusMessage("Opening camera...");
      setResult(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setStatusMessage("📹 Camera active - showing face to mark attendance");

        // Start auto-processing frames
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(autoProcessFrame, 1000); // Scan every 1000ms for better quality
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Failed to access camera: " + err.message);
      setStatusMessage("Camera access denied");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatusMessage("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Clear captured image
  const clearCapture = () => {
    processedFacesRef.current.clear();
    setStatusMessage("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Popup Notification */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`p-8 rounded-2xl shadow-2xl text-center text-white font-bold text-xl animate-bounce ${
              result?.success
                ? "bg-green-500"
                : result?.already_marked
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ pointerEvents: "auto" }}
          >
            {result?.success && (
              <div>
                <div className="text-4xl mb-2">✅</div>
                <div>Attendance Marked!</div>
                <div className="text-sm mt-2">
                  {result.student_name || result.teacher_name}
                </div>
                <div className="text-xs mt-1 opacity-90">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}
            {result?.already_marked && (
              <div>
                <div className="text-4xl mb-2">⚠️</div>
                <div>Already Marked Today</div>
                <div className="text-sm mt-2">
                  {result.student_name || result.teacher_name}
                </div>
              </div>
            )}
            {!result?.success && !result?.already_marked && (
              <div>
                <div className="text-4xl mb-2">❌</div>
                <div>Recognition Failed</div>
                <div className="text-xs mt-2">Try again</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Automatic Attendance
        </h1>
        <p className="text-gray-600">
          Show your face to camera - attendance marks automatically
        </p>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Entity Type Selector */}
          <div className="flex gap-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="entity"
                value="student"
                checked={entityType === "student"}
                onChange={(e) => setEntityType(e.target.value)}
                disabled={cameraActive}
                className="w-4 h-4"
              />
              <span className="ml-2 text-sm font-medium">Mark Student</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="entity"
                value="teacher"
                checked={entityType === "teacher"}
                onChange={(e) => setEntityType(e.target.value)}
                disabled={cameraActive}
                className="w-4 h-4"
              />
              <span className="ml-2 text-sm font-medium">Mark Teacher</span>
            </label>
          </div>

          {/* Tolerance Slider */}
          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium">Strictness:</label>
            <input
              type="range"
              min="0.3"
              max="0.9"
              step="0.1"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              disabled={cameraActive}
              className="w-32"
            />
            <span className="text-sm font-semibold">
              {tolerance === 0.3 ? "Strict" : tolerance === 0.9 ? "Lenient" : "Normal"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Camera Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Camera Preview */}
            {cameraActive && (
              <div className="mb-6">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                    style={{ aspectRatio: "4/3" }}
                  />
                  <div className="absolute inset-0 rounded-lg border-4 border-green-500 flex items-center justify-center">
                    <div className="text-white text-lg font-bold bg-green-600 px-4 py-2 rounded">
                      📹 LIVE
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!cameraActive && (
              <div className="mb-6 flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <div className="text-gray-600">
                    Click "Start Camera" to begin
                  </div>
                </div>
              </div>
            )}

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Status Message */}
            {statusMessage && (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border-2 border-blue-300 text-blue-800">
                <div className="font-semibold">ℹ️ {statusMessage}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              {!cameraActive && (
                <button
                  onClick={startCamera}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                >
                  📷 START CAMERA
                </button>
              )}

              {cameraActive && (
                <button
                  onClick={stopCamera}
                  className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg"
                >
                  ⏹ STOP CAMERA
                </button>
              )}

              {cameraActive && (
                <button
                  onClick={clearCapture}
                  className="px-8 py-4 bg-yellow-600 text-white rounded-lg font-bold text-lg hover:bg-yellow-700 transition shadow-lg"
                >
                  🔄 RESET
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Session History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4">✓ Session History</h3>

            {sessionHistory.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Attendance will appear here when marked...
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessionHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border-l-4 border-green-500 bg-green-50 rounded"
                  >
                    <div className="font-bold text-green-700 text-sm">
                      {item.student_name || item.teacher_name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <p>✓ {item.status}</p>
                      <p>🕐 {item.timestamp}</p>
                      <p>📊 {(item.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Statistics */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-sm font-bold text-gray-800">
                Total Marked: <span className="text-green-600 text-lg">{sessionHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3 text-lg">📋 How to Use:</h3>
        <ul className="text-sm text-blue-800 space-y-2 ml-4 list-disc">
          <li>
            <strong>Select Mode:</strong> Choose whether to mark Student or
            Teacher attendance
          </li>
          <li>
            <strong>Click START CAMERA:</strong> Camera will open and begin
            scanning
          </li>
          <li>
            <strong>Show Your Face:</strong> Position your face in front of
            camera clearly
          </li>
          <li>
            <strong>Automatic Detection:</strong> System will automatically
            recognize your face
          </li>
          <li>
            <strong>✓ Attendance Marked:</strong> Popup notification will show
            when done
          </li>
          <li>
            <strong>One Per Day:</strong> Cannot mark twice in same day
          </li>
          <li>
            <strong>Adjust Strictness:</strong> If recognition fails, try
            adjusting the strictness level
          </li>
        </ul>
      </div>
    </div>
  );
}
