import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/analyses/${id}`).then((res) => setAnalysis(res.data)).finally(() => setLoading(false));
  }, [id]);

  async function handleRoadmap() {
    const res = await client.post(`/analyses/${id}/roadmap`);
    setRoadmap(res.data);
  }

  if (loading) return <p>Loading...</p>;
  if (!analysis) return <p>Analysis not found</p>;

  return (
    <div className="analysis-result">
      <h1>Readiness Score: {analysis.readinessScore}%</h1>
      <table>
        <thead><tr><th>Skill</th><th>Status</th><th>Priority</th></tr></thead>
        <tbody>
          {analysis.skills.map((s) => (
            <tr key={s.skillName} className={`status-${s.status.toLowerCase()}`}>
              <td>{s.skillName}</td><td>{s.status}</td><td>{s.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleRoadmap}>Generate Prep Roadmap</button>
      {roadmap && (
        <ol>{roadmap.map((r) => (
          <li key={r.order}><strong>{r.skillName}</strong>: {r.topic} (~{r.estimatedHours}h)</li>
        ))}</ol>
      )}
      <Link to={`/interview/start/${id}`}>Start Mock Interview →</Link>
    </div>
  );
}