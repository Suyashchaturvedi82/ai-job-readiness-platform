import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import client, { errorMessage } from '../api/client';
import Icon from '../components/Icon';
import { Page, EmptyState, Skeleton } from '../components/ui';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/resumes')
      .then((res) => setResumes(res.data))
      .catch((err) => setError(errorMessage(err, 'Could not load your resumes.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page
      title="Your Resumes"
      subtitle="Hover to preview, click a card to expand and jump straight into an analysis."
      actions={
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          New analysis <Icon name="arrow" size={16} className="btn-arrow" />
        </button>
      }
    >
      {loading && (
        <div className="cards-grid">
          {[0, 1, 2].map((i) => (
            <div className="card static" key={i}>
              <Skeleton h={46} w={46} style={{ borderRadius: 15, marginBottom: 16 }} />
              <Skeleton h={16} w="70%" style={{ marginBottom: 10 }} />
              <Skeleton h={12} w="45%" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="state state-error" role="alert">
          <div className="state-icon"><Icon name="shield" size={22} /></div>
          <strong>We hit a problem</strong>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && resumes.length === 0 && (
        <EmptyState
          icon="file"
          title="No resumes yet"
          text="Upload your first resume during an analysis and it will live here for reuse."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 8 }}>
              Upload a resume <Icon name="arrow" size={16} className="btn-arrow" />
            </button>
          }
        />
      )}

      {!loading && !error && resumes.length > 0 && (
        <div className="cards-grid">
          {resumes.map((r) => {
            const ext = (r.fileName.split('.').pop() || 'file').toUpperCase();
            const open = openId === r.id;
            return (
              <div
                key={r.id}
                className={`card item-card${open ? ' open' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setOpenId(open ? null : r.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpenId(open ? null : r.id)}
              >
                <div className="item-head">
                  <div className="item-icon"><Icon name="file" size={22} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div className="item-title">{r.fileName}</div>
                    <div className="item-sub">{ext} · ID {r.id}</div>
                  </div>
                </div>
                <div className={`expand-toggle${open ? ' open' : ''}`}>
                  <Icon name="chevron" size={18} />
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="item-expand"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="item-details">
                        <div className="detail-grid">
                          <div className="detail-cell"><span>Document ID</span><strong>#{r.id}</strong></div>
                          <div className="detail-cell"><span>Format</span><strong>{ext}</strong></div>
                          <div className="detail-cell"><span>Status</span><strong style={{ color: 'var(--success)' }}>Ready</strong></div>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            navigate('/dashboard', {
                              state: { resume: { id: r.id, fileName: r.fileName } },
                            })
                          }
                        >
                          Analyze with this resume <Icon name="arrow" size={15} className="btn-arrow" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
