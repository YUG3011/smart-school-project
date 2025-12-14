import React, { useRef, useState, useEffect } from "react";
import axios from "../../services/api";

export default function RecognitionCamera({ onRecognized }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera access blocked");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg");
    setCapturedImage(base64);
  };

  const recognizeFace = async () => {
    if (!capturedImage) return;

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post("/face-recognition/recognize", {
        image_base64: capturedImage,  // <<< FIXED: Correct backend field
      });

      setResult(response.data);

      if (response.data?.matched && onRecognized) {
        onRecognized(response.data);
      }
    } catch (error) {
      console.error("Recognition error:", error);
      setResult({ error: "Recognition failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Face Recognition</h3>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "300px", borderRadius: "10px" }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={captureImage}
          disabled={!isCameraReady}
          style={{ padding: "8px 14px", marginRight: "10px" }}
        >
          Capture
        </button>

        <button
          onClick={recognizeFace}
          disabled={!capturedImage || loading}
          style={{ padding: "8px 14px" }}
        >
          {loading ? "Recognizing..." : "Recognize"}
        </button>
      </div>

      {capturedImage && (
        <div style={{ marginTop: "15px" }}>
          <h4>Captured Image:</h4>
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "200px", borderRadius: "10px" }}
          />
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h4>Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
