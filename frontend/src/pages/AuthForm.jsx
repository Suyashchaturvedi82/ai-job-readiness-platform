import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import Icon from '../components/Icon';
import { Spinner } from '../components/ui';

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!isLogin && password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await (isLogin ? login : register)(email.trim(), password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, isLogin ? 'Login failed.' : 'Registration failed.'));
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="brand-lockup auth-brand"><div className="brand-mark"><Icon name="spark" size={18} /></div><div className="brand-name">JobReady<span>.AI</span></div></Link>
      <form className="card auth-card" onSubmit={submit} noValidate={false}>
        <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">{isLogin ? 'Sign in to continue your preparation.' : 'Start analysing your resume in under a minute.'}</p>
        <label>Email<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password
          <span className="input-wrap">
            <input type={show ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder={isLogin ? 'Your password' : 'At least 8 characters'} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="icon-button ghost" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name={show ? 'eyeOff' : 'eye'} size={16} /></button>
          </span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <><Spinner /> Please wait…</> : isLogin ? 'Sign in' : 'Create account'}</button>
        <p className="muted center">{isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Sign in</Link></>}</p>
      </form>
    </div>
  );
}
