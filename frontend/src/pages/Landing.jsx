import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const Hero3D = lazy(() => import('../components/Hero3D'));

export default function Landing() {
  return (
    <div className="landing-page">
      <Suspense fallback={<div style={{ height: '300px' }} />}>
        <Hero3D />
      </Suspense>

      <span className="landing-badge">
        <Icon name="spark" size={14} /> AI-powered career intelligence
      </span>

      <h1>
        Know exactly <span className="grad">how ready you are</span> before the interview
      </h1>

      <p>
        Score your resume against any job description, close your skill gaps with a phased prep
        roadmap, and practice with an AI interviewer.
      </p>

      <div className="landing-ctas">
        <Link to="/register" className="cta-btn">
          Get Started <Icon name="arrow" size={17} />
        </Link>
        <Link to="/login" className="landing-link">
          Sign in
        </Link>
      </div>

      <div className="landing-features">
        <span className="chip"><Icon name="chart" size={13} /> Readiness score</span>
        <span className="chip"><Icon name="target" size={13} /> Skill gap map</span>
        <span className="chip"><Icon name="interview" size={13} /> Mock interviews</span>
      </div>
    </div>
  );
}
