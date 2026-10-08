import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
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

const APP_PREFIXES = ['/dashboard', '/resumes', '/job-descriptions', '/analysis', '/interview'];

/** Shared motion wrapper giving every route a smooth enter/exit transition. */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="route-view"
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.99 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
          <Route path="/job-descriptions" element={<ProtectedRoute><JobDescriptions /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisResult /></ProtectedRoute>} />
          <Route path="/interview/start/:analysisId" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

/** Keeps the sidebar mounted across in-app navigations; auth pages stay full-bleed. */
function AppRoutes() {
  const { pathname } = useLocation();
  const inApp = APP_PREFIXES.some((p) => pathname.startsWith(p));
  return inApp ? (
    <Layout>
      <AnimatedRoutes />
    </Layout>
  ) : (
    <AnimatedRoutes />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
