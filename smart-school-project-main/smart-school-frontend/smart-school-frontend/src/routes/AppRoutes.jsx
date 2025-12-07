// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

/* LOGIN */
import LoginPage from "../pages/Login/LoginPage";

/* ADMIN */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AttendancePage from "../pages/Admin/AttendancePage";
import StudentsPage from "../pages/Admin/StudentsPage";
import AddStudent from "../pages/Admin/AddStudent";
import EditStudent from "../pages/Admin/EditStudent";

import TeachersPage from "../pages/Admin/TeachersPage";
import AddTeacher from "../pages/Admin/AddTeacher";
import EditTeacher from "../pages/Admin/EditTeacher";

import TimetablePage from "../pages/Admin/TimetablePage";
import AddTimetable from "../pages/Admin/AddTimetable";
import EditTimetable from "../pages/Admin/EditTimetable";

import StudentAttendance from "../pages/Admin/StudentAttendance";
import StudentAttendanceView from "../pages/Admin/StudentAttendanceView";
import FaceEnrollmentPage from "../pages/Admin/FaceEnrollmentPage";
import FaceRecognitionPage from "../pages/Admin/FaceRecognitionPage";
import AutomaticAttendancePage from "../pages/Admin/AutomaticAttendancePage";
import RealtimeFaceAttendancePage from "../pages/RealtimeFaceAttendancePage";

import AIReportsPage from "../pages/Admin/AIReportsPage";

/* TEACHER */
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import TeacherAttendance from "../pages/Teacher/TeacherAttendance";
import TeacherTimetable from "../pages/Teacher/TeacherTimetable";
import TeacherAutoAttendancePage from "../pages/Teacher/TeacherAutoAttendancePage";

/* STUDENT */
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentTimetable from "../pages/Student/StudentTimetable";
import StudentAutomaticAttendancePage from "../pages/Student/StudentAutomaticAttendancePage";
import QuizPage from "../pages/Student/QuizPage";

/* PARENT */
import ParentDashboard from "../pages/Parent/ParentDashboard";
import ParentPerformance from "../pages/Parent/ParentPerformance";

/* CHATBOT */
import ChatbotPage from "../pages/Chatbot/ChatbotPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<LoginPage />} />

          {/* ---------------- ADMIN ROUTES ---------------- */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Attendance */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Students */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <StudentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-student"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AddStudent />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-student/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <EditStudent />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Teachers */}
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <TeachersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-teacher"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AddTeacher />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-teacher/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <EditTeacher />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Timetable */}
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <TimetablePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AddTimetable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-timetable/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <EditTimetable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Attendance */}
          <Route
            path="/student-attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <StudentAttendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-attendance-view"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <StudentAttendanceView />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Face Recognition */}
          <Route
            path="/face-enrollment"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <FaceEnrollmentPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/face-recognition"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <FaceRecognitionPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Automatic Attendance */}
          <Route
            path="/automatic-attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AutomaticAttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Real-Time Face Attendance */}
          <Route
            path="/realtime-attendance"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                <AppLayout>
                  <RealtimeFaceAttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Reports */}
          <Route
            path="/ai-reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AIReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- TEACHER ROUTES ---------------- */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout>
                  <TeacherDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout>
                  <TeacherAttendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout>
                  <TeacherTimetable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Automatic Attendance */}
          <Route
            path="/teacher-automatic-attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout>
                  <TeacherAutoAttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- STUDENT ROUTES ---------------- */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout>
                  <StudentTimetable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-automatic-attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout>
                  <StudentAutomaticAttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-quiz"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout>
                  <QuizPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- PARENT ROUTES ---------------- */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AppLayout>
                  <ParentDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent-performance"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AppLayout>
                  <ParentPerformance />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- CHATBOT ---------------- */}
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student", "parent"]}>
                <AppLayout>
                  <ChatbotPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* DEFAULT → Login */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
