import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client, { errorMessage } from '../api/client';
import Icon from '../components/Icon';
import { Page, Spinner } from '../components/ui';

const MAX = 5 * 1024 * 1024;
const OK_EXT = ['pdf', 'docx', 'txt'];

export default function Analyze() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { client.get('/resumes').then((r) => setResumes(r.data)).catch(() => {}); }, []);

  function pick(f) {
    setError('');
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!OK_EXT.includes(ext)) return setError('Unsupported file type. Please upload a PDF, DOCX or TXT file.');
    if (f.size > MAX) return setError('That file is larger than 5 MB.');
    if (f.size === 0) return setError('That file is empty.');
    setFile(f); setResumeId('');
  }

  async function submit(e) {
    e.preventDefault();
    if (phase) return;
    setError('');
    if (!file && !resumeId) return setError('Choose a resume to analyze.');
    if (text.trim().length < 50) return setError('Please paste a fuller job description (at least a few sentences).');
    try {
      let rid = resumeId;
      if (file) {
        setPhase('Uploading resume…');
        const fd = new FormData(); fd.append('file', file);
        rid = (await client.post('/resumes', fd)).data.id;
      }
      setPhase('Saving job description…');
      const jd = (await client.post('/job-descriptions', { title: title.trim() || 'Untitled role', company: company.trim() || null, rawText: text })).data;
      setPhase('AI is analyzing your skills… this can take 10–30 seconds');
      const a = (await client.post('/analyses', { resumeId: Number(rid), jobDescriptionId: jd.id })).data;
      navigate(`/analysis/${a.analysisId}`);
    } catch (err) {
      setError(errorMessage(err));
      setPhase('');
    }
  }

  const busy = !!phase;
  return (
    <Page title="New analysis" subtitle="Upload a resume and paste the job you are targeting.">
      <form className="grid-2" onSubmit={submit}>
        <div className="card stack">
          <h3>1 · Resume</h3>
          <div className={`dropzone ${drag ? 'drag' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}>
            <Icon name={file ? 'check' : 'upload'} size={26} />
            <strong>{file ? file.name : 'Drop your resume here or click to browse'}</strong>
            <span className="muted">{file ? `${(file.size / 1024).toFixed(0)} KB · click to replace` : 'PDF, DOCX or TXT · max 5 MB · text-based files only'}</span>
            <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt" onChange={(e) => pick(e.target.files[0])} />
          </div>
          {resumes.length > 0 && (
            <label>…or reuse an uploaded resume
              <select value={resumeId} onChange={(e) => { setResumeId(e.target.value); if (e.target.value) setFile(null); }}>
                <option value="">Select a previous resume</option>
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.fileName}</option>)}
              </select>
            </label>
          )}
        </div>

        <div className="card stack">
          <h3>2 · Job description</h3>
          <div className="grid-2 tight">
            <label>Job title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend Engineer" /></label>
            <label>Company (optional)<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." /></label>
          </div>
          <label>Paste the job description<textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Responsibilities, requirements, tech stack…" /></label>
        </div>

        <div className="span-all stack">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? <><Spinner /> {phase}</> : <>Analyze readiness <Icon name="arrow" size={16} /></>}</button>
        </div>
      </form>
    </Page>
  );
}
