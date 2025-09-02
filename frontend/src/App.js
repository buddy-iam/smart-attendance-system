import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Users, BookOpen, Calendar, BarChart3 } from 'lucide-react';

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Login Component
const Login = ({ onLogin }) => {
   const [credentials, setCredentials] = useState({ userId: '', password: '', role: '' });
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         const response = await axios.post('/auth/login', credentials);
         if (response.data.success) {
            onLogin(response.data.data.user);
            toast.success('Login successful!');
         }
      } catch (error) {
         toast.error('Login failed. Try demo credentials.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
         <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
               <h1 className="text-3xl font-bold text-gray-900">Smart Attendance</h1>
               <p className="text-gray-600 mt-2">Modern College University</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <input
                     type="text"
                     value={credentials.userId}
                     onChange={(e) => setCredentials({ ...credentials, userId: e.target.value })}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Enter User ID"
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                     type="password"
                     value={credentials.password}
                     onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Enter Password"
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                     value={credentials.role}
                     onChange={(e) => setCredentials({ ...credentials, role: e.target.value })}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     required
                  >
                     <option value="">Select Role</option>
                     <option value="admin">Administrator</option>
                     <option value="faculty">Faculty</option>
                     <option value="student">Student</option>
                  </select>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
               >
                  {loading ? 'Signing in...' : 'Sign In'}
               </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
               <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</h3>
               <div className="space-y-2 text-xs text-gray-600">
                  <div><strong>Admin:</strong> ADMIN001 / demo123</div>
                  <div><strong>Faculty:</strong> FAC001 / demo123</div>
                  <div><strong>Student:</strong> STU001 / demo123</div>
               </div>
            </div>
         </div>
      </div>
   );
};

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
   const [stats, setStats] = useState(null);
   const [students, setStudents] = useState([]);
   const [courses, setCourses] = useState([]);

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         const [statsRes, studentsRes, coursesRes] = await Promise.all([
            axios.get('/dashboard/stats'),
            axios.get('/students'),
            axios.get('/courses')
         ]);

         setStats(statsRes.data.data);
         setStudents(studentsRes.data.data);
         setCourses(coursesRes.data.data);
      } catch (error) {
         toast.error('Failed to fetch data');
      }
   };

   if (!stats) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center py-6">
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">
                        {user.role === 'admin' ? 'Admin Dashboard' :
                           user.role === 'faculty' ? 'Faculty Dashboard' : 'Student Dashboard'}
                     </h1>
                     <p className="text-gray-600">Welcome back, {user.name}</p>
                  </div>
                  <button
                     onClick={onLogout}
                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                     Logout
                  </button>
               </div>
            </div>
         </header>

         <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <Users className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                           <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.totalStudents}</dd>
                           </dl>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <BookOpen className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                           <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.totalCourses}</dd>
                           </dl>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <Calendar className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                           <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Today's Classes</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.todayClasses}</dd>
                           </dl>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <BarChart3 className="h-6 w-6 text-orange-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                           <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.overallAttendance}%</dd>
                           </dl>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Students Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
               <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Students</h3>
               </div>
               <ul className="divide-y divide-gray-200">
                  {students.map((student) => (
                     <li key={student.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.program} - {student.year}</p>
                           </div>
                           <div className="text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.attendance >= 90 ? 'bg-green-100 text-green-800' :
                                    student.attendance >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-red-100 text-red-800'
                                 }`}>
                                 {student.attendance}% Attendance
                              </span>
                           </div>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>

            {/* Courses Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
               <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Active Courses</h3>
               </div>
               <ul className="divide-y divide-gray-200">
                  {courses.map((course) => (
                     <li key={course.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-medium text-gray-900">{course.name}</p>
                              <p className="text-sm text-gray-500">{course.faculty} - {course.schedule}</p>
                           </div>
                           <div className="text-sm text-gray-500">
                              {course.enrolled} students enrolled
                           </div>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>
         </main>
      </div>
   );
};

// Main App Component
const App = () => {
   const [user, setUser] = useState(null);

   const handleLogin = (userData) => {
      setUser(userData);
   };

   const handleLogout = () => {
      setUser(null);
   };

   return (
      <Router>
         <div className="App">
            {!user ? (
               <Login onLogin={handleLogin} />
            ) : (
               <Dashboard user={user} onLogout={handleLogout} />
            )}
            <Toaster position="top-right" />
         </div>
      </Router>
   );
};

export default App;