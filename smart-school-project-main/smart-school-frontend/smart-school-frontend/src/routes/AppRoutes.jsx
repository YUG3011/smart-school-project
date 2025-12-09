// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

/* LOGIN */
import LoginPage from "../pages/Login/LoginPage";

/* UNIVERSAL ATTENDANCE */
import UniversalAttendance from "../pages/Attendance/UniversalAttendance";

/* ADMIN */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import FaceEnrollmentPage from "../pages/Admin/FaceEnrollmentPage";
import StudentsPage from "../pages/Admin/StudentsPage";
import AddStudent from "../pages/Admin/AddStudent";
import EditStudent from "../pages/Admin/EditStudent";
import TeachersPage from "../pages/Admin/TeachersPage";
import AddTeacher from "../pages/Admin/AddTeacher";
import EditTeacher from "../pages/Admin/EditTeacher";
import TimetablePage from "../pages/Admin/TimetablePage";
import AddTimetable from "../pages/Admin/AddTimetable";
import EditTimetable from "../pages/Admin/EditTimetable";
import AdminAttendancePage from "../pages/Admin/AdminAttendancePage";
import AIReportsPage from "../pages/Admin/AIReportsPage";

/* TEACHER */
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import TeacherTimetable from "../pages/Teacher/TeacherTimetable";
import TeacherEnrollStudent from "../pages/Teacher/TeacherEnrollStudent";
import TeacherAttendancePage from "../pages/Teacher/TeacherAttendancePage";

/* STUDENT */
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentTimetable from "../pages/Student/StudentTimetable";
import StudentAttendancePage from "../pages/Student/StudentAttendancePage";

/* PARENT */
import ParentDashboard from "../pages/Parent/ParentDashboard";
import ParentPerformance from "../pages/Parent/ParentPerformance";

/* CHATBOT */
import ChatbotPage from "../pages/Chatbot/ChatbotPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* UNIVERSAL ATTENDANCE */}
          <Route
            path="/face-attendance"
            element={
              <ProtectedRoute>
                <AppLayout><UniversalAttendance /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- ADMIN ROUTES ---------------- */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminAttendancePage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/face-enrollment"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><FaceEnrollmentPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><StudentsPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-student"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AddStudent /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit-student/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><EditStudent /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><TeachersPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-teacher"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AddTeacher /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit-teacher/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><EditTeacher /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><TimetablePage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AddTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit-timetable/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><EditTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/ai-reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AIReportsPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- TEACHER ROUTES ---------------- */}

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><TeacherDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><TeacherTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/add-student"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><TeacherEnrollStudent /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><TeacherAttendancePage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- STUDENT ROUTES ---------------- */}

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout><StudentDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout><StudentTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/my-attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout><StudentAttendancePage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- PARENT ROUTES ---------------- */}

          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AppLayout><ParentDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent/performance"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AppLayout><ParentPerformance /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* CHATBOT (ALL ROLES) */}
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <AppLayout><ChatbotPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
