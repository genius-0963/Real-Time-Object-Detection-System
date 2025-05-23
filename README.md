# Real-Time Object Detection System with YOLOv8

This project demonstrates a real-time object detection system using YOLOv8. It consists of two main components:

1. A React-based frontend for video capture and visualization
2. A Python backend implementation using YOLOv8 and OpenCV

## Project Structure

```
├── src/
│   ├── components/        # React components for the UI
│   ├── context/           # React context for state management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── backend/           # Python backend implementation (reference)
│   └── App.tsx            # Main application component
```

## Features

- Live video capture from webcam or file upload
- Object detection for vehicles, people, and other common objects
- Real-time visualization with bounding boxes and labels
- Detection statistics dashboard
- Video recording and export capabilities
- Adjustable detection settings (confidence threshold, model selection)

## Frontend Implementation

The frontend is built with React and TypeScript, providing a user interface for:

- Selecting video sources (webcam or file upload)
- Controlling detection settings
- Visualizing detection results
- Displaying statistics
- Recording and downloading processed video

## Backend Implementation (Reference)

The Python backend code is provided as a reference implementation that would run on a server:

- `yolov8_detector.py` - Core YOLOv8 detection implementation
- `server.py` - FastAPI server exposing detection endpoints

In a production environment, this backend would process video frames sent from the frontend and return detection results.

## Running the Frontend Demo

The current implementation includes a frontend demo that simulates detection results. To run it:

```bash
npm install
npm run dev
```

## Setting Up a Production Backend

To implement the actual YOLOv8 backend:

1. Set up a Python environment with required dependencies:
   ```bash
   pip install ultralytics opencv-python fastapi uvicorn python-multipart
   ```

2. Deploy the Python backend files to a server

3. Configure the frontend to connect to your backend API

## Dependencies

Frontend:
- React
- TypeScript
- Tailwind CSS
- Lucide React (icons)

Backend (reference implementation):
- Python
- Ultralytics YOLOv8
- OpenCV
- FastAPI