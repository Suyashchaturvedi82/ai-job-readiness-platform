import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client, { errorMessage } from '../api/client';
import ProgressRing from '../components/ProgressRing';
import Icon from '../components/Icon';
import { Skeleton } from '../components/ui';
import { store, priorityRank, splitPhases } from '../lib';

const verdict = (s) =>
  s >= 75
    ? { title: 'Interview ready', tone: 'ok', text: 'Strong match — focus on polishing your stories.' }
    : s >= 50
      ? { title: 'Getting close', tone: 'warn', text: 'Solid base, but a few priority skills need work.' }
      : { title: 'Significant gaps', tone: 'bad', text: 'Target the high-priority skills first for the fastest gains.' };

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  useEffect(() => {
    client
      .get(`/analyses/${id}`)
      .then((res) => {
        setAnalysis(res.data);
        store.set('jr:lastAnalysis', {
          score: res.data.readinessScore,
          analysisId: res.data.analysisId,
          at: Date.now(),
        });
      })
      .catch((err) => setError(errorMessage(err, 'Could not load this analysis.')))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRoadmap() {
    setRoadmapLoading(true);
    try {
      const res = await client.post(`/analyses/${id}/roadmap`);
      setRoadmap(res.data);
    } catch (err) {
      setError(errorMessage(err, 'Roadmap generation failed.'));
    } finally {
      setRoadmapLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        <Skeleton h={34} w="42%" style={{ marginBottom: 22 }} />
        <div className="card static" style={{ display: 'flex', gap: 26, alignItems: 'center', marginBottom: 20 }}>
          <Skeleton h={190} w={190} style={{ borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <Skeleton h={24} w="55%" style={{ marginBottom: 12 }} />
            <Skeleton h={14} w="85%" />
          </div>
        </div>
        <div className="card static">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} h={16} w="100%" style={{ marginBottom: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="state state-error" role="alert" style={{ maxWidth: 560, margin: '60px auto' }}>
        <div className="state-icon"><Icon name="shield" size={22} /></div>
        <strong>We hit a problem</strong>
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-ghost" style={{ marginTop: 8, textDecoration: 'none' }}>
          Back to dashboard
        </Link>
      </div>
    );
  }
  if (!analysis) return null;

  const score = Math.round(analysis.readinessScore);
  const v = verdict(score);
  const skills = analysis.skills || [];
  const counts = {
    STRONG: skills.filter((s) => s.status === 'STRONG').length,
    WEAK: skills.filter((s) => s.status === 'WEAK').length,
    MISSING: skills.filter((s) => s.status === 'MISSING').length,
  };
  const total = Math.max(1, skills.length);
  const rank = priorityRank(skills);

  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      <div className="eyebrow"><Icon name="chart" size={13} /> Analysis report #{analysis.analysisId}</div>
      <h1>Your readiness snapshot</h1>
      <p className="muted" style={{ marginBottom: 26 }}>How your resume stacks up against this job description.</p>

      {/* Score gauge + verdict */}
      <div className="card static" style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', padding: 32 }}>
        <ProgressRing value={score} size={190} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <span className={`chip ${v.tone}`} style={{ marginBottom: 12 }}>
            <Icon name={v.tone === 'ok' ? 'check' : 'target'} size={13} /> {v.title}
          </span>
          <h2 style={{ margin: '10px 0 6px' }}>{score}% job readiness</h2>
          <p className="muted" style={{ marginBottom: 16 }}>{v.text}</p>
          <div className="detail-grid" style={{ maxWidth: 420 }}>
            <div className="detail-cell">
              <span>Strong</span>
              <strong style={{ color: 'var(--success)' }}>{counts.STRONG}</strong>
            </div>
            <div className="detail-cell">
              <span>Weak</span>
              <strong style={{ color: 'var(--warn)' }}>{counts.WEAK}</strong>
            </div>
            <div className="detail-cell">
              <span>Missing</span>
              <strong style={{ color: 'var(--danger)' }}>{counts.MISSING}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Skill distribution chart */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card static">
          <div className="section-title"><Icon name="chart" size={17} /><h3 className="mt-0" style={{ marginBottom: 0 }}>Skill distribution</h3></div>
          <div className="stat-bars" style={{ marginTop: 16 }}>
            <div className="stat-row">
              <span className="stat-label">Strong</span>
              <div className="stat-track"><div className="stat-fill ok" style={{ width: `${(counts.STRONG / total) * 100}%` }} /></div>
              <span className="stat-value" style={{ color: 'var(--success)' }}>{counts.STRONG}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Weak</span>
              <div className="stat-track"><div className="stat-fill warn" style={{ width: `${(counts.WEAK / total) * 100}%` }} /></div>
              <span className="stat-value" style={{ color: 'var(--warn)' }}>{counts.WEAK}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Missing</span>
              <div className="stat-track"><div className="stat-fill bad" style={{ width: `${(counts.MISSING / total) * 100}%` }} /></div>
              <span className="stat-value" style={{ color: 'var(--danger)' }}>{counts.MISSING}</span>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '.82rem', marginTop: 16, marginBottom: 0 }}>
            {skills.length} skills extracted · matched live against the role requirements.
          </p>
        </div>

        <div className="card static">
          <div className="section-title"><Icon name="target" size={17} /><h3 className="mt-0" style={{ marginBottom: 0 }}>Top priorities</h3></div>
          <div className="stat-bars" style={{ marginTop: 16 }}>
            {skills
              .slice()
              .sort((a, b) => b.priority - a.priority)
              .slice(0, 4)
              .map((s) => {
                const tone = s.status === 'STRONG' ? 'ok' : s.status === 'WEAK' ? 'warn' : 'bad';
                return (
                  <div className="stat-row" key={s.skillName}>
                    <span className="stat-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skillName}</span>
                    <div className="stat-track">
                      <div className={`stat-fill ${tone}`} style={{ width: `${Math.min(100, s.priority * 10)}%` }} />
                    </div>
                    <span className="stat-value">{s.priority}</span>
                  </div>
                );
              })}
          </div>
          <p className="muted" style={{ fontSize: '.82rem', marginTop: 16, marginBottom: 0 }}>
            Priority is relative — the tallest bars matter most for this role.
          </p>
        </div>
      </div>

      {/* Skills table */}
      <div className="card static" style={{ marginTop: 20 }}>
        <div className="section-title"><Icon name="file" size={17} /><h3 className="mt-0" style={{ marginBottom: 0 }}>Full skill breakdown</h3></div>
        <table>
          <thead>
            <tr><th>Skill</th><th>Status</th><th>Priority</th></tr>
          </thead>
          <tbody>
            {skills.map((s) => {
              const tone = s.status === 'STRONG' ? 'ok' : s.status === 'WEAK' ? 'warn' : 'bad';
              const level = rank[s.skillName] || 'Medium';
              return (
                <tr key={s.skillName} className={`status-${s.status.toLowerCase()}`}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{s.skillName}</td>
                  <td><span className={`chip ${tone}`}>{s.status.charAt(0) + s.status.slice(1).toLowerCase()}</span></td>
                  <td>
                    <span className={`chip${level === 'High' ? ' bad' : level === 'Medium' ? ' warn' : ''}`}>{level}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Roadmap */}
      <div className="card static" style={{ marginTop: 20 }}>
        <div className="section-title"><Icon name="zap" size={17} /><h3 className="mt-0" style={{ marginBottom: 0 }}>Prep roadmap</h3></div>
        {!roadmap ? (
          <>
            <p className="muted">Turn this analysis into a phased study plan with estimated hours.</p>
            <button className="btn btn-primary" onClick={handleRoadmap} disabled={roadmapLoading}>
              {roadmapLoading ? (
                <><span className="spinner" aria-hidden="true" /> Generating…</>
              ) : (
                <>Generate prep roadmap <Icon name="arrow" size={16} className="btn-arrow" /></>
              )}
            </button>
          </>
        ) : (
          <div className="cards-grid" style={{ marginTop: 8 }}>
            {splitPhases(roadmap).map((phase) => (
              <div className="card static" key={phase.name} style={{ padding: 20 }}>
                <span className="eyebrow" style={{ marginBottom: 10 }}>{phase.name}</span>
                {phase.items.map((item) => (
                  <div className="review-item" key={`${phase.name}-${item.order}`}>
                    <strong style={{ fontSize: '.9rem' }}>{item.skillName}</strong>
                    <p>
                      {item.topic}
                      {item.estimatedHours != null && <> · ~{item.estimatedHours}h</>}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next step */}
      <div className="card static" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <h3 className="mt-0" style={{ marginBottom: 4 }}>Ready to practice?</h3>
          <p className="muted" style={{ margin: 0 }}>Face 5 interview questions tailored to your skill gaps.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-ghost" style={{ textDecoration: 'none' }}>New analysis</Link>
          <Link to={`/interview/start/${id}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Start mock interview <Icon name="arrow" size={16} className="btn-arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
}
