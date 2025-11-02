import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import RecommendedJobs from './pages/RecommendedJobs';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-16">
          <Routes>
            <Route 
              path="/" 
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <PageTransition>
                  <Jobs />
                </PageTransition>
              } 
            />
            <Route 
              path="/jobs/:id" 
              element={
                <PageTransition>
                  <JobDetails />
                </PageTransition>
              } 
            />
            <Route
              path="/recommended"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <RecommendedJobs />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <PageTransition>
                    <PostJob />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <MyApplications />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

