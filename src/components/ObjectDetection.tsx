import React, { useRef, useEffect, useState } from 'react';
import { Play, Square, Settings, Download, Camera, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { VideoControls } from './VideoControls';
import { DetectionSettings } from './DetectionSettings';
import { StatisticsPanel } from './StatisticsPanel';
import { mockDetection } from '../utils/mockDetection';

export const ObjectDetection: React.FC = () => {
  const {
    videoSource,
    isDetecting,
    setIsDetecting,
    detectionResults,
    setDetectionResults,
    isRecording,
    setIsRecording,
    uploadedVideo,
    setUploadedVideo,
    confidenceThreshold
  } = useAppContext();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [hasVideo, setHasVideo] = useState(false);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
    }
  };

  // Initialize webcam
  useEffect(() => {
    if (videoSource === 'webcam') {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play(); // Ensure video starts playing
            setHasVideo(true);
            
            // Setup media recorder for webcam
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                chunks.push(e.data);
              }
            };
            
            recorder.onstop = () => {
              setRecordedChunks(chunks.slice());
            };
            
            setMediaRecorder(recorder);
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
          alert('Unable to access webcam. Please make sure you have given permission.');
        });
      
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
          setHasVideo(false);
        }
      };
    } else if (videoSource === 'file' && uploadedVideo) {
      setHasVideo(true);
    } else {
      setHasVideo(false);
    }
  }, [videoSource, uploadedVideo]);

  // Handle recording
  useEffect(() => {
    if (mediaRecorder) {
      if (isRecording) {
        setRecordedChunks([]);
        mediaRecorder.start();
      } else if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }
  }, [isRecording, mediaRecorder]);

  // Handle detection
  useEffect(() => {
    let animationFrameId: number;

    const detect = () => {
      if (!isDetecting || !hasVideo || !videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Ensure canvas dimensions match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      if (video.readyState === 4) { // Video is ready
        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Generate mock detection results
        const results = mockDetection(confidenceThreshold);
        setDetectionResults(results);
        
        // Draw bounding boxes
        results.forEach(obj => {
          const { bbox, class: className, confidence } = obj;
          const [x, y, width, height] = bbox;
          
          // Adjust coordinates to canvas size
          const scaledX = x * canvas.width;
          const scaledY = y * canvas.height;
          const scaledWidth = width * canvas.width;
          const scaledHeight = height * canvas.height;
          
          // Draw bounding box
          ctx.strokeStyle = getColorForClass(className);
          ctx.lineWidth = 2;
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
          
          // Draw label background
          ctx.fillStyle = getColorForClass(className);
          const label = `${className} ${Math.round(confidence * 100)}%`;
          const textMetrics = ctx.measureText(label);
          const textHeight = 20;
          ctx.fillRect(
            scaledX, 
            scaledY - textHeight,
            textMetrics.width + 10,
            textHeight
          );
          
          // Draw label text
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px Arial';
          ctx.fillText(
            label,
            scaledX + 5,
            scaledY - 5
          );
        });
      }
      
      animationFrameId = requestAnimationFrame(detect);
    };
    
    detect();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDetecting, hasVideo, confidenceThreshold, setDetectionResults]);

  // Color mapping for object classes
  const getColorForClass = (className: string): string => {
    const colorMap: Record<string, string> = {
      person: '#FF3B30',
      car: '#5AC8FA',
      truck: '#007AFF',
      motorcycle: '#34C759',
      bicycle: '#AF52DE',
      bus: '#FF9500',
      default: '#5856D6'
    };
    
    return colorMap[className] || colorMap.default;
  };

  // Download recorded video
  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'detection-recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg relative">
          {!hasVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              {videoSource === 'file' ? (
                <div className="text-center p-8">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                  <p className="mb-4">Upload a video file to begin</p>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                    Select Video File
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a video source to begin</p>
                </div>
              )}
            </div>
          )}
          
          <div className={hasVideo ? 'block' : 'hidden'}>
            {videoSource === 'webcam' && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full ${isDetecting ? 'hidden' : 'block'}`}
              />
            )}
            
            {videoSource === 'file' && uploadedVideo && (
              <video
                ref={videoRef}
                src={uploadedVideo}
                autoPlay
                playsInline
                controls
                loop
                className={`w-full ${isDetecting ? 'hidden' : 'block'}`}
              />
            )}
            
            <canvas
              ref={canvasRef}
              className={`w-full ${isDetecting ? 'block' : 'hidden'}`}
            />
          </div>
        </div>
        
        {hasVideo && (
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDetecting(!isDetecting)}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isDetecting
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {isDetecting ? (
                    <>
                      <Square className="w-4 h-4 mr-2" /> Stop Detection
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Start Detection
                    </>
                  )}
                </button>
                
                {videoSource === 'webcam' && isDetecting && (
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    } transition-colors`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 mr-2 rounded-full bg-red-500" />
                        Record
                      </>
                    )}
                  </button>
                )}
                
                {recordedChunks.length > 0 && (
                  <button
                    onClick={downloadRecording}
                    className="flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Recording
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </button>
            </div>
            
            {showSettings && <DetectionSettings />}
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        <StatisticsPanel />
        
        {hasVideo && videoSource === 'file' && (
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Video Controls</h3>
            <VideoControls />
          </div>
        )}
        
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">About YOLOv8</h3>
          <p className="text-gray-300 mb-3">
            YOLOv8 is a cutting-edge object detection model by Ultralytics, 
            offering significant improvements over previous versions.
          </p>
          <p className="text-gray-300 mb-3">
            This demo shows a web interface that would connect to a Python backend 
            running the actual YOLOv8 detection model.
          </p>
          <p className="text-gray-300">
            In a production environment, the detection would happen server-side with the 
            YOLOv8 Python library, processing video frames in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};