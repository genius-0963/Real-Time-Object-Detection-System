"""
YOLOv8 Object Detection Module

This file would be part of a Python backend service running on a server.
It uses Ultralytics YOLOv8 for object detection and OpenCV for video processing.

Note: This code is for reference and would not run in the current web environment.
It would need to be deployed on a server with Python, OpenCV, and YOLOv8 installed.
"""

import cv2
import numpy as np
import time
from ultralytics import YOLO
from typing import List, Tuple, Dict, Optional, Any


class YOLOv8Detector:
    """YOLOv8 object detector with video processing capabilities"""
    
    def __init__(self, model_name: str = "yolov8n.pt", conf_threshold: float = 0.5):
        """
        Initialize YOLOv8 detector
        
        Args:
            model_name: YOLOv8 model name (n, s, m, l, x)
            conf_threshold: Confidence threshold for detections
        """
        self.model = YOLO(model_name)
        self.conf_threshold = conf_threshold
        self.class_names = self.model.names
        
    def detect_image(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects in a single image
        
        Args:
            image: Image as numpy array (BGR format from OpenCV)
            
        Returns:
            List of detections with class, confidence, and bounding box
        """
        results = self.model(image, conf=self.conf_threshold)[0]
        detections = []
        
        for r in results.boxes.data.cpu().numpy():
            x1, y1, x2, y2, conf, cls = r
            
            # Convert to normalized coordinates for consistent API
            height, width = image.shape[:2]
            x_norm = x1 / width
            y_norm = y1 / height
            w_norm = (x2 - x1) / width
            h_norm = (y2 - y1) / height
            
            detection = {
                "class": self.class_names[int(cls)],
                "confidence": float(conf),
                "bbox": [float(x_norm), float(y_norm), float(w_norm), float(h_norm)]
            }
            detections.append(detection)
            
        return detections
    
    def process_video_stream(self, video_source: int = 0, output_path: Optional[str] = None):
        """
        Process video stream from webcam or file and optionally save output
        
        Args:
            video_source: Camera index or video file path
            output_path: Path to save processed video (None to skip saving)
        """
        # Open video capture
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            raise ValueError(f"Failed to open video source: {video_source}")
        
        # Setup video writer if output path is provided
        writer = None
        if output_path:
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Detect objects
                start_time = time.time()
                detections = self.detect_image(frame)
                fps = 1 / (time.time() - start_time)
                
                # Draw detections on frame
                self._draw_detections(frame, detections)
                
                # Add FPS counter
                cv2.putText(
                    frame, f"FPS: {fps:.2f}", (20, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
                )
                
                # Display frame
                cv2.imshow('YOLOv8 Detection', frame)
                
                # Write frame to output video
                if writer:
                    writer.write(frame)
                
                # Exit on 'q' key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                
        finally:
            cap.release()
            if writer:
                writer.release()
            cv2.destroyAllWindows()
    
    def _draw_detections(self, image: np.ndarray, detections: List[Dict[str, Any]]) -> None:
        """
        Draw detection bounding boxes and labels on image
        
        Args:
            image: Image to draw on (modified in-place)
            detections: List of detection results
        """
        height, width = image.shape[:2]
        
        for det in detections:
            # Get values
            cls_name = det["class"]
            conf = det["confidence"]
            x, y, w, h = det["bbox"]
            
            # Convert normalized coordinates to pixel values
            x1 = int(x * width)
            y1 = int(y * height)
            x2 = int((x + w) * width)
            y2 = int((y + h) * height)
            
            # Generate color based on class name (consistent colors for each class)
            color = self._get_color_for_class(cls_name)
            
            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            
            # Draw label background
            label = f"{cls_name} {conf:.2f}"
            text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
            cv2.rectangle(
                image, 
                (x1, y1 - text_size[1] - 5), 
                (x1 + text_size[0], y1), 
                color, 
                -1
            )
            
            # Draw label text
            cv2.putText(
                image, label, (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2
            )
    
    def _get_color_for_class(self, class_name: str) -> Tuple[int, int, int]:
        """
        Get consistent color for object class
        
        Args:
            class_name: Name of the object class
            
        Returns:
            BGR color tuple
        """
        # Map common classes to specific colors
        color_map = {
            "person": (0, 0, 255),       # Red
            "car": (255, 0, 0),          # Blue
            "truck": (255, 0, 128),      # Purple-Blue
            "motorcycle": (0, 255, 0),   # Green
            "bicycle": (128, 0, 128),    # Purple
            "bus": (0, 255, 255),        # Yellow
        }
        
        # Use predefined color if available, otherwise hash the class name to a color
        if class_name in color_map:
            return color_map[class_name]
        else:
            # Generate a color based on hash of class name
            hash_value = hash(class_name) % 255
            return ((hash_value * 17) % 255, (hash_value * 43) % 255, (hash_value * 71) % 255)


def main():
    """Example usage of YOLOv8Detector"""
    # Initialize detector
    detector = YOLOv8Detector(model_name="yolov8n.pt", conf_threshold=0.5)
    
    # Process webcam feed (0) or video file
    detector.process_video_stream(video_source=0, output_path="output.mp4")


if __name__ == "__main__":
    main()