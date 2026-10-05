import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProgressRing({ value, size = 140 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} stroke="#1f2937" strokeWidth="10" fill="none" />
      <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="10" fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="#e5e7eb" fontSize="28" fontWeight="700"
            transform={`rotate(90 ${size/2} ${size/2})`}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}