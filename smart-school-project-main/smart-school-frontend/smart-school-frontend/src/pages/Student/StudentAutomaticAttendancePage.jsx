import { useEffect, useRef, useState } from "react";
import API from "../../services/api";

export default function StudentAutomaticAttendancePage() {
  // State management
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const processedRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tolerance, setTolerance] = useState(0.5);
  const [result, setResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [stream, setStream] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [markedToday, setMarkedToday] = useState(false);

  // Auto-capture and mark attendance every 500ms
  const autoProcessFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    // Skip if already processed today
    if (processedRef.current) return;

    try {
      const context = canvasRef.current.getContext("2d");
      const video = videoRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      context.drawImage(video, 0, 0);
      
      // Use lower quality (0.7) to keep payload size small and reduce 422 errors
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.7);
      const base64Image = imageData.replace(/^data:image\/jpeg;base64,/, "");

      if (!base64Image || base64Image.length < 100) {
        console.log("Image too small, skipping frame");
        return;
      }

      console.log(`Image size: ${(base64Image.length / 1024).toFixed(2)}KB`);

      // Send to backend
      const response = await API.post("/api/auto-attendance/mark-student", {
        image: base64Image,
        tolerance: tolerance,
      });

      if (response.data.success) {
        processedRef.current = true;

        setResult(response.data);
        setShowPopup(true);
        setMarkedToday(true);
        setStatusMessage(
          `✅ Your attendance has been marked as ${response.data.status}`
        );

        // Auto-hide popup and stop camera
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);

        setTimeout(() => {
          stopCamera();
        }, 2000);
      } else if (response.data.already_marked) {
        processedRef.current = true;

        setResult(response.data);
        setShowPopup(true);
        setMarkedToday(true);
        setStatusMessage("⚠️ You have already marked attendance today");

        setTimeout(() => {
          setShowPopup(false);
        }, 2000);
      }
    } catch (err) {
      // Log errors for debugging
      if (err.response?.status === 422) {
        console.error("422 Error - Malformed request:", err.response.data);
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
      processedRef.current = false;
      setStatusMessage("Opening camera...");
      setResult(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setStatusMessage("📹 Camera active - showing your face to mark attendance");

        // Start auto-processing
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

  const resetSession = () => {
    processedRef.current = false;
    setResult(null);
    setMarkedToday(false);
    setStatusMessage("");
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
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
                <div className="text-5xl mb-3">✅</div>
                <div className="text-2xl">Attendance Marked!</div>
                <div className="text-sm mt-3 opacity-90">
                  Status: {result.status}
                </div>
                <div className="text-xs mt-2 opacity-80">
                  Time: {result.time}
                </div>
              </div>
            )}
            {result?.already_marked && (
              <div>
                <div className="text-5xl mb-3">⚠️</div>
                <div className="text-2xl">Already Marked</div>
                <div className="text-sm mt-3 opacity-90">
                  You can only mark once per day
                </div>
              </div>
            )}
            {!result?.success && !result?.already_marked && (
              <div>
                <div className="text-5xl mb-3">❌</div>
                <div className="text-2xl">Not Recognized</div>
                <div className="text-xs mt-2 opacity-90">Try again with better lighting</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Mark Your Attendance</h1>
        <p className="text-gray-600 text-lg">
          Use face recognition to mark attendance automatically
        </p>
      </div>

      {/* Today's Status */}
      {markedToday && (
        <div className="mb-6 p-4 rounded-lg bg-green-100 border-2 border-green-500 text-green-800 font-semibold">
          ✅ Your attendance has been marked for today
        </div>
      )}

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
              <div className="mb-6 flex items-center justify-center h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <div className="text-gray-700 font-semibold">
                    Ready to mark attendance?
                  </div>
                  <div className="text-gray-600 text-sm mt-2">
                    Click the button below to start
                  </div>
                </div>
              </div>
            )}

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Status Message */}
            {statusMessage && (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border-2 border-blue-300 text-blue-800 font-semibold">
                ℹ️ {statusMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              {!cameraActive && (
                <button
                  onClick={startCamera}
                  disabled={markedToday}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  📷 START CAMERA
                </button>
              )}

              {cameraActive && (
                <>
                  <button
                    onClick={stopCamera}
                    className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg"
                  >
                    ⏹ STOP CAMERA
                  </button>
                </>
              )}

              {markedToday && !cameraActive && (
                <button
                  onClick={resetSession}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
                >
                  🔄 START OVER
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4">📋 Instructions</h3>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex gap-2">
                <span className="text-lg">1️⃣</span>
                <div>
                  <strong>Click Start Camera</strong>
                  <p className="text-gray-600 text-xs mt-1">Allow camera access when prompted</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-lg">2️⃣</span>
                <div>
                  <strong>Show Your Face</strong>
                  <p className="text-gray-600 text-xs mt-1">Look directly at camera in good lighting</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-lg">3️⃣</span>
                <div>
                  <strong>Automatic Recognition</strong>
                  <p className="text-gray-600 text-xs mt-1">System scans and recognizes your face</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-lg">4️⃣</span>
                <div>
                  <strong>Attendance Marked</strong>
                  <p className="text-gray-600 text-xs mt-1">Success notification will appear</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                {markedToday ? (
                  <div className="text-green-600">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="font-bold">Marked for Today</div>
                    <div className="text-xs text-gray-600 mt-2">
                      Come back tomorrow to mark again
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <div className="text-3xl mb-2">⏳</div>
                    <div className="font-bold">Ready to Mark</div>
                    <div className="text-xs text-gray-600 mt-2">
                      Click Start Camera to begin
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
