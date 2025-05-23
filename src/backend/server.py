"""
FastAPI Server for YOLOv8 Object Detection

This file would be part of a Python backend service running on a server.
It creates a REST API for object detection using the YOLOv8 model.

Note: This code is for reference and would not run in the current web environment.
It would need to be deployed on a server with Python, FastAPI, and YOLOv8 installed.
"""

import base64
import io
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
from pydantic import BaseModel

# Import YOLOv8 detector class
from yolov8_detector import YOLOv8Detector


# Initialize FastAPI app
app = FastAPI(title="YOLOv8 Object Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector with default model
detector = YOLOv8Detector(model_name="yolov8n.pt", conf_threshold=0.5)


# Response models
class DetectionResult(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]


class DetectionResponse(BaseModel):
    results: List[DetectionResult]
    processed_image: Optional[str] = None


@app.post("/detect", response_model=DetectionResponse)
async def detect_objects(
    file: UploadFile = File(...),
    confidence: float = Form(0.5),
    model: str = Form("yolov8n"),
    return_image: bool = Form(False)
):
    """
    Detect objects in an uploaded image
    
    Args:
        file: Image file
        confidence: Detection confidence threshold (0-1)
        model: YOLOv8 model size (n, s, m, l, x)
        return_image: Whether to return the processed image
        
    Returns:
        Detection results and optionally the processed image
    """
    # Read image file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Update detector settings
    detector.conf_threshold = confidence
    
    # Perform detection
    detections = detector.detect_image(img)
    
    # Format results
    results = [
        DetectionResult(
            class_name=det["class"],
            confidence=det["confidence"],
            bbox=det["bbox"]
        )
        for det in detections
    ]
    
    # Process and return image if requested
    processed_image = None
    if return_image:
        # Draw detections on image
        detector._draw_detections(img, detections)
        
        # Encode image to base64
        _, buffer = cv2.imencode('.jpg', img)
        processed_image = base64.b64encode(buffer).decode('utf-8')
    
    return DetectionResponse(results=results, processed_image=processed_image)


@app.get("/models")
async def list_models():
    """List available YOLOv8 models"""
    return {
        "models": [
            {"id": "yolov8n", "name": "YOLOv8 Nano", "description": "Smallest and fastest model"},
            {"id": "yolov8s", "name": "YOLOv8 Small", "description": "Small model, good balance"},
            {"id": "yolov8m", "name": "YOLOv8 Medium", "description": "Medium-sized model"},
            {"id": "yolov8l", "name": "YOLOv8 Large", "description": "Large model, high accuracy"},
            {"id": "yolov8x", "name": "YOLOv8 XLarge", "description": "Largest, most accurate model"}
        ]
    }


if __name__ == "__main__":
    # Run server with uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)