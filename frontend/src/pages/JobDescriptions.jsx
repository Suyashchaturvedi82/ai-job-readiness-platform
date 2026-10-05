import { useEffect, useState } from 'react';
import client from '../api/client';

export default function JobDescriptions() {
    const [jobDescriptions, setJobDescriptions] = useState([]);

    useEffect(() => {
        client.get('/job-descriptions').then(res => setJobDescriptions(res.data));
    }, []);

    return (
        <div className="card">
            <h2>Your Job Descriptions</h2>
            <ul>
                {jobDescriptions.map(jd => (
                    <li key={jd.id}>{jd.title} - {jd.company}</li>
                ))}
            </ul>
        </div>
    );
}