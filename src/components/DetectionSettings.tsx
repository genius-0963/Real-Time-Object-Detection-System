import React from 'react';
import { useAppContext } from '../context/AppContext';

export const DetectionSettings: React.FC = () => {
  const { 
    selectedModel, 
    setSelectedModel, 
    confidenceThreshold, 
    setConfidenceThreshold 
  } = useAppContext();

  return (
    <div className="mt-4 p-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Detection Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YOLOv8 Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="yolov8n">YOLOv8 Nano (fastest)</option>
            <option value="yolov8s">YOLOv8 Small</option>
            <option value="yolov8m">YOLOv8 Medium</option>
            <option value="yolov8l">YOLOv8 Large</option>
            <option value="yolov8x">YOLOv8 XLarge (most accurate)</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Larger models are more accurate but slower to process.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confidence Threshold: {confidenceThreshold.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Low (more detections)</span>
            <span>High (fewer, more confident)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Detection Classes</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['Person', 'Car', 'Truck', 'Bus', 'Motorcycle', 'Bicycle'].map((cls) => (
            <div key={cls} className="flex items-center">
              <input
                type="checkbox"
                id={`class-${cls}`}
                defaultChecked
                className="h-4 w-4 accent-blue-500 rounded"
              />
              <label htmlFor={`class-${cls}`} className="ml-2 text-sm text-gray-300">
                {cls}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};