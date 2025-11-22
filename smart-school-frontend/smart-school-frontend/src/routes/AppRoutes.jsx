import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

/* ========== LOGIN PAGE ========== */
import LoginPage from "../pages/Login/LoginPage";

/* ========== ADMIN PAGES ========== */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AttendancePage from "../pages/Admin/AttendancePage";
import StudentsPage from "../pages/Admin/StudentsPage";
import TeachersPage from "../pages/Admin/TeachersPage";
import TimetablePage from "../pages/Admin/TimetablePage";
import AIReportsPage from "../pages/Admin/AIReportsPage";
import AddStudent from "../pages/Admin/AddStudent";
import AddTeacher from "../pages/Admin/AddTeacher";

/* ========== TEACHER PAGES ========== */
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
/* (Add more teacher pages later if needed) */

/* ========== STUDENT PAGES ========== */
import StudentDashboard from "../pages/Student/StudentDashboard";
import QuizPage from "../pages/Student/QuizPage";
import StudentTimetable from "../pages/Student/StudentTimetable";

/* ========== PARENT PAGES ========== */
import ParentDashboard from "../pages/Parent/ParentDashboard";
import ParentPerformance from "../pages/Parent/ParentPerformance";

/* ========== CHATBOT ========== */
import ChatbotPage from "../pages/Student/ChatbotPage";

function AppRoutes() {
  return (
    <Routes>

      {/* ========== LOGIN ROUTE ========== */}
      <Route path="/login" element={<LoginPage />} />

      {/* ========== ADMIN ROUTES ========== */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <AttendancePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <StudentsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-student"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <AddStudent />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teachers"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <TeachersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-teacher"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <AddTeacher />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetable"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <TimetablePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-reports"
        element={
          <ProtectedRoute roleRequired="Admin">
            <AppLayout>
              <AIReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== TEACHER ROUTES ========== */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute roleRequired="Teacher">
            <AppLayout>
              <TeacherDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== STUDENT ROUTES ========== */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute roleRequired="Student">
            <AppLayout>
              <StudentDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-quiz"
        element={
          <ProtectedRoute roleRequired="Student">
            <AppLayout>
              <QuizPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-timetable"
        element={
          <ProtectedRoute roleRequired="Student">
            <AppLayout>
              <StudentTimetable />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== PARENT ROUTES ========== */}
      <Route
        path="/parent-dashboard"
        element={
          <ProtectedRoute roleRequired="Parent">
            <AppLayout>
              <ParentDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/parent-performance"
        element={
          <ProtectedRoute roleRequired="Parent">
            <AppLayout>
              <ParentPerformance />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== CHATBOT ROUTE ========== */}
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatbotPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== DEFAULT ROUTE ========== */}
      <Route path="*" element={<LoginPage />} />

    </Routes>
  );
}

export default AppRoutes;
