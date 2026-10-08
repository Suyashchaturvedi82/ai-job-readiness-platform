import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const links = [
  { to: '/dashboard', label: 'New Analysis', icon: 'chart' },
  { to: '/resumes', label: 'Resumes', icon: 'file' },
  { to: '/job-descriptions', label: 'Job Descriptions', icon: 'briefcase' },
];

function parseJwtEmail(token) {
  try {
    const raw = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    const padded = raw.padEnd(Math.ceil(raw.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload.sub || '';
  } catch {
    return '';
  }
}

export default function Sidebar() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const email = token ? parseJwtEmail(token) : '';
  const initials = email ? email.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark"><Icon name="spark" size={18} /></div>
        <div>
          <div className="brand-name">JobReady<span>.AI</span></div>
          <div className="brand-caption">Career intelligence</div>
        </div>
      </div>

      <div className="sidebar-section-label">Workspace</div>
      <nav className="sidebar-nav">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-tip">
        <div className="sidebar-tip-icon"><Icon name="target" size={17} /></div>
        <div>
          <strong>One analysis at a time</strong>
          <p>Upload a resume and JD to get your readiness map.</p>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div className="user-copy">
            <strong>{email || 'Signed in'}</strong>
            <span>Candidate</span>
          </div>
        </div>
        <button className="icon-button" onClick={handleLogout} title="Sign out" aria-label="Sign out">
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  );
}
