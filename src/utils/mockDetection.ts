import { DetectionResult } from '../types';

// Classes that YOLOv8 can detect
const DETECTION_CLASSES = [
  'person',
  'car',
  'truck',
  'motorcycle',
  'bicycle',
  'bus',
  'traffic light',
  'stop sign',
  'bench',
  'dog',
  'cat'
];

/**
 * Generate mock detection results to simulate YOLOv8 output
 * In a real application, this would be replaced with actual YOLOv8 API calls
 */
export const mockDetection = (confidenceThreshold: number): DetectionResult[] => {
  // Randomly determine how many objects to detect (0-10)
  const numObjects = Math.floor(Math.random() * 10);
  const results: DetectionResult[] = [];
  
  for (let i = 0; i < numObjects; i++) {
    // Generate random confidence score
    const confidence = Math.random();
    
    // Only include results above the confidence threshold
    if (confidence >= confidenceThreshold) {
      // Random class selection
      const classIndex = Math.floor(Math.random() * DETECTION_CLASSES.length);
      const className = DETECTION_CLASSES[classIndex];
      
      // Random bounding box (normalized coordinates)
      const x = Math.random() * 0.8; // Keep within frame
      const y = Math.random() * 0.8;
      const width = Math.random() * 0.2 + 0.1; // Between 0.1 and 0.3
      const height = Math.random() * 0.2 + 0.1;
      
      results.push({
        class: className,
        confidence,
        bbox: [x, y, width, height]
      });
    }
  }
  
  return results;
};