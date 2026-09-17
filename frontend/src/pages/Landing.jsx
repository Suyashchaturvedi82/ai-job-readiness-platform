import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';

const Hero3D = lazy(() => import('../components/Hero3D'));

export default function Landing() {
  return (
    <div className="landing">
      <Suspense fallback={<div style={{ height: '400px' }} />}>
        <Hero3D />
      </Suspense>
      <h1>AI Job Readiness & Interview Intelligence</h1>
      <p>Know exactly how ready you are — and what to fix before the interview.</p>
      <Link to="/register">Get Started</Link>
    </div>
  );
}