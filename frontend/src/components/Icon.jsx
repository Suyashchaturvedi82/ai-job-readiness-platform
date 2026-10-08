const paths = {
  spark: <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Zm7 12 .9 3.1L23 18l-3.1.9L19 22l-.9-3.1L15 18l3.1-.9L19 14ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-3 3 2 4-6"/></>,
  file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h5"/></>,
  target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></>,
  interview: <><path d="M5 5h14v10H9l-4 4V5Z"/><path d="M9 9h6M9 12h4"/></>,
  logout: <><path d="M10 5H5v14h5"/><path d="m14 8 4 4-4 4M9 12h9"/></>,
  arrow: <><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></>,
  upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></>,
  eyeOff: <><path d="M3 3l18 18"/><path d="M10.5 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16.5 16.5 0 0 1-3 3.2M6.2 6.7C4 8.1 2.5 10.5 2.5 12c0 0 3.5 6 9.5 6 1.2 0 2.3-.2 3.3-.6"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  clock: <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>,
  shield: <><path d="M12 3 19 6v5c0 4.2-2.3 7.4-7 10-4.7-2.6-7-5.8-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
  chevron: <path d="m8 10 4 4 4-4"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></>,
  send: <path d="m4 12 16-8-5.5 16L11 14 4 12Z"/>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  wave: <><path d="M16.5 11V6.5a1.5 1.5 0 0 0-3 0V11"/><path d="M13.5 11V5a1.5 1.5 0 0 0-3 0v6"/><path d="M10.5 11V7a1.5 1.5 0 0 0-3 0v4.5"/><path d="M7.5 10.5a1.5 1.5 0 0 0-3 0V15a6 6 0 0 0 6 6h1a6 6 0 0 0 6-6v-3.5a1.5 1.5 0 0 0-3 0"/></>,
};

export default function Icon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.spark}
    </svg>
  );
}
