// src/services/api.js

const API_BASE = "http://127.0.0.1:5000";

// ----- Helper: Get JWT token from localStorage -----
function getToken() {
  return localStorage.getItem("token");
}

// ----- Helper: Unified API request -----
async function apiRequest(endpoint, method = "GET", data = null, auth = true) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  // Token expired → logout user
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized – token expired.");
  }

  const json = await res.json().catch(() => ({}));
  return json;
}

export default {
  // -------- AUTH --------
  login(data) {
    return apiRequest("/auth/login", "POST", data, false);
  },

  // -------- STUDENTS CRUD --------
  getStudents() {
    return apiRequest("/students/");
  },

  addStudent(data) {
    return apiRequest("/students/", "POST", data);
  },

  updateStudent(id, data) {
    return apiRequest(`/students/${id}`, "PUT", data);
  },

  deleteStudent(id) {
    return apiRequest(`/students/${id}`, "DELETE");
  },

  // -------- TEACHERS CRUD --------
  getTeachers() {
    return apiRequest("/teachers/");
  },

  addTeacher(data) {
    return apiRequest("/teachers/", "POST", data);
  },

  updateTeacher(id, data) {
    return apiRequest(`/teachers/${id}`, "PUT", data);
  },

  deleteTeacher(id) {
    return apiRequest(`/teachers/${id}`, "DELETE");
  },

  // -------- TIMETABLE --------
  getTimetable() {
    return apiRequest("/timetable/");
  },

  addTimetable(data) {
    return apiRequest("/timetable/", "POST", data);
  },

  updateTimetable(id, data) {
    return apiRequest(`/timetable/${id}`, "PUT", data);
  },

  deleteTimetable(id) {
    return apiRequest(`/timetable/${id}`, "DELETE");
  },

  // -------- ATTENDANCE --------
  markAttendance(data) {
    return apiRequest("/attendance/mark", "POST", data);
  },

  getAttendance() {
    return apiRequest("/attendance/");
  },
};
