import React, { useState, useRef } from "react";
import API from "../../services/api";

export default function TeacherAutoAttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [tolerance, setTolerance] = useState(0.6);
  const [markedToday, setMarkedToday] = useState(false);

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

  // Mark attendance
  const markAttendance = async () => {
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
      console.log("Sending to /api/auto-attendance/mark-teacher...");

      const response = await API.post("/api/auto-attendance/mark-teacher", {
        image: imageBase64,
        tolerance: parseFloat(tolerance),
      });

      setRecognitionResult(response.data);

      if (response.data.matched && response.data.attendance_marked) {
        setMessage("✅ Your attendance has been marked!");
        setMarkedToday(true);
      } else if (response.data.matched) {
        setMessage("⚠️ Face recognized but marking failed");
      } else {
        setMessage("❌ Face not recognized. Please ensure you are enrolled.");
      }
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Reset for next capture
  const reset = () => {
    setCapturedImage(null);
    setRecognitionResult(null);
    if (cameraActive) {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ Mark Attendance
          </h1>
          <p className="text-gray-600">
            Use face recognition to mark your attendance
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Status Badge */}
          {markedToday && (
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
              <p className="text-green-700 font-bold text-lg">
                ✅ Attendance marked for today!
              </p>
            </div>
          )}

          {/* Camera Section */}
          <div className="mb-6">
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
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md"
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
                    📸 Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md"
                  >
                    ⏹️ Stop
                  </button>
                </>
              )}
            </div>

            {/* Captured Image Actions */}
            {capturedImage && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={markAttendance}
                  disabled={loading}
                  className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all shadow-md disabled:bg-gray-400"
                >
                  {loading ? "Processing..." : "✅ Mark Attendance"}
                </button>
                <button
                  onClick={reset}
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
          </div>

          {/* Recognition Result */}
          {recognitionResult && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Recognition Result
              </h3>
              {recognitionResult.matched ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-600">
                      Status
                    </p>
                    <p className="text-lg font-bold text-green-700">
                      ✅ Face Recognized
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-600">
                      Confidence
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {(
                        recognitionResult.best_match?.confidence * 100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-800 font-semibold">
                    ❌ Face not recognized
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tolerance Control */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Recognition Sensitivity: {tolerance.toFixed(2)}
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
              Lower = Stricter, Higher = More lenient matching
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <h4 className="font-bold text-blue-900 mb-2">💡 Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure you are well-lit and facing the camera</li>
            <li>• Your face should be clearly visible in the frame</li>
            <li>• Attendance is marked once per day</li>
            <li>
              • If recognition fails, contact your administrator for re-enrollment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
