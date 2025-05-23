import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DetectionResult } from '../types';

interface AppContextType {
  videoSource: 'webcam' | 'file' | null;
  setVideoSource: (source: 'webcam' | 'file' | null) => void;
  isDetecting: boolean;
  setIsDetecting: (detecting: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (threshold: number) => void;
  detectionResults: DetectionResult[];
  setDetectionResults: (results: DetectionResult[]) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  uploadedVideo: string | null;
  setUploadedVideo: (video: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [videoSource, setVideoSource] = useState<'webcam' | 'file' | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedModel, setSelectedModel] = useState('yolov8n');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        videoSource,
        setVideoSource,
        isDetecting,
        setIsDetecting,
        selectedModel,
        setSelectedModel,
        confidenceThreshold,
        setConfidenceThreshold,
        detectionResults,
        setDetectionResults,
        isRecording,
        setIsRecording,
        uploadedVideo,
        setUploadedVideo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};