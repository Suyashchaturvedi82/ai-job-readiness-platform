import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import client, { errorMessage } from '../api/client';
import ProgressRing from '../components/ProgressRing';
import Icon from '../components/Icon';

const TOTAL = 5;
const scoreTone = (s) => (s >= 7 ? '' : s >= 5 ? 'warn' : 'bad');

const SpeechRec =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function Interview() {
  const params = useParams();
  const analysisId = params.analysisId || params.id;

  const [phase, setPhase] = useState('intro'); // intro | question | feedback | results
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  const chatRef = useRef(null);
  const recRef = useRef(null);
  const msgId = useRef(0);

  const pushMsg = (m) => setMessages((list) => [...list, { id: ++msgId.current, ...m }]);

  // smooth auto-scroll whenever messages or the typing indicator change
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // stop any live recognition on unmount
  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* already stopped */ } }, []);

  const fail = (err) => setError(errorMessage(err, 'Something went wrong, please try again'));

  async function loadNext(sid = sessionId) {
    setLoading(true);
    setError('');
    try {
      const { data } = await client.post(`/interview-sessions/${sid}/questions/next`);
      setQuestion(data);
      setAnswer('');
      setFeedback(null);
      setPhase('question');
      pushMsg({
        role: 'ai',
        text: data.questionText,
        meta: `Question ${history.length + 1} of ${TOTAL} · ${data.difficulty}`,
      });
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    if (sessionId) return loadNext();
    setLoading(true);
    setError('');
    try {
      const { data } = await client.post(`/interview-sessions?analysisId=${analysisId}`);
      setSessionId(data.sessionId);
      setHistory([]);
      setMessages([]);
      pushMsg({
        role: 'ai',
        text: `Hi — I'm your AI interviewer. I'll ask you ${TOTAL} questions tailored to your resume and the skill gaps for this role.\n\nAnswer just like you would in the real interview. Good luck!`,
        meta: 'AI Interviewer',
      });
      await loadNext(data.sessionId);
    } catch (err) {
      fail(err);
      setLoading(false);
    }
  }

  async function submit() {
    if (!answer.trim() || answer.trim().length < 10 || loading) return;
    setLoading(true);
    setError('');
    pushMsg({ role: 'user', text: answer.trim(), meta: 'You' });
    try {
      const { data } = await client.post(`/interview-sessions/questions/${question.id}/answers`, {
        answerText: answer.trim(),
      });
      setFeedback(data);
      setHistory((h) => [
        ...h,
        {
          question: question.questionText,
          difficulty: question.difficulty,
          answer: answer.trim(),
          score: data.score,
          feedback: data.feedback,
        },
      ]);
      pushMsg({
        role: 'feedback',
        text: data.feedback,
        meta: 'Interviewer feedback',
        score: data.score,
      });
      setPhase('feedback');
      setAnswer('');
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  }

  const next = () => (history.length >= TOTAL ? setPhase('results') : loadNext());

  function reset() {
    setPhase('intro');
    setSessionId(null);
    setQuestion(null);
    setAnswer('');
    setFeedback(null);
    setHistory([]);
    setMessages([]);
    setError('');
  }

  // ---- push-to-talk microphone (scaffold) ----
  function startListening() {
    if (!SpeechRec || loading) return;
    try {
      const rec = new SpeechRec();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (e) => {
        const text = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(' ')
          .trim();
        if (text) setAnswer((a) => (a ? `${a} ${text}` : text));
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    try {
      recRef.current?.stop();
    } catch {
      /* not started */
    }
    setListening(false);
  }

  const avg = history.length ? history.reduce((s, h) => s + h.score, 0) / history.length : 0;
  const weak = history.filter((h) => h.score < 6);
  const pct = Math.min(history.length / TOTAL, 1) * 100;
  const inSession = phase === 'question' || phase === 'feedback';

  return (
    <div className="interview">
      <div>
        <div className="eyebrow"><Icon name="interview" size={13} /> Mock interview</div>
        <h1 style={{ marginBottom: 4 }}>Live practice room</h1>
        <p className="muted" style={{ margin: 0 }}>
          {phase === 'results'
            ? 'Session complete — review your performance below.'
            : `${TOTAL} questions tailored to your resume and skill gaps.`}
        </p>
      </div>

      {error && (
        <p className="form-error" role="alert">
          <Icon name="shield" size={16} /> {error}
        </p>
      )}

      {inSession && (
        <div className="interview-progress">
          <div className="interview-progress-track">
            <div className="interview-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="interview-progress-label">
            {Math.min(history.length + (phase === 'question' ? 1 : 0), TOTAL)} / {TOTAL} answered
          </span>
        </div>
      )}

      {phase === 'intro' && (
        <div className="card static interview-intro">
          <div className="auth-badge" style={{ margin: '0 auto 18px' }}>
            <Icon name="interview" size={24} />
          </div>
          <h2>Ready when you are</h2>
          <p>
            Answer like it's a real interview — your answers are scored instantly with written
            feedback. <kbd>Ctrl</kbd> + <kbd>Enter</kbd> submits.
          </p>
          <div className="interview-actions">
            <button className="btn btn-primary" onClick={start} disabled={loading}>
              {loading ? (
                <><span className="spinner" aria-hidden="true" /> Preparing your interviewer…</>
              ) : (
                <>Start interview <Icon name="arrow" size={16} className="btn-arrow" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {inSession && (
        <>
          <div className="chat-window" ref={chatRef}>
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  className={`chat-msg ${m.role === 'user' ? 'user' : 'ai'}`}
                  initial={{ opacity: 0, scale: 0.82, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                >
                  <div className="bubble-meta">
                    {m.role === 'user' ? <Icon name="user" size={12} /> : <Icon name="spark" size={12} />}
                    {m.meta}
                  </div>
                  <div className={`bubble ${m.role === 'user' ? 'user' : m.role === 'feedback' ? 'feedback' : 'ai'}`}>
                    {m.score != null && (
                      <div style={{ marginBottom: 8 }}>
                        <span className={`score-pill ${scoreTone(m.score)}`}>
                          <Icon name="target" size={12} /> {m.score}/10
                        </span>
                      </div>
                    )}
                    <p style={m.score != null ? { color: 'var(--text)' } : undefined}>{m.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                className="chat-msg ai"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              >
                <div className="bubble typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span className="typing-label">
                  AI is typing{feedback ? ' your feedback' : ' a question'}…
                </span>
              </motion.div>
            )}
          </div>

          {phase === 'question' && (
            <div className="chat-composer">
              <textarea
                rows={4}
                value={answer}
                placeholder="Type your answer…"
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') submit();
                }}
              />
              <div className="composer-buttons">
                <button
                  type="button"
                  className={`mic-btn${listening ? ' listening' : ''}`}
                  disabled={!SpeechRec || loading}
                  onPointerDown={startListening}
                  onPointerUp={stopListening}
                  onPointerLeave={() => listening && stopListening()}
                  title={
                    SpeechRec
                      ? listening
                        ? 'Listening — release to stop'
                        : 'Hold to talk'
                      : 'Voice input is not supported in this browser'
                  }
                >
                  <Icon name="mic" size={17} />
                  {listening ? 'Listening…' : 'Hold to talk'}
                </button>
                <span className="mic-hint">
                  {SpeechRec ? (
                    <><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send</>
                  ) : (
                    <>Voice input unsupported here — type your answer.</>
                  )}
                </span>
                <button
                  className="btn btn-primary"
                  onClick={submit}
                  disabled={loading || answer.trim().length < 10}
                >
                  {loading ? (
                    <><span className="spinner" aria-hidden="true" /> Scoring…</>
                  ) : (
                    <>Send answer <Icon name="send" size={15} className="btn-arrow" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {phase === 'feedback' && feedback && (
            <div className="interview-actions">
              <button className="btn btn-primary" onClick={next} disabled={loading}>
                {loading ? (
                  <><span className="spinner" aria-hidden="true" /> Loading…</>
                ) : (
                  <>
                    {history.length >= TOTAL ? 'See my results' : 'Next question'}
                    <Icon name="arrow" size={16} className="btn-arrow" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {phase === 'results' && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div
            className="card static interview-summary"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <ProgressRing value={avg * 10} size={170} label="Avg score" />
            <h2 style={{ marginTop: 14 }}>
              {avg >= 7 ? 'Interview-ready' : avg >= 5 ? 'Getting there' : 'Needs more practice'}
            </h2>
            <p>
              Average score: <strong style={{ color: 'var(--text)' }}>{avg.toFixed(1)}/10</strong> across{' '}
              {history.length} questions
            </p>
            <div className="interview-actions">
              <button className="btn btn-primary" onClick={reset}>
                Try another session <Icon name="refresh" size={15} className="btn-arrow" />
              </button>
              <Link to={`/analysis/${analysisId}`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                Back to analysis
              </Link>
            </div>
          </div>

          {weak.length > 0 && (
            <div className="card static" style={{ marginTop: 18 }}>
              <div className="section-title">
                <Icon name="target" size={17} />
                <h3 className="mt-0" style={{ marginBottom: 0 }}>Revise these</h3>
              </div>
              {weak.map((h, i) => (
                <div className="review-item" key={i}>
                  <span className={`score-pill ${scoreTone(h.score)}`} style={{ marginBottom: 6 }}>
                    {h.score}/10
                  </span>
                  <strong style={{ fontSize: '.92rem' }}>{h.question}</strong>
                  <p>{h.feedback}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card static" style={{ marginTop: 18 }}>
            <div className="section-title">
              <Icon name="file" size={17} />
              <h3 className="mt-0" style={{ marginBottom: 0 }}>Question review</h3>
            </div>
            {history.map((h, i) => (
              <div className="review-item" key={i}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`score-pill ${scoreTone(h.score)}`}>{h.score}/10</span>
                  <strong style={{ fontSize: '.9rem' }}>{h.question}</strong>
                </div>
                <p>{h.feedback}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
