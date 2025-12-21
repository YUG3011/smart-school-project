import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

const EnrollmentModal = ({ open, onClose, onEnrolled, userId, role }) => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (open) {
      startVideoStream();
    } else {
      stopVideoStream();
    }
  }, [open]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setEnrollmentMessage(null);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setEnrollmentMessage('Could not access camera. Please grant permission.');
    }
  };

  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setEnrollmentMessage(null);
  };

  const captureAndEnroll = async () => {
    if (!videoRef.current || isEnrolling) return;

    setIsEnrolling(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/jpeg');

    try {
      const response = await api.post('/face/enroll', {
        image: imageDataURL,
        user_id: userId,
        role: role,
      });

      if (response.data.status === 'success') {
        setEnrollmentMessage('Face enrolled successfully!');
        onEnrolled();
      } else {
        setEnrollmentMessage(response.data.error || 'Enrollment failed.');
      }
    } catch (error) {
      console.error('Enrollment API error:', error);
      setEnrollmentMessage(error.response?.data?.error || 'An error occurred during enrollment.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Enroll Face</h2>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto rounded"
            style={{ display: isStreaming ? 'block' : 'none' }}
          />
          {!isStreaming && (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded">
              <p className="text-gray-500">{enrollmentMessage || 'Starting camera...'}</p>
            </div>
          )}
        </div>

        {enrollmentMessage && (
          <div className={`mt-4 p-4 rounded text-center ${enrollmentMessage.includes('success') ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
            <p className="font-semibold text-lg">{enrollmentMessage}</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={captureAndEnroll}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={isEnrolling}
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll Face'}
          </button>
          <button
            onClick={() => {
              stopVideoStream();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;
