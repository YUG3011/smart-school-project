# 🚀 STEP-BY-STEP GUIDE TO RUN THE SYSTEM

## 📍 EXACT LOCATIONS & COMMANDS

---

## **STEP 1: START THE BACKEND**

### Location:
```
D:\data_science_project\smart-school-project-main
```

### Commands:
```powershell
# Navigate to project root
cd d:\data_science_project\smart-school-project-main

# Run backend
python run_backend.py
```

### Expected Output:
```
 * Running on http://127.0.0.1:5000
WARNING in app.runserver
```

**✅ Backend is running when you see:** `Running on http://127.0.0.1:5000`

---

## **STEP 2: START THE FRONTEND (In a NEW Terminal)**

### Location:
```
D:\data_science_project\smart-school-project-main\smart-school-frontend\smart-school-frontend
```

### Commands:
```powershell
# Navigate to frontend folder
cd d:\data_science_project\smart-school-project-main\smart-school-frontend\smart-school-frontend

# Start frontend
npm run dev
```

### Expected Output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

**✅ Frontend is running when you see:** `Local: http://localhost:5173/`

---

## **STEP 3: CREATE TEST STUDENTS (In a NEW Terminal)**

### Location:
```
D:\data_science_project\smart-school-project-main
```

### Commands:
```powershell
# Navigate to project root
cd d:\data_science_project\smart-school-project-main

# Run test data setup
python setup_test_data.py
```

### Expected Output:
```
✓ Test students created successfully!
✓ 8 famous personalities added to database

Students created:
1. Elon Musk (Class A)
2. Taylor Swift (Class B)
3. Virat Kohli (Class A)
... and 5 more
```

**✅ Test students added when you see:** `8 famous personalities added to database`

---

## **STEP 4: ENROLL CELEBRITY FACES (In the SAME Terminal)**

### Location:
```
D:\data_science_project\smart-school-project-main
```

### Commands:
```powershell
# Make sure you're in project root
cd d:\data_science_project\smart-school-project-main

# Run face enrollment
python enroll_celebrity_faces.py
```

### Expected Output:
```
Checking backend connection... ✓
Authenticating as admin... ✓
Downloading and enrolling celebrity faces...

✓ Elon Musk - Face enrolled successfully
✓ Taylor Swift - Face enrolled successfully
✓ Virat Kohli - Face enrolled successfully
... and 5 more

✓ Successfully enrolled 8 out of 8 celebrities!
```

**✅ Faces enrolled when you see:** `Successfully enrolled 8 out of 8 celebrities!`

---

## **STEP 5: LOGIN TO SYSTEM**

### Website:
```
http://localhost:5173/login
```

### Login Credentials:
```
Email:    admin@school.com
Password: admin123
```

### Click: Login

---

## **STEP 6: TEST AUTOMATIC ATTENDANCE (ADMIN)**

### Location in Browser:
```
http://localhost:5173/automatic-attendance
```

### What to Do:
1. Click **"Start Camera"**
2. Allow camera access
3. Hold up a **celebrity photo** (from phone, printed, or screen)
4. Point camera at photo
5. Click **"Capture Photo"**
6. Click **"Mark Attendance"**
7. ✅ System recognizes celebrity and marks attendance!

### Expected Result:
```
✓ Face recognized as: Elon Musk
✓ Attendance marked successfully
✓ Time: 14:32:15
```

---

## **COMPLETE WORKFLOW SUMMARY**

| Step | Action | Location | Command |
|------|--------|----------|---------|
| 1 | Start Backend | `D:\data_science_project\smart-school-project-main` | `python run_backend.py` |
| 2 | Start Frontend | `D:\...\smart-school-frontend\smart-school-frontend` | `npm run dev` |
| 3 | Create Test Students | `D:\data_science_project\smart-school-project-main` | `python setup_test_data.py` |
| 4 | Enroll Celebrity Faces | `D:\data_science_project\smart-school-project-main` | `python enroll_celebrity_faces.py` |
| 5 | Login | Browser: `http://localhost:5173/login` | admin@school.com / admin123 |
| 6 | Test Auto Attendance | Browser: `http://localhost:5173/automatic-attendance` | Show celebrity photo |

---

## 📋 TERMINAL SETUP (Recommended)

Open **4 separate terminals/tabs** to run everything simultaneously:

```
┌─────────────────────────────────────────────────────────────┐
│ Terminal 1: BACKEND                                         │
│ Location: D:\data_science_project\smart-school-project-main │
│ Command: python run_backend.py                              │
│ Status: Running on http://127.0.0.1:5000                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Terminal 2: FRONTEND                                        │
│ Location: D:\...\smart-school-frontend\smart-school-frontend│
│ Command: npm run dev                                        │
│ Status: Ready on http://localhost:5173                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Terminal 3: SETUP TEST DATA                                 │
│ Location: D:\data_science_project\smart-school-project-main │
│ Command: python setup_test_data.py                          │
│ Status: Done (one-time only)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Terminal 4: ENROLL FACES                                    │
│ Location: D:\data_science_project\smart-school-project-main │
│ Command: python enroll_celebrity_faces.py                   │
│ Status: Done (one-time only)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 QUICK COPY-PASTE COMMANDS

### **Terminal 1 (Backend):**
```powershell
cd d:\data_science_project\smart-school-project-main; python run_backend.py
```

### **Terminal 2 (Frontend):**
```powershell
cd d:\data_science_project\smart-school-project-main\smart-school-frontend\smart-school-frontend; npm run dev
```

### **Terminal 3 (Test Data):**
```powershell
cd d:\data_science_project\smart-school-project-main; python setup_test_data.py
```

### **Terminal 4 (Enroll Faces):**
```powershell
cd d:\data_science_project\smart-school-project-main; python enroll_celebrity_faces.py
```

---

## 🐛 TROUBLESHOOTING

### **Backend won't start?**
```powershell
# Kill any existing Python processes
taskkill /F /IM python.exe

# Try again
cd d:\data_science_project\smart-school-project-main
python run_backend.py
```

### **Frontend won't compile?**
```powershell
cd d:\data_science_project\smart-school-project-main\smart-school-frontend\smart-school-frontend
npm install
npm run dev
```

### **Can't find celebrity faces?**
- Make sure `enroll_celebrity_faces.py` ran successfully
- Check: `python setup_test_data.py` ran first
- Wait 5 seconds after enrollment script completes

### **Camera not working?**
- Allow camera permission in browser
- Refresh page (F5)
- Try a different browser (Chrome works best)

### **Port already in use?**
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## ✅ VERIFICATION CHECKLIST

After running all steps, verify:

- [ ] Backend running at `http://127.0.0.1:5000`
- [ ] Frontend running at `http://localhost:5173`
- [ ] Can access login page
- [ ] Can login with admin@school.com / admin123
- [ ] Can see "Automatic Attendance" in sidebar
- [ ] Can start camera
- [ ] Can capture photos
- [ ] Can mark attendance with celebrity photo
- [ ] System recognizes face and shows name
- [ ] Attendance is recorded in database

---

## 📊 FILE LOCATIONS REFERENCE

| File | Location |
|------|----------|
| `run_backend.py` | `D:\data_science_project\smart-school-project-main\` |
| `setup_test_data.py` | `D:\data_science_project\smart-school-project-main\` |
| `enroll_celebrity_faces.py` | `D:\data_science_project\smart-school-project-main\` |
| `package.json` (Frontend) | `D:\...\smart-school-frontend\smart-school-frontend\` |
| `school.db` | `D:\data_science_project\smart-school-project-main\` |

---

## 🎉 YOU'RE ALL SET!

Once all steps are complete, the system is fully functional and ready for testing! 🚀

**Questions?** Refer to:
- `AUTOMATIC_ATTENDANCE_QUICK_START.md`
- `SYSTEM_ACCESS_GUIDE.md`
- `AUTOMATIC_ATTENDANCE_GUIDE.md`
