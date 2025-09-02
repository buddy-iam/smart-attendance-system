const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
   origin: process.env.CLIENT_URL || 'http://localhost:3000',
   credentials: true
}));

// Rate limiting
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.error('MongoDB error:', err));

// Simple User model
const userSchema = new mongoose.Schema({
   userId: { type: String, required: true, unique: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
   firstName: String,
   lastName: String,
   isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Student model
const studentSchema = new mongoose.Schema({
   studentId: { type: String, required: true, unique: true },
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   program: String,
   year: String,
   attendance: { type: Number, default: 0 }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// Course model
const courseSchema = new mongoose.Schema({
   courseId: { type: String, required: true, unique: true },
   courseName: String,
   department: String,
   facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   schedule: String,
   room: String
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

// Attendance Session model
const sessionSchema = new mongoose.Schema({
   sessionId: { type: String, required: true, unique: true },
   courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
   date: Date,
   qrCode: String,
   qrExpiry: Date,
   isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AttendanceSession = mongoose.model('AttendanceSession', sessionSchema);

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
   try {
      const { userId, password, role } = req.body;

      // Demo authentication - in production, use proper password hashing
      const demoUsers = {
         'ADMIN001': { role: 'admin', name: 'System Administrator' },
         'FAC001': { role: 'faculty', name: 'Dr. Michael Chen' },
         'STU001': { role: 'student', name: 'Alice Johnson' }
      };

      if (demoUsers[userId] && password === 'demo123') {
         const token = 'demo-jwt-token'; // In production, use proper JWT
         res.json({
            success: true,
            data: {
               token,
               user: {
                  userId,
                  role: demoUsers[userId].role,
                  name: demoUsers[userId].name
               }
            }
         });
      } else {
         res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
   res.json({
      success: true,
      data: {
         totalStudents: 1250,
         totalCourses: 156,
         todayClasses: 23,
         overallAttendance: 94.2,
         activeStudents: 1180,
         totalFaculty: 85
      }
   });
});

// Students data
app.get('/api/students', (req, res) => {
   const students = [
      {
         id: 'ST001',
         name: 'Alice Johnson',
         email: 'alice@college.edu',
         program: 'Computer Science',
         year: '2nd Year',
         attendance: 95.5
      },
      {
         id: 'ST002',
         name: 'Bob Smith',
         email: 'bob@college.edu',
         program: 'Engineering',
         year: '3rd Year',
         attendance: 88.2
      },
      {
         id: 'ST003',
         name: 'Carol Davis',
         email: 'carol@college.edu',
         program: 'Business',
         year: '1st Year',
         attendance: 92.1
      }
   ];

   res.json({ success: true, data: students });
});

// Courses data
app.get('/api/courses', (req, res) => {
   const courses = [
      {
         id: 'CS101',
         name: 'Introduction to Programming',
         department: 'Computer Science',
         faculty: 'Dr. Michael Chen',
         schedule: 'Mon-Wed-Fri 9:00 AM',
         room: 'Lab A1',
         enrolled: 45
      },
      {
         id: 'ENG101',
         name: 'Engineering Mathematics',
         department: 'Engineering',
         faculty: 'Prof. Sarah Williams',
         schedule: 'Tue-Thu 11:00 AM',
         room: 'Room 301',
         enrolled: 52
      }
   ];

   res.json({ success: true, data: courses });
});

// Attendance records
app.get('/api/attendance/records', (req, res) => {
   const records = [
      {
         date: '2024-09-02',
         course: 'CS101',
         totalStudents: 45,
         present: 43,
         absent: 2,
         attendanceRate: 95.6
      },
      {
         date: '2024-09-01',
         course: 'CS101',
         totalStudents: 45,
         present: 41,
         absent: 4,
         attendanceRate: 91.1
      }
   ];

   res.json({ success: true, data: records });
});

// QR Code generation
const QRCode = require('qrcode');
app.post('/api/attendance/generate-qr', async (req, res) => {
   try {
      const { courseId } = req.body;
      const sessionId = `SESSION_${Date.now()}`;
      const qrData = JSON.stringify({
         sessionId,
         courseId,
         timestamp: Date.now(),
         expiry: Date.now() + (5 * 60 * 1000) // 5 minutes
      });

      const qrCode = await QRCode.toDataURL(qrData);

      res.json({
         success: true,
         data: {
            sessionId,
            qrCode,
            expiry: new Date(Date.now() + (5 * 60 * 1000))
         }
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

// Health check
app.get('/api/health', (req, res) => {
   res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
   });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
   app.use(express.static('public'));
   app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
