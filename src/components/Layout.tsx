import React, { ReactNode } from 'react';
import { Camera, Upload, Github } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { videoSource, setVideoSource, isDetecting, setIsDetecting } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold">YOLOv8 Object Detection</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setVideoSource('webcam');
                if (isDetecting) setIsDetecting(false);
              }}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                videoSource === 'webcam'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Camera className="h-4 w-4 mr-2" />
              <span>Webcam</span>
            </button>
            <button
              onClick={() => {
                setVideoSource('file');
                if (isDetecting) setIsDetecting(false);
              }}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                videoSource === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Upload Video</span>
            </button>
            <a
              href="https://github.com/ultralytics/ultralytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <Github className="h-4 w-4 mr-2" />
              <span>YOLOv8 Docs</span>
            </a>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Real-Time Object Detection System using YOLOv8 • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};