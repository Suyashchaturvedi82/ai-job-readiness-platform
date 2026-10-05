import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
];

export default function AppShell({ children, eyebrow = 'Workspace' }) {
  const [open, setOpen] = useState(false);
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const email = token ? parseJwtEmail(token) : '';
  const initials = email ? email.charAt(0).toUpperCase() : 'U';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
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
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
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
          <button className="icon-button ghost" onClick={handleLogout} title="Sign out" aria-label="Sign out">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <button className="mobile-menu icon-button ghost" onClick={() => setOpen((v) => !v)} aria-label="Open navigation">
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
          <div className="topbar-eyebrow">{eyebrow}</div>
          <div className="topbar-actions">
            <div className="status-pill"><span className="status-dot" /> AI workspace online</div>
            <button className="mini-avatar" onClick={handleLogout} title="Sign out">{initials}</button>
          </div>
        </header>
        <main className="shell-content">{children}</main>
      </div>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    </div>
  );
}

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
