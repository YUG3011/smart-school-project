import React, { useRef, useState, useEffect } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(s);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }

      setActive(true);
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Cannot access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setActive(false);
  };

  const capture = () => {
    if (!canvasRef.current || !videoRef.current) {
      alert("Camera not ready");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg");

    console.log("Captured Image Base64 Length:", base64.length);

    if (onCapture) {
      onCapture(base64);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded border"
      />

      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="flex gap-3 mt-3">
        {!active ? (
          <button className="bg-green-600 text-white px-4 py-2" onClick={startCamera}>
            Start Camera
          </button>
        ) : (
          <>
            <button className="bg-blue-600 text-white px-4 py-2" onClick={capture}>
              Capture Photo
            </button>
            <button className="bg-red-600 text-white px-4 py-2" onClick={stopCamera}>
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
