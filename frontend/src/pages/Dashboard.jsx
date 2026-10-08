import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client, { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { store, fmtDate } from '../lib';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // backend limit: spring.servlet.multipart.max-file-size=5MB
const ALLOWED_TYPES = ['.pdf', '.docx'];
const MIN_TITLE = 3;
const MIN_JD = 50;

function validateFile(file) {
  if (!file) return 'Please choose a resume file.';
  const name = file.name.toLowerCase();
  if (!ALLOWED_TYPES.some((ext) => name.endsWith(ext))) {
    return `Unsupported file type "${file.name.split('.').pop()}" — only PDF and DOCX are allowed.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB) — maximum size is 5 MB.`;
  }
  return null;
}

export default function Dashboard() {
  const location = useLocation();
  const preset = location.state || {};

  const [resumeFile, setResumeFile] = useState(null);
  const [presetResume, setPresetResume] = useState(preset.resume || null);
  const [presetJd, setPresetJd] = useState(preset.jd || null);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [jdTitle, setJdTitle] = useState(preset.jd?.title || '');
  const [jdText, setJdText] = useState('');
  const [touched, setTouched] = useState({ title: false, jd: false, file: false });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ resumes: 0, jds: 0 });
  const [last] = useState(() => store.get('jr:lastAnalysis', null));
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    client.get('/resumes').then((r) => setStats((s) => ({ ...s, resumes: r.data.length }))).catch(() => {});
    client.get('/job-descriptions').then((r) => setStats((s) => ({ ...s, jds: r.data.length }))).catch(() => {});
  }, []);

  const titleValid = jdTitle.trim().length >= MIN_TITLE;
  const jdValid = jdText.trim().length >= MIN_JD;
  const hasResume = Boolean(presetResume) || (Boolean(resumeFile) && !fileError);
  const hasJd = Boolean(presetJd) || (titleValid && jdValid);
  const canSubmit = hasResume && hasJd && !loading;

  function acceptFile(file) {
    if (!file) return;
    const problem = validateFile(file);
    if (problem) {
      setResumeFile(null);
      setFileError(problem);
      setTouched((t) => ({ ...t, file: true }));
      return;
    }
    setFileError('');
    setPresetResume(null);
    setResumeFile(file);
    setTouched((t) => ({ ...t, file: true }));
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  function clearPresetResume() {
    setPresetResume(null);
    setResumeFile(null);
    setFileError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    setTouched({ title: true, jd: true, file: true });
    if (!canSubmit) return;
    setLoading(true);
    try {
      let resumeId = presetResume?.id;
      if (!resumeId) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        const resumeRes = await client.post('/resumes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        resumeId = resumeRes.data.id;
      }

      let jdId = presetJd?.id;
      if (!jdId) {
        const jdRes = await client.post('/job-descriptions', {
          title: jdTitle.trim(),
          rawText: jdText,
        });
        jdId = jdRes.data.id;
      }

      const analysisRes = await client.post('/analyses', {
        resumeId,
        jobDescriptionId: jdId,
      });
      navigate(`/analysis/${analysisRes.data.analysisId}`);
    } catch (err) {
      showToast(errorMessage(err, 'Analysis failed — please try again'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <div className="eyebrow"><Icon name="zap" size={13} /> AI-powered skill matching</div>
      <h1>New Analysis</h1>
      <p className="muted">Drop your resume, pick a target role, and get your readiness score in seconds.</p>

      {/* Gamified stat cards */}
      <div className="cards-grid" style={{ margin: '24px 0 30px' }}>
        <div className="card static stat-tile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProgressRing value={last?.score ?? 0} size={92} stroke={8} label="Score" />
          <div>
            <div className="item-sub" style={{ marginBottom: 2 }}>
              {last ? 'Job readiness' : 'No score yet'}
            </div>
            <strong style={{ fontSize: '.95rem' }}>
              {last ? `${Math.round(last.score)}% match` : 'Run your first analysis'}
            </strong>
            <p className="muted" style={{ fontSize: '.78rem', margin: '4px 0 0' }}>
              {last ? `Updated ${fmtDate(last.at)}` : 'It takes about 30 seconds.'}
            </p>
          </div>
        </div>

        <button type="button" className="card static stat-tile" onClick={() => navigate('/resumes')}>
          <div className="item-head">
            <div className="item-icon"><Icon name="file" size={22} /></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.resumes}</div>
              <div className="item-sub">Saved resumes</div>
            </div>
          </div>
          <span className="item-hint" style={{ marginTop: 14 }}>
            Browse library <Icon name="arrow" size={14} />
          </span>
        </button>

        <button type="button" className="card static stat-tile" onClick={() => navigate('/job-descriptions')}>
          <div className="item-head">
            <div className="item-icon"><Icon name="briefcase" size={22} /></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.jds}</div>
              <div className="item-sub">Target roles</div>
            </div>
          </div>
          <span className="item-hint" style={{ marginTop: 14 }}>
            Browse roles <Icon name="arrow" size={14} />
          </span>
        </button>
      </div>

      <form onSubmit={handleAnalyze} noValidate className="card static" style={{ padding: 30 }}>
        <div className="section-title">
          <Icon name="upload" size={18} />
          <h3 className="mt-0" style={{ marginBottom: 0 }}>Resume <span className="muted" style={{ fontWeight: 400, fontSize: '.85rem' }}>(PDF/DOCX)</span></h3>
        </div>

        {presetResume ? (
          <div className="upload-zone has-file" style={{ padding: '26px 20px' }}>
            <div className="file-chip">
              <div className="upload-icon" style={{ margin: 0 }}><Icon name="check" size={26} /></div>
              <strong>{presetResume.fileName}</strong>
              <span>from your library</span>
              <button type="button" className="ghost-btn" onClick={clearPresetResume}>Replace</button>
            </div>
          </div>
        ) : (
          <div
            className={`upload-zone${dragOver ? ' drag-over' : ''}${resumeFile && !fileError ? ' has-file' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              hidden
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            {resumeFile && !fileError ? (
              <div className="file-chip">
                <div className="upload-icon" style={{ margin: 0 }}><Icon name="check" size={26} /></div>
                <strong>{resumeFile.name}</strong>
                <span>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPresetResume();
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <Icon name={dragOver ? 'zap' : 'upload'} size={26} />
                </div>
                <p className="drop-title">
                  {dragOver ? 'Release to upload' : 'Drag & drop your resume here'}
                </p>
                <p className="drop-hint">or click to browse — PDF/DOCX, up to 5 MB</p>
              </>
            )}
          </div>
        )}
        {touched.file && fileError && <p className="field-error">{fileError}</p>}

        <div className="section-title" style={{ marginTop: 26 }}>
          <Icon name="briefcase" size={18} />
          <h3 className="mt-0" style={{ marginBottom: 0 }}>Target role</h3>
          {presetJd && (
            <button
              type="button"
              className="chip"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setPresetJd(null);
                setJdTitle('');
                setJdText('');
                setTouched({ title: false, jd: false, file: false });
              }}
              title="Remove preset"
            >
              {presetJd.title} <Icon name="close" size={12} />
            </button>
          )}
        </div>

        {!presetJd && (
          <>
            <label htmlFor="jd-title">Job Title</label>
            <input
              id="jd-title"
              className={touched.title && !titleValid ? 'invalid' : jdTitle ? 'valid' : ''}
              value={jdTitle}
              onChange={(e) => {
                setJdTitle(e.target.value);
                setTouched((t) => ({ ...t, title: true }));
              }}
              placeholder="e.g. Software Developer"
              required
            />
            {touched.title && !titleValid && (
              <p className="field-error">Job title must be at least {MIN_TITLE} characters.</p>
            )}

            <label htmlFor="jd-text">Job Description</label>
            <textarea
              id="jd-text"
              rows={8}
              className={touched.jd && !jdValid ? 'invalid' : jdText ? 'valid' : ''}
              value={jdText}
              onChange={(e) => {
                setJdText(e.target.value);
                setTouched((t) => ({ ...t, jd: true }));
              }}
              placeholder="Paste the full job description…"
              required
            />
            <p className={`field-hint${jdText && !jdValid ? ' bad' : jdValid ? ' ok' : ''}`}>
              {jdValid ? (
                <><Icon name="check" size={13} /> Ready to analyze</>
              ) : (
                <>Minimum {MIN_JD} characters — {jdText.trim().length} so far</>
              )}
            </p>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!canSubmit}
          style={{ width: '100%', marginTop: 18 }}
        >
          {loading ? (
            <><span className="spinner" aria-hidden="true" /> Analyzing… (~10-20s)</>
          ) : (
            <>Analyze my readiness <Icon name="arrow" size={17} className="btn-arrow" /></>
          )}
        </button>
        {!loading && !hasResume && (
          <p className="field-error" style={{ justifyContent: 'center', marginTop: 12 }}>
            Add a valid resume file to enable Analyze.
          </p>
        )}
      </form>
    </div>
  );
}
