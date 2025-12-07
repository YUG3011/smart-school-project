import React, { useState, useRef, useEffect } from "react";
import API from "../../services/api";

export default function AutomaticAttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [userType, setUserType] = useState("student");
  const [tolerance, setTolerance] = useState(0.6);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setMessage("");
    } catch (error) {
      setMessage("Error accessing camera: " + error.message);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      // Use lower quality (0.7) to keep payload size small
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.7);
      setCapturedImage(imageData);
    }
  };

  // Mark attendance automatically
  const markAttendanceAuto = async () => {
    if (!capturedImage) {
      setMessage("Please capture a photo first");
      return;
    }

    setLoading(true);
    setMessage("");
    setRecognitionResult(null);

    try {
      // Extract base64 properly
      const imageBase64 = capturedImage.replace(/^data:image\/jpeg;base64,/, "");

      console.log("Captured image size:", (imageBase64.length / 1024).toFixed(2), "KB");
      console.log("Sending to /api/auto-attendance/mark-student...");

      const response = await API.post("/api/auto-attendance/mark-student", {
        image: imageBase64,
        tolerance: parseFloat(tolerance),
      });

      setRecognitionResult(response.data);

      if (response.data.matched && response.data.attendance_marked) {
        setMessage(`✅ Attendance marked for ${response.data.best_match.student_name}`);
        // Add to history
        setAttendanceHistory([
          {
            name: response.data.best_match.student_name,
            type: userType,
            time: new Date().toLocaleTimeString(),
            confidence: response.data.best_match.confidence,
          },
          ...attendanceHistory,
        ]);
      } else if (response.data.matched) {
        setMessage(`⚠️ Face recognized but attendance marking failed`);
      } else {
        setMessage("❌ No face match found");
      }
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Clear captured image
  const clearCapture = () => {
    setCapturedImage(null);
    setRecognitionResult(null);
  };

  // Reset camera for next capture
  const resetForNextCapture = () => {
    clearCapture();
    if (cameraActive) {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 Automatic Attendance System
          </h1>
          <p className="text-gray-600">
            Real-time face recognition for attendance marking
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Camera Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* User Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mark Attendance For:
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setUserType("student")}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      userType === "student"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    👤 Student
                  </button>
                  <button
                    onClick={() => setUserType("teacher")}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      userType === "teacher"
                        ? "bg-purple-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    👨‍🏫 Teacher
                  </button>
                </div>
              </div>

              {/* Camera and Canvas */}
              <div className="bg-black rounded-lg overflow-hidden mb-6">
                {!capturedImage ? (
                  <video
                    ref={videoRef}
                    width={640}
                    height={480}
                    className={`w-full ${cameraActive ? "block" : "hidden"}`}
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-auto"
                  />
                )}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="hidden"
                />
              </div>

              {/* Camera Controls */}
              <div className="flex gap-4 mb-6">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md"
                  >
                    📹 Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={capturePhoto}
                      disabled={!cameraActive}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all shadow-md disabled:bg-gray-400"
                    >
                      📸 Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md"
                    >
                      ⏹️ Stop Camera
                    </button>
                  </>
                )}
              </div>

              {/* Captured Image Actions */}
              {capturedImage && (
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={markAttendanceAuto}
                    disabled={loading}
                    className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-all shadow-md disabled:bg-gray-400"
                  >
                    {loading ? "Processing..." : "✅ Mark Attendance"}
                  </button>
                  <button
                    onClick={resetForNextCapture}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-md"
                  >
                    🔄 Retake
                  </button>
                </div>
              )}

              {/* Messages */}
              {message && (
                <div
                  className={`p-4 rounded-lg text-center font-semibold ${
                    message.includes("✅")
                      ? "bg-green-100 text-green-800"
                      : message.includes("❌")
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Tolerance Control */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Recognition Tolerance: {tolerance.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.9"
                  step="0.05"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Lower = Stricter matching, Higher = More lenient
                </p>
              </div>
            </div>
          </div>

          {/* Recognition Results and History */}
          <div>
            {/* Recognition Result */}
            {recognitionResult && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Recognition Result
                </h3>
                {recognitionResult.matched ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="text-sm font-semibold text-gray-600">
                        Name:
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {recognitionResult.best_match?.student_name}
                      </p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-sm font-semibold text-gray-600">
                        Confidence:
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {(recognitionResult.best_match?.confidence * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                    {recognitionResult.best_match?.class_name && (
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <p className="text-sm font-semibold text-gray-600">
                          Class:
                        </p>
                        <p className="text-lg font-bold text-purple-700">
                          {recognitionResult.best_match?.class_name}
                        </p>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded text-center font-bold ${
                        recognitionResult.attendance_marked
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {recognitionResult.attendance_marked
                        ? "✅ Attendance Marked"
                        : "⚠️ Recognition OK, Marking Failed"}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-center">
                    <p className="text-red-800 font-semibold">
                      ❌ No Face Match Found
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Attendance History */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  📋 Session History
                </h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-blue-500 hover:text-blue-700 font-semibold"
                >
                  {showHistory ? "Hide" : "Show"}
                </button>
              </div>

              {showHistory && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {attendanceHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No attendance marked yet
                    </p>
                  ) : (
                    attendanceHistory.map((record, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {record.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {record.type === "student"
                              ? "👤 Student"
                              : "👨‍🏫 Teacher"}
                            {" • "}
                            {record.time}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {(record.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
