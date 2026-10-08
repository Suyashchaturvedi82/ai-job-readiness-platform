import { useEffect, useState } from 'react';

export default function ProgressRing({ value = 0, size = 190, stroke = 13, label = 'Readiness' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [shown, setShown] = useState(0);

  // animate the arc from empty to its value on mount / value change
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(value)));
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const clamped = Math.max(0, Math.min(100, shown));
  const offset = circumference - (clamped / 100) * circumference;
  const big = Math.max(13, Math.round(size * 0.2));
  const small = Math.max(8, Math.round(size * 0.072));
  const gradId = `ring-grad-${size}-${stroke}`;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={`url(#${gradId})`}
        />
      </svg>
      <div className="ring-copy">
        <strong style={{ fontSize: big }}>{Math.round(value)}%</strong>
        <span style={{ fontSize: small, letterSpacing: size < 120 ? '0.08em' : '0.14em' }}>{label}</span>
      </div>
    </div>
  );
}
