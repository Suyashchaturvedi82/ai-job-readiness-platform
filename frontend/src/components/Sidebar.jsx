import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="brand">JobReady AI</div>
      <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>📊 New Analysis</NavLink>
      <NavLink to="/resumes" className={({isActive}) => isActive ? 'active' : ''}>📄 Resumes</NavLink>
      <NavLink to="/job-descriptions" className={({isActive}) => isActive ? 'active' : ''}>💼 Job Descriptions</NavLink>
      <div style={{ marginTop: 'auto' }}>
        <button onClick={handleLogout} style={{ width: '100%' }}>Logout</button>
      </div>
    </aside>
  );
}