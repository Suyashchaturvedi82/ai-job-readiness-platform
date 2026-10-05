// Small shared helpers (no network).
export const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage full/blocked */ } },
};
export const scoreTone = (s) => (s >= 75 ? 'ok' : s >= 50 ? 'warn' : 'bad');
export const statusLabel = { STRONG: 'Strong', WEAK: 'Weak', MISSING: 'Missing' };
export const statusTone = { STRONG: 'ok', WEAK: 'warn', MISSING: 'bad' };
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
/** Priority is relative: top third of skills = High. */
export function priorityRank(skills) {
  const sorted = [...skills].sort((a, b) => b.priority - a.priority);
  const third = Math.max(1, Math.ceil(sorted.length / 3));
  const map = {};
  sorted.forEach((s, i) => { map[s.skillName] = i < third ? 'High' : i < third * 2 ? 'Medium' : 'Low'; });
  return map;
}
export const roadmapKey = (id) => `jr:roadmap:${id}`;
export const interviewKey = (id) => `jr:interview:${id}`;
export function splitPhases(items) {
  if (!items.length) return [];
  const n = Math.min(3, items.length);
  const size = Math.ceil(items.length / n);
  const names = ['Foundations', 'Core skills', 'Interview polish'];
  return Array.from({ length: n }, (_, i) => ({ name: `Phase ${i + 1} · ${names[i]}`, items: items.slice(i * size, (i + 1) * size) })).filter((p) => p.items.length);
}
