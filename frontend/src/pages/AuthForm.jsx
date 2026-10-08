import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import Icon from '../components/Icon';
import { Spinner } from '../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASS = 8; // matches backend @Size(min = 8) on RegisterRequest

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [dirty, setDirty] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resetHint, setResetHint] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // ---- real-time inline validation ----
  const emailTouched = dirty.email || submitted;
  const passTouched = dirty.password || submitted;

  let emailError = '';
  if (!email.trim()) emailError = 'Email is required.';
  else if (!EMAIL_RE.test(email.trim())) emailError = 'Enter a valid email address.';

  let passError = '';
  if (!password) passError = 'Password is required.';
  else if (!isLogin && password.length < MIN_PASS) passError = `Password must be at least ${MIN_PASS} characters.`;

  const passOk = password.length >= MIN_PASS;

  async function submit(e) {
    e.preventDefault();
    setSubmitted(true);
    setDirty({ email: true, password: true });
    setError('');
    if (emailError || passError) return;
    setLoading(true);
    try {
      await (isLogin ? login : register)(email.trim(), password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, isLogin ? 'Login failed.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="brand-lockup auth-brand">
        <div className="brand-mark"><Icon name="spark" size={18} /></div>
        <div>
          <div className="brand-name">JobReady<span>.AI</span></div>
          <div className="brand-caption">Career intelligence</div>
        </div>
      </Link>

      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-badge"><Icon name={isLogin ? 'wave' : 'spark'} size={24} /></div>
        <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-sub">
          {isLogin ? 'Sign in to continue your preparation.' : 'Start analysing your resume in under a minute.'}
        </p>

        <label htmlFor="auth-email">Email</label>
        <span className={`input-group with-left with-right${emailTouched && emailError ? ' shake' : ''}`}>
          <span className="input-icon left"><Icon name="mail" size={17} /></span>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            className={emailTouched ? (emailError ? 'invalid' : 'valid') : ''}
            onChange={(e) => { setEmail(e.target.value); setDirty((d) => ({ ...d, email: true })); }}
            required
          />
          {emailTouched && !emailError && (
            <span className="input-action" style={{ pointerEvents: 'none', color: 'var(--success)' }}>
              <Icon name="check" size={16} />
            </span>
          )}
        </span>
        {emailTouched && emailError && <p className="field-error" role="alert">{emailError}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label htmlFor="auth-password">Password</label>
          {isLogin && (
            <button
              type="button"
              className="forgot-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 6 }}
              onClick={() => setResetHint((v) => !v)}
            >
              Forgot password?
            </button>
          )}
        </div>
        <span className="input-group with-left with-right">
          <span className="input-icon left"><Icon name="lock" size={17} /></span>
          <input
            id="auth-password"
            type={show ? 'text' : 'password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder={isLogin ? 'Your password' : `At least ${MIN_PASS} characters`}
            value={password}
            className={passTouched && passError ? 'invalid' : ''}
            onChange={(e) => { setPassword(e.target.value); setDirty((d) => ({ ...d, password: true })); }}
            required
          />
          <button
            type="button"
            className="input-action"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            title={show ? 'Hide password' : 'Show password'}
          >
            <Icon name={show ? 'eyeOff' : 'eye'} size={17} />
          </button>
        </span>
        {!isLogin ? (
          <p className={`field-hint${password ? (passOk ? ' ok' : ' bad') : ''}`}>
            {password && !passOk ? (
              <><Icon name="close" size={13} /> Minimum {MIN_PASS} characters — {MIN_PASS - password.length} to go</>
            ) : passOk ? (
              <><Icon name="check" size={13} /> Minimum {MIN_PASS} characters — looks good</>
            ) : (
              <>Minimum {MIN_PASS} characters</>
            )}
          </p>
        ) : (
          <p className="field-hint">&nbsp;</p>
        )}
        {passTouched && passError && <p className="field-error" role="alert">{passError}</p>}

        {resetHint && isLogin && (
          <p className="field-hint" style={{ marginTop: 10 }}>
            Password resets aren't automated yet — contact support and we'll get you back in.
          </p>
        )}

        {error && <p className="form-error" role="alert"><Icon name="shield" size={16} /> {error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? (
            <><Spinner /> Please wait…</>
          ) : (
            <>{isLogin ? 'Sign in' : 'Create account'} <Icon name="arrow" size={16} className="btn-arrow" /></>
          )}
        </button>

        <p className="auth-switch">
          {isLogin ? (
            <>New here? <Link to="/register">Create an account</Link></>
          ) : (
            <>Already registered? <Link to="/login">Sign in</Link></>
          )}
        </p>

        <div className="secure-note">
          <Icon name="lock" size={14} /> Your account and career data are protected
        </div>
      </form>
    </div>
  );
}
