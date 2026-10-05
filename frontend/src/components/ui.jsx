import Icon from './Icon';

export function Spinner({ size = 18 }) { return <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />; }
export function Skeleton({ h = 20, w = '100%', style }) { return <div className="skeleton" style={{ height: h, width: w, ...style }} />; }

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <Icon name="shield" size={22} />
      <div><strong>We hit a problem</strong><p>{message}</p></div>
      {onRetry && <button className="btn btn-ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}
export function EmptyState({ icon = 'file', title, text, action }) {
  return (
    <div className="state">
      <div className="state-icon"><Icon name={icon} size={22} /></div>
      <strong>{title}</strong>{text && <p>{text}</p>}{action}
    </div>
  );
}
export function Page({ title, subtitle, actions, children }) {
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
