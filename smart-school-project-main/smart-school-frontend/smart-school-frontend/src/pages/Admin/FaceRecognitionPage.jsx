import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import Sidebar from "../../components/layout/Sidebar";

export default function FaceRecognitionAttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [recentMatches, setRecentMatches] = useState([]);
  const [tolerance, setTolerance] = useState(0.6);
  const [markAttendanceMode, setMarkAttendanceMode] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
      setMessage("Camera started. Position face for recognition.");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setMessage("❌ Cannot access camera. Check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const captureAndRecognize = async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) return;
      
      setLoading(true);
      
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL("image/jpeg");
      const base64Image = imageData.split(",")[1];

      // Send for recognition
      const res = await API.post("/face-recognition/recognize", {
        image: base64Image,
        tolerance: tolerance,
        mark_attendance: markAttendanceMode,
      });

      if (res.data) {
        setRecognitionResults(res.data);
        
        if (res.data.matched && res.data.best_match) {
          setMessage(`✅ Recognized: ${res.data.best_match.student_name}`);
          
          // Add to recent matches
          setRecentMatches([
            {
              ...res.data.best_match,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...recentMatches.slice(0, 9),
          ]);
          
          if (markAttendanceMode && res.data.attendance_marked) {
            setAttendanceMarked(true);
            setTimeout(() => setAttendanceMarked(false), 3000);
          }
        } else {
          setMessage("❌ No match found. Try again.");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error recognizing face:", error);
      setMessage(`❌ ${error.response?.data?.error || "Recognition failed"}`);
      setLoading(false);
    }
  };

  const clearResults = () => {
    setRecognitionResults(null);
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Face Recognition Attendance</h1>
            <p className="text-gray-600">Real-time face recognition for attendance marking</p>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg font-medium ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : message.includes("❌")
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {message}
            </div>
          )}

          {/* Attendance Marked Alert */}
          {attendanceMarked && (
            <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-800 font-medium animate-pulse">
              ✅ Attendance marked successfully!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Section */}
            <div className="lg:col-span-2">
              {/* Camera Feed */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Camera Feed</h2>
                
                <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: "4/3" }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                <canvas ref={canvasRef} style={{ display: "none" }} />

                {/* Controls */}
                <div className="flex gap-4 mb-6">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Start Camera
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={captureAndRecognize}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                      >
                        {loading ? "Recognizing..." : "Recognize Face"}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Stop Camera
                      </button>
                    </>
                  )}
                </div>

                {/* Settings */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tolerance: {tolerance.toFixed(2)}
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
                      <p className="text-xs text-gray-600 mt-1">
                        Lower = stricter matching, Higher = more lenient
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="markAttendance"
                        checked={markAttendanceMode}
                        onChange={(e) => setMarkAttendanceMode(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <label htmlFor="markAttendance" className="font-medium">
                        Auto-mark attendance on recognition
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recognition Results */}
              {recognitionResults && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Recognition Results</h2>
                    <button
                      onClick={clearResults}
                      className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                    >
                      Clear
                    </button>
                  </div>

                  {recognitionResults.matched && recognitionResults.best_match ? (
                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-500">
                      <p className="text-lg font-semibold text-green-900 mb-4">✅ Match Found!</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Student Name</p>
                          <p className="text-2xl font-bold text-green-700">
                            {recognitionResults.best_match.student_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Class</p>
                          <p className="text-2xl font-bold text-green-700">
                            {recognitionResults.best_match.class_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-2xl font-bold text-green-700">
                            {(recognitionResults.best_match.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="text-2xl font-bold text-green-700">
                            {recognitionResults.best_match.distance.toFixed(3)}
                          </p>
                        </div>
                      </div>

                      {recognitionResults.all_matches.length > 1 && (
                        <div className="mt-6 pt-6 border-t">
                          <p className="font-semibold mb-3">Other Possible Matches:</p>
                          <div className="space-y-2">
                            {recognitionResults.all_matches.slice(1, 3).map((match, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-white rounded border"
                              >
                                <span>{match.student_name}</span>
                                <span className="text-sm text-gray-600">
                                  {(match.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-6 rounded-lg border-2 border-red-500">
                      <p className="text-lg font-semibold text-red-900">
                        ❌ No Match Found
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        No enrolled faces matched with confidence threshold of {tolerance.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent Recognitions</h2>

              {recentMatches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No recognitions yet. Start capturing faces.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentMatches.map((match, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300"
                    >
                      <p className="font-semibold text-gray-900">{match.student_name}</p>
                      <p className="text-sm text-gray-600">{match.class_name}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">{match.timestamp}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                          {(match.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">📝 Tips</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Good lighting is essential</li>
                  <li>✓ Face should be centered</li>
                  <li>✓ Look directly at camera</li>
                  <li>✓ Adjust tolerance if needed</li>
                  <li>✓ Try different angles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
