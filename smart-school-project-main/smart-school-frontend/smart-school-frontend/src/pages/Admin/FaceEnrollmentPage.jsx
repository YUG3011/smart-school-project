import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import Sidebar from "../../components/layout/Sidebar";

export default function FaceEnrollmentPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [needsEnrollment, setNeedsEnrollment] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data.students || []);
      
      // Fetch those needing enrollment
      const enrollRes = await API.get("/face-recognition/needing-enrollment");
      setNeedsEnrollment(enrollRes.data.students || []);
      
      if (enrollRes.data.students && enrollRes.data.students.length > 0) {
        setSelectedStudent(enrollRes.data.students[0].id);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/face-recognition/stats");
      setStats(res.data.enrollment_stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
      setMessage("Camera started. Position your face and click Capture.");
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

  const capturePhoto = () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) return;
      
      const ctx = canvas.getContext("2d");
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      setCaptured(true);
      setMessage("✅ Photo captured. Review and submit.");
    } catch (error) {
      console.error("Error capturing photo:", error);
      setMessage("❌ Error capturing photo");
    }
  };

  const submitEnrollment = async () => {
    try {
      if (!selectedStudent || !capturedImage) {
        setMessage("❌ Please select a student and capture a photo");
        return;
      }

      setLoading(true);

      // Convert image to base64 (remove data URL prefix)
      const base64Image = capturedImage.split(",")[1];

      const res = await API.post("/face-recognition/enroll", {
        student_id: parseInt(selectedStudent),
        image: base64Image,
        notes: "Enrolled via face recognition UI",
      });

      if (res.data) {
        setMessage(`✅ ${res.data.message}`);
        setCaptured(false);
        setCapturedImage(null);
        setSelectedStudent("");
        
        // Refresh stats and students needing enrollment
        setTimeout(() => {
          fetchStats();
          fetchStudents();
        }, 1500);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error enrolling face:", error);
      setMessage(`❌ ${error.response?.data?.error || "Enrollment failed"}`);
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setCaptured(false);
    setCapturedImage(null);
    setMessage("Camera ready. Position your face again.");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Face Enrollment</h1>
            <p className="text-gray-600">Enroll student faces for attendance recognition</p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Enrolled Students</p>
                <p className="text-3xl font-bold text-green-600">{stats.enrolled_students}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total_students}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Total Embeddings</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total_embeddings}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Enrollment %</p>
                <p className="text-3xl font-bold text-orange-600">{stats.enrollment_percentage}%</p>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : message.includes("❌")
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Section */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Camera Capture</h2>

              {/* Student Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Student to Enroll</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={cameraActive || loading}
                >
                  <option value="">Choose a student...</option>
                  {needsEnrollment.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video/Preview Area */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: "4/3" }}>
                {!captured ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    No image captured
                  </div>
                )}
              </div>

              {/* Hidden Canvas */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Camera Controls */}
              <div className="flex gap-4">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
                  >
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={capturePhoto}
                      disabled={loading || captured}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Stop Camera
                    </button>
                  </>
                )}
              </div>

              {/* Photo Controls */}
              {captured && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={retakePhoto}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:bg-gray-400"
                  >
                    Retake Photo
                  </button>
                  <button
                    onClick={submitEnrollment}
                    disabled={loading || !selectedStudent}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400"
                  >
                    {loading ? "Enrolling..." : "Submit Enrollment"}
                  </button>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📸 Steps:</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click "Start Camera"</li>
                    <li>Position face in frame</li>
                    <li>Click "Capture Photo"</li>
                    <li>Review photo</li>
                    <li>Click "Submit Enrollment"</li>
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">⚠️ Tips:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure good lighting</li>
                    <li>Face should be centered</li>
                    <li>Look directly at camera</li>
                    <li>Avoid glasses or shadows</li>
                    <li>Use clear background</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Requirements:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Clear frontal face view</li>
                    <li>Good image quality</li>
                    <li>Only one person in frame</li>
                    <li>Minimum 400x400 pixels</li>
                  </ul>
                </div>

                <div className="border-t pt-4 bg-blue-50 p-3 rounded">
                  <p className="text-blue-900 font-medium">
                    Students to enroll: {needsEnrollment.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
