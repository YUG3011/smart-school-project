// UPDATED CLEAN ROUTES – Smart School
// ✔ Role selection login
// ✔ Unified Attendance
// ✔ Removed duplicate attendance pages

import UniversalAttendance from "../Attendance/UniversalAttendance";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

/* LOGIN */
import RoleSelectionLogin from "../pages/Login/RoleSelectionLogin";
import LoginPage from "../pages/Login/LoginPage";

/* ADMIN */
import FaceEnrollmentPage from "../pages/Admin/FaceEnrollmentPage";
import AdminDashboard from "../pages/Admin/AdminDashboard";
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

import AIReportsPage from "../pages/Admin/AIReportsPage";

/* NEW UNIFIED ATTENDANCE */
import UniversalAttendance from "../pages/Attendance/UniversalAttendance";

/* TEACHER */
import TeacherEnrollStudent from "../pages/Teacher/TeacherEnrollStudent";
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import TeacherTimetable from "../pages/Teacher/TeacherTimetable";
import AddStudentTeacher from "../pages/Teacher/AddStudentTeacher";

/* STUDENT */
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentTimetable from "../pages/Student/StudentTimetable";
import StudentAttendancePage from "../pages/Student/StudentAttendancePage";


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

          {/* LOGIN SYSTEM */}
          <Route path="/" element={<RoleSelectionLogin />} />
          <Route path="/login/:role" element={<LoginPage />} />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UniversalAttendance />
                </AppLayout>
              </ProtectedRoute>
        }
          />

          {/* ---------------- ADMIN ROUTES ---------------- */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                <AppLayout><UniversalAttendance /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/face-enrollment"
            element={
              <ProtectedRoute>
                <AppLayout><FaceEnrollmentPage /></AppLayout>
              </ProtectedRoute>
         }
          />

          {/* Students */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><StudentsPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StudentAttendancePage />
                </AppLayout>
              </ProtectedRoute>
             }
          />


          <Route
            path="/add-student"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AddStudent /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-student/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><EditStudent /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Teachers */}
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><TeachersPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-add-student"
            element={
              <ProtectedRoute>
                <AppLayout><TeacherEnrollStudent /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-teacher"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AddTeacher /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-teacher/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><EditTeacher /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Timetable */}
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><TimetablePage /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AddTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-timetable/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><EditTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Attendance Records */}
          <Route
            path="/student-attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><StudentAttendance /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-attendance-view"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><StudentAttendanceView /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Face Enrollment */}
          <Route
            path="/face-enrollment"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><FaceEnrollmentPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Reports */}
          <Route
            path="/ai-reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AIReportsPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- TEACHER ROUTES ---------------- */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><TeacherDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><TeacherTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher → Enroll Students */}
          <Route
            path="/teacher-add-student"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout><AddStudentTeacher /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- STUDENT ROUTES ---------------- */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout><StudentDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout><StudentTimetable /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- PARENT ROUTES ---------------- */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AppLayout><ParentDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent-performance"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AppLayout><ParentPerformance /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- CHATBOT ---------------- */}
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student", "parent"]}>
                <AppLayout><ChatbotPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* DEFAULT → Login */}
          <Route path="*" element={<RoleSelectionLogin />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
