export default function LoadingScreen({ label = 'Loading workspace' }) {
  return (
    <div className="loading-screen">
      <div className="loading-orbit"><span /></div>
      <strong>{label}</strong>
      <span>Just a moment…</span>
    </div>
  );
}
