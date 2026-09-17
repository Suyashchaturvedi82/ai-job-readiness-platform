import { useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';

export default function Interview() {
  const { analysisId } = useParams();
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const res = await client.post(`/interview-sessions?analysisId=${analysisId}`);
    setSessionId(res.data.sessionId);
    await getNextQuestion(res.data.sessionId);
    setLoading(false);
  }
  async function getNextQuestion(sid) {
    const res = await client.post(`/interview-sessions/${sid}/questions/next`);
    setQuestion(res.data); setFeedback(null); setAnswer('');
  }
  async function submitAnswer() {
    setLoading(true);
    const res = await client.post(`/interview-sessions/questions/${question.id}/answers`, { answerText: answer });
    setFeedback(res.data); setLoading(false);
  }

  if (!sessionId) return <button onClick={start} disabled={loading}>Start Mock Interview</button>;

  return (
    <div className="interview">
      {question && <h2>{question.questionText} <small>({question.difficulty})</small></h2>}
      <textarea rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button onClick={submitAnswer} disabled={loading || !answer}>Submit Answer</button>
      {feedback && (
        <div className="feedback">
          <p>Score: {feedback.score}/10</p>
          <p>{feedback.feedback}</p>
          <button onClick={() => getNextQuestion(sessionId)}>Next Question →</button>
        </div>
      )}
    </div>
  );
}