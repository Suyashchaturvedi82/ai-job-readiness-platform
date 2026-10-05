import { useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdTitle, setJdTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleAnalyze(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      const resumeRes = await client.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const jdRes = await client.post('/job-descriptions', { title: jdTitle, rawText: jdText });
      const analysisRes = await client.post('/analyses', { resumeId: resumeRes.data.id, jobDescriptionId: jdRes.data.id });
      navigate(`/analysis/${analysisRes.data.analysisId}`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Something went wrong');
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="dashboard">
      <h1>New Analysis</h1>
      <form onSubmit={handleAnalyze}>
        
        <label>Resume (PDF/DOCX)</label>
        <div className="upload-zone">
          <input 
            type="file" 
            accept=".pdf,.docx,.txt" 
            onChange={(e) => setResumeFile(e.target.files[0])} 
            required 
          />
        </div>

        <label>Job Title</label>
        <input 
          value={jdTitle} 
          onChange={(e) => setJdTitle(e.target.value)} 
          required 
        />
        
        <label>Job Description</label>
        <textarea 
          rows={10} 
          value={jdText} 
          onChange={(e) => setJdText(e.target.value)} 
          required 
        />

        <button type="submit" disabled={loading || !resumeFile}>
          {loading ? 'Analyzing... (~10-20s)' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}