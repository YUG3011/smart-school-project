# Quick Start: Automatic Attendance System

## 🚀 Getting Started

### Step 1: Start the Servers
```bash
# Terminal 1 - Backend
cd d:\data_science_project\smart-school-project-main
python run_backend.py

# Terminal 2 - Frontend
cd d:\data_science_project\smart-school-project-main\smart-school-frontend\smart-school-frontend
npm run dev
```

### Step 2: Login
- **URL**: http://localhost:5173/login
- **Admin**: admin@school.com / admin123
- **Teacher**: Create via admin panel first

---

## 📋 Admin Usage (Both Students & Teachers)

### Access Point
```
Dashboard → Sidebar → "Auto Attendance"
http://localhost:5173/automatic-attendance
```

### Steps
1. **Select User Type**: Choose "Student" or "Teacher"
2. **Start Camera**: Click "📹 Start Camera"
3. **Position Face**: Show your face clearly in the frame
4. **Capture Photo**: Click "📸 Capture Photo"
5. **Mark Attendance**: Click "✅ Mark Attendance"
6. **View Result**: See confidence score and status

### Tips
- Ensure good lighting
- Face should occupy ~1/3 of the frame
- Adjust tolerance if recognition fails
- Lower tolerance = stricter matching
- Higher tolerance = more lenient matching

---

## 👨‍🏫 Teacher Usage (Self-Attendance)

### Access Point
```
Dashboard → Sidebar → "Auto Attendance"
http://localhost:5173/teacher-automatic-attendance
```

### Steps
1. **Start Camera**: Click "📹 Start Camera"
2. **Position Face**: Show your face clearly
3. **Capture Photo**: Click "📸 Capture"
4. **Mark Attendance**: Click "✅ Mark Attendance"
5. **Confirmation**: See success message

### Status
- ✅ Green = Attendance marked successfully
- ⚠️ Yellow = Face recognized but marking failed
- ❌ Red = Face not recognized

---

## 🎓 Student Enrollment (First Time Setup)

### For Students (Admin Task)
1. Go to **"Face Enrollment"** (Admin only)
2. Select student from dropdown
3. Click "Start Camera"
4. Capture clear photo of student
5. Click "Enroll Face"
6. Success! Student is ready for auto-attendance

### For Teachers (Admin Task)
1. Go to **"Face Enrollment"** (Optional)
   OR use Automatic Attendance page with teacher mode
2. Follow same process
3. Teacher face now enrolled

---

## 📊 Viewing Attendance Records

### Admin View
```
Dashboard → "Attendance" or "Student Attendance View"
```
- See all student/teacher attendance
- Filter by date
- View attendance percentage

### Teacher View
```
Dashboard → "Mark Attendance"
```
- Manual attendance marking
- View class attendance

---

## 🔧 Troubleshooting

### Camera Not Working
- Check browser permissions (Privacy → Camera)
- Refresh page
- Try different browser
- Check camera is not in use

### Face Not Recognized
- Ensure proper lighting
- Position face clearly
- Check if face is enrolled
- Adjust tolerance slider (try 0.5)
- Re-enroll if necessary

### Attendance Not Marked
- Check internet connection
- Verify JWT token (logout/login)
- Check backend logs for errors
- Try refreshing page

### Confidence Score Low
- Improve lighting
- Position face better
- Remove glasses if possible
- Try different angle

---

## 📈 Features Overview

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Mark Own Attendance | ✅ | ✅ | ❌ |
| Mark Student Attendance | ✅ | ✅ | ❌ |
| Mark Teacher Attendance | ✅ | ❌ | ❌ |
| View Attendance | ✅ | ✅ | ❌ |
| Adjust Tolerance | ✅ | ❌ | ❌ |
| View Session History | ✅ | ❌ | ❌ |

---

## 🔐 Security Notes

- JWT tokens required for all endpoints
- Face recognition matching only with enrolled faces
- One-time daily marking per person
- Confidence threshold ensures accuracy
- All attempts logged in database

---

## 💡 Tips for Best Results

1. **Good Lighting**: Bright, natural lighting works best
2. **Clear Face**: No sunglasses, minimal makeup changes
3. **Frontal Position**: Face camera directly
4. **Distance**: Keep face 1-2 feet from camera
5. **Steady Hold**: Keep camera steady while capturing
6. **One Per Day**: Each person marked once daily
7. **Retake if Needed**: Use "Retake" button freely

---

## 📞 Support

For issues:
1. Check backend logs: Terminal running `python run_backend.py`
2. Check frontend logs: Browser console (F12)
3. Verify database tables exist
4. Check JWT token validity
5. Review AUTOMATIC_ATTENDANCE_GUIDE.md for full documentation

---

**Version**: 1.0
**Status**: ✅ Production Ready
**Last Updated**: December 6, 2025
