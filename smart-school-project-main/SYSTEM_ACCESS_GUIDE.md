# 🌐 System Access Guide

## 📍 URLs and Access Points

### Main Application
| Page | URL | Role | Status |
|------|-----|------|--------|
| Login | `http://localhost:5173/login` | All | ✅ Ready |
| **Admin Dashboard** | `http://localhost:5173/admin-dashboard` | Admin | ✅ Ready |
| **🎯 Auto Attendance** | `http://localhost:5173/automatic-attendance` | Admin/Teacher | ✅ **NEW** |
| Students | `http://localhost:5173/students` | Admin | ✅ Ready |
| Teachers | `http://localhost:5173/teachers` | Admin | ✅ Ready |
| **👨‍🏫 Teacher Dashboard** | `http://localhost:5173/teacher-dashboard` | Teacher | ✅ Ready |
| **👨‍🏫 Teacher Auto Attendance** | `http://localhost:5173/teacher-automatic-attendance` | Teacher | ✅ **NEW** |
| Face Enrollment | `http://localhost:5173/face-enrollment` | Admin | ✅ Ready |
| Face Recognition | `http://localhost:5173/face-recognition` | Admin | ✅ Ready |

### Backend API Endpoints
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/face-recognition/mark-attendance-auto` | POST | **Auto mark attendance** | JWT |
| `/api/face-recognition/enroll-teacher` | POST | **Enroll teacher face** | JWT |
| `/api/face-recognition/enroll` | POST | Enroll student face | JWT |
| `/api/face-recognition/recognize` | POST | Recognize face | JWT |
| `/api/face-recognition/stats` | GET | Get stats | JWT |
| `/api/student-attendance/mark` | POST | Mark student attendance | JWT |
| `/api/teacher-attendance/mark` | POST | Mark teacher attendance | JWT |

---

## 🔐 Login Credentials

### Default Admin Account
```
Email:    admin@school.com
Password: admin123
```

### How to Create Teacher Account
1. Login as admin
2. Go to `/teachers`
3. Click "Add Teacher"
4. Fill in teacher details
5. Create login credentials
6. Teacher can now login

### How to Create Student Account
1. Login as admin
2. Go to `/students`
3. Click "Add Student"
4. Fill in student details
5. Student login created
6. Can be used for viewing timetable

---

## 🎯 Automatic Attendance System

### For Admin Users

**Step 1: Start Systems**
```bash
# Terminal 1 - Backend
cd d:\data_science_project\smart-school-project-main
python run_backend.py
# Should show: Running on http://127.0.0.1:5000

# Terminal 2 - Frontend
cd d:\data_science_project\smart-school-project-main\smart-school-frontend\smart-school-frontend
npm run dev
# Should show: VITE... ready in XXX ms
```

**Step 2: Login**
- Open: `http://localhost:5173/login`
- Enter: `admin@school.com` / `admin123`
- Click: Login

**Step 3: Access Auto Attendance**
- Option A: Click "Auto Attendance" in sidebar
- Option B: Direct URL: `http://localhost:5173/automatic-attendance`

**Step 4: Mark Attendance**
- Select mode: **"Student"** (blue button)
- Click: "📹 Start Camera"
- Look at camera (show enrolled student's face)
- Click: "📸 Capture Photo"
- Click: "✅ Mark Attendance"
- See: Success message + confidence score

**Step 5: Verify in Database**
- Go to: `http://localhost:5173/student-attendance-view`
- Or SQL query:
  ```sql
  SELECT * FROM student_attendance WHERE date = '2025-12-06';
  ```

---

### For Teacher Users

**Step 1: Teacher Login**
- Create teacher account via admin panel (if not exists)
- Open: `http://localhost:5173/login`
- Enter: Teacher credentials
- Click: Login

**Step 2: Access Auto Attendance**
- Sidebar: Click "Auto Attendance"
- Or direct: `http://localhost:5173/teacher-automatic-attendance`

**Step 3: Mark Own Attendance**
- Click: "📹 Start Camera"
- Show your face clearly
- Click: "📸 Capture"
- Click: "✅ Mark Attendance"
- See: "✅ Attendance marked for today!"

**Step 4: Done**
- Your attendance is marked
- Go to dashboard to see status

---

## 🏗️ System Architecture

```
┌─────────────────────────────┐
│   Frontend (React)          │
│  localhost:5173             │
├─────────────────────────────┤
│ • AutomaticAttendancePage   │
│ • TeacherAutoAttendancePage │
│ • Other pages               │
└──────────────┬──────────────┘
               │ Axios + JWT
               ↓
┌─────────────────────────────┐
│   Backend (Flask)           │
│  127.0.0.1:5000             │
├─────────────────────────────┤
│ • Face Recognition routes   │
│ • Attendance routes         │
│ • Auth routes               │
└──────────────┬──────────────┘
               │ SQLite3
               ↓
┌─────────────────────────────┐
│   Database                  │
│  school.db                  │
├─────────────────────────────┤
│ • face_embeddings           │
│ • student_attendance        │
│ • teacher_attendance        │
│ • students, teachers, etc.  │
└─────────────────────────────┘
```

---

## 🔍 Viewing Attendance Records

### As Admin
1. Login as admin
2. Sidebar: "Student Attendance View"
3. See all attendance records
4. Filter by date/class/student

### As Teacher
1. Login as teacher
2. Sidebar: "Mark Attendance"
3. See class attendance
4. View your own status

### Direct Database Query
```sql
-- All attendance today
SELECT * FROM student_attendance WHERE date = '2025-12-06';

-- Specific student
SELECT * FROM student_attendance WHERE student_id = 5;

-- Teacher attendance
SELECT * FROM teacher_attendance WHERE date = '2025-12-06';

-- Enrollment records
SELECT * FROM face_embeddings WHERE is_active = 1;
```

---

## 🧪 Testing Guide

### Test Scenario 1: Student Enrollment & Auto-Attendance

**Phase 1: Enrollment**
1. Login as admin
2. Go to "Face Enrollment"
3. Select student: John Doe
4. Start camera
5. Show clear face
6. Click "Enroll Face"
7. Success: ✅ Face enrolled

**Phase 2: Auto-Mark**
1. Go to "Auto Attendance"
2. Select "Student" mode
3. Start camera
4. Show same face (John Doe's)
5. Click "Mark Attendance"
6. Expected: ✅ Attendance marked for John Doe

**Phase 3: Verify**
1. Check database:
   ```sql
   SELECT * FROM student_attendance 
   WHERE student_id = <john_id> AND date = '2025-12-06';
   ```
2. Expected: Record exists with status='present'

---

### Test Scenario 2: Teacher Self-Attendance

**Phase 1: Enroll Teacher (Optional)**
1. Login as admin
2. Go to "Auto Attendance"
3. Select "Teacher" mode
4. Enroll teacher's face

OR

1. Use API endpoint directly:
   ```bash
   POST /api/face-recognition/enroll-teacher
   {
     "teacher_id": 1,
     "image": "base64_image",
     "teacher_name": "Jane Smith"
   }
   ```

**Phase 2: Mark Attendance**
1. Logout, login as teacher
2. Go to "Auto Attendance"
3. Start camera
4. Show your face
5. Click "Mark Attendance"
6. Expected: ✅ Your attendance marked

**Phase 3: Verify**
1. Check database:
   ```sql
   SELECT * FROM teacher_attendance WHERE date = '2025-12-06';
   ```
2. Expected: Your record with status='present'

---

## ⚙️ Configuration

### Backend Configuration (`app.py`)
```python
app.config["SECRET_KEY"] = "SMART_SCHOOL_SECRET_KEY_123"
app.config["JWT_SECRET_KEY"] = "SMART_SCHOOL_JWT_SECRET_123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
```

### Frontend Configuration (`api.js`)
```javascript
const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Monitoring

### Backend Logs
Check terminal running `python run_backend.py` for:
- Request logs
- Error messages
- Database operations
- API calls

**Example logs**:
```
127.0.0.1 - - [06/Dec/2025 15:30:45] "POST /api/face-recognition/mark-attendance-auto HTTP/1.1" 200
127.0.0.1 - - [06/Dec/2025 15:30:46] "GET /api/student-attendance/today HTTP/1.1" 200
```

### Frontend Logs
Browser Console (F12) shows:
- API requests
- Response data
- Errors
- Camera events

### Database Monitoring
```bash
# Connect to database
sqlite3 school.db

# Check tables
.tables

# Check recent attendance
SELECT * FROM student_attendance ORDER BY marked_at DESC LIMIT 10;

# Check face enrollments
SELECT id, student_id, student_name, confidence_score, created_at FROM face_embeddings;
```

---

## 🆘 Troubleshooting

### Issue: "Camera not working"
```
Solution:
1. Check browser permissions (Settings → Privacy → Camera)
2. Allow camera for localhost:5173
3. Refresh page
4. Try different browser
```

### Issue: "Face not recognized"
```
Solution:
1. Ensure face is properly enrolled
2. Better lighting
3. Position face clearly in frame
4. Adjust tolerance slider (try 0.5)
5. Re-enroll if necessary
```

### Issue: "Backend 500 error"
```
Solution:
1. Check backend terminal for errors
2. Verify database tables exist
3. Check JWT configuration
4. Restart backend: Ctrl+C, then python run_backend.py
```

### Issue: "Frontend won't load"
```
Solution:
1. Check npm run dev output
2. Clear browser cache (Ctrl+Shift+Del)
3. Kill npm process and restart
4. Check for npm errors
```

### Issue: "JWT token expired"
```
Solution:
1. Logout (clear localStorage)
2. Login again (get new token)
3. Tokens expire after 24 hours
```

---

## 📞 Quick Reference

| What | Where | How |
|------|-------|-----|
| **Admin Portal** | `http://localhost:5173/admin-dashboard` | Click logo/sidebar |
| **Auto Attendance** | `http://localhost:5173/automatic-attendance` | Sidebar → "Auto Attendance" |
| **Teacher Dashboard** | `http://localhost:5173/teacher-dashboard` | Sidebar → "Dashboard" |
| **Teacher Auto Attendance** | `http://localhost:5173/teacher-automatic-attendance` | Sidebar → "Auto Attendance" |
| **View Attendance** | `http://localhost:5173/student-attendance-view` | Sidebar → "Attendance View" |
| **Logout** | Any page | Click logout/profile menu |

---

**System Version**: 1.0  
**Last Updated**: December 6, 2025  
**Status**: 🟢 Ready for Use  
