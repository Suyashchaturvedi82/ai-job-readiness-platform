import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext'; // 1. ToastProvider import karein
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import JobDescriptions from './pages/JobDescriptions';
import AnalysisResult from './pages/AnalysisResult';
import Interview from './pages/Interview';

export default function App() {
  return (
    <ToastProvider>      {/* 2. Sabse bahar ToastProvider wrap karein */}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/resumes" element={<ProtectedRoute><Layout><Resumes /></Layout></ProtectedRoute>} />
            <Route path="/job-descriptions" element={<ProtectedRoute><Layout><JobDescriptions /></Layout></ProtectedRoute>} />
            <Route path="/analysis/:id" element={<ProtectedRoute><Layout><AnalysisResult /></Layout></ProtectedRoute>} />
            <Route path="/interview/start/:analysisId" element={<ProtectedRoute><Layout><Interview /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}