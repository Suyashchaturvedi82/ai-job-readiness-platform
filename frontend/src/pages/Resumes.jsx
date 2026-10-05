import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  useEffect(() => { client.get('/resumes').then(res => setResumes(res.data)); }, []);
  return (
    <div className="card">
      <h2>Your Resumes</h2>
      <ul>{resumes.map(r => <li key={r.id}>{r.fileName}</li>)}</ul>
    </div>
  );
}