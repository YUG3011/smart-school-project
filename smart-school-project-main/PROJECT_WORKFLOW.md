# Smart School Project: Workflow and File Analysis

This document outlines the complete workflow of the Smart School project, detailing the interactions between the frontend, backend, and database for core functionalities like user enrollment and automatic attendance.

## 1. High-Level Overview

The Smart School project is a web-based application designed to automate school management tasks. Its primary feature is an automatic attendance system that uses facial recognition. The system consists of two main parts:

-   A **React-based frontend** for user interaction (e.g., admin dashboards, student portals).
-   A **Flask (Python) backend** that provides a RESTful API for handling business logic, database operations, and facial recognition.

## 2. Technology Stack

-   **Frontend**: React.js, Vite, Tailwind CSS
-   **Backend**: Flask, Python
-   **Database**: SQLite
-   **Facial Recognition**: `face_recognition` library (built on dlib)
-   **Authentication**: JWT (JSON Web Tokens)

## 3. Core Workflows

### 3.1. User Management & Face Enrollment

This workflow describes how a new user (student or teacher) is added to the system and how their face is enrolled for automatic attendance. This process is typically performed by an administrator.

1.  **Add User**: The administrator fills out a form on the frontend to add a new student or teacher. This action sends a request to the backend to create a new user record in the database.
2.  **Navigate to Enrollment Page**: The administrator navigates to the "Face Enrollment" page on the frontend.
3.  **Select User and Capture Image**: The admin selects the newly created user from a dropdown list and uses the device's camera to capture a clear picture of the user's face.
4.  **Send to Backend**: The captured image (as a base64 string) and the user's ID are sent to the backend's `/api/face/enroll` endpoint.
5.  **Generate and Store Embedding**: The backend receives the image, uses the `face_recognition` library to generate a 128-dimensional numerical vector (an "embedding") from the face, and stores this embedding in the `face_embeddings` table in the database, linked to the user's ID.

### 3.2. Automatic Attendance Marking

This workflow describes how the system recognizes a user and automatically marks their attendance.

1.  **Navigate to Recognition Page**: A user (e.g., an administrator or a teacher at the classroom door) opens the "Face Recognition" or "Automatic Attendance" page on a device with a camera.
2.  **Camera Activation**: The frontend activates the camera.
3.  **Capture and Send Frame**: The camera captures a video frame, and the image data (as a base64 string) is sent to the backend's `/api/recognize` endpoint.
4.  **Backend Recognition**:
    -   The backend generates an embedding for the face in the received image.
    -   It then queries the `face_embeddings` table to retrieve all stored embeddings.
    -   It compares the newly generated embedding with all the stored embeddings to find the closest match.
5.  **Identify User and Mark Attendance**:
    -   If a match is found with a high enough confidence level, the backend identifies the user (student or teacher).
    -   It then checks if attendance has already been marked for that user on the current day.
    -   If not, it inserts a new record into the `student_attendance` or `teacher_attendance` table with the status "Present".
6.  **Return Result**: The backend returns the result to the frontend, indicating whether a match was found and if attendance was marked.
7.  **Display Result**: The frontend displays the result to the user (e.g., "Welcome, [User Name]! Attendance marked.").

## 4. File-by-File Breakdown

### 4.1. Backend (`smart_school_backend`)

-   `app.py`: The main entry point for the Flask application. It initializes the app, configures extensions like JWT and CORS, and registers all the API blueprints (routes).

-   **Routes (`routes/`)**: These files define the API endpoints.
    -   `enrollment.py` (`/api/face/enroll`): Handles the face enrollment process. It receives an image and user ID, calls the embedding generator, and stores the result.
    -   `recognition.py` (`/api/recognize`): The core of the recognition workflow. It takes an image, finds a matching user from the stored embeddings, and returns the user's identity.
    -   `automatic_attendance.py` (`/api/auto-attendance/*`): Contains the logic to mark attendance. It uses the recognition result to create an attendance record in the database.
    -   `auth.py`: Manages user login and registration, issuing JWT tokens for authentication.
    -   `students.py` & `teachers.py`: Provide CRUD (Create, Read, Update, Delete) operations for managing students and teachers.

-   **Face Engine (`face_engine/`)**:
    -   `encoder.py`: Contains the `generate_embedding` function, which is a wrapper around the `face_recognition` library. It takes an image and returns the facial embedding.

-   **Database Models (`models/`)**: These files interact with the database.
    -   `face_recognition.py`: Provides functions to store and retrieve face embeddings from the database. It handles the conversion between NumPy arrays and the BLOB format used by SQLite.
    -   `student_attendance.py` & `teacher_attendance.py`: Manage attendance records.
    -   `user.py`, `student.py`, `teacher.py`: Manage user, student, and teacher data.

-   **Database (`database/`)**:
    -   `init_db.py`: A crucial script that defines and creates the entire database schema, including tables for users, students, teachers, face embeddings, and attendance.

### 4.2. Frontend (`smart-school-frontend/smart-school-frontend`)

-   **Pages (`src/pages/`)**: These are the main views of the application.
    -   `Admin/FaceEnrollmentPage.jsx`: The UI for the face enrollment workflow. It contains the logic to capture a photo and send it to the backend.
    -   `Admin/FaceRecognitionPage.jsx`: The UI for real-time face recognition. It displays the camera feed and sends frames to the backend for recognition.
    -   `Admin/AddStudent.jsx` & `Admin/AddTeacher.jsx`: Forms for adding new users to the system.
    -   `Login/LoginPage.jsx`: The page where users log in.

-   **Components (`src/components/`)**: Reusable UI elements.
    -   `CameraCapture.jsx`: A component that displays a camera feed and allows capturing a single frame. Used in the enrollment process.
    -   `RecognitionCamera.jsx`: A component for continuous video streaming, sending frames at intervals for real-time recognition.

-   **Services (`src/services/`)**:
    -   `api.js` (or similar): This file is central to frontend-backend communication. It configures a client (like Axios) to make HTTP requests to the Flask backend API. It exports functions like `recognizeFace` and `enrollFace` that encapsulate the API calls.
