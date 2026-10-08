import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import client, { errorMessage } from '../api/client';
import Icon from '../components/Icon';
import { Page, EmptyState, Skeleton } from '../components/ui';

export default function JobDescriptions() {
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/job-descriptions')
      .then((res) => setJobDescriptions(res.data))
      .catch((err) => setError(errorMessage(err, 'Could not load your job descriptions.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page
      title="Your Job Descriptions"
      subtitle="Saved target roles — expand a card to analyze your resume against it."
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

      {!loading && !error && jobDescriptions.length === 0 && (
        <EmptyState
          icon="briefcase"
          title="No target roles yet"
          text="Paste a job description during an analysis and it will be saved here for reuse."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 8 }}>
              Add a target role <Icon name="arrow" size={16} className="btn-arrow" />
            </button>
          }
        />
      )}

      {!loading && !error && jobDescriptions.length > 0 && (
        <div className="cards-grid">
          {jobDescriptions.map((jd) => {
            const open = openId === jd.id;
            return (
              <div
                key={jd.id}
                className={`card item-card${open ? ' open' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setOpenId(open ? null : jd.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpenId(open ? null : jd.id)}
              >
                <div className="item-head">
                  <div className="item-icon"><Icon name="briefcase" size={22} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div className="item-title">{jd.title}</div>
                    <div className="item-sub">{jd.company || 'Company not specified'}</div>
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
                          <div className="detail-cell"><span>Role ID</span><strong>#{jd.id}</strong></div>
                          <div className="detail-cell"><span>Title</span><strong>{jd.title}</strong></div>
                          <div className="detail-cell"><span>Company</span><strong>{jd.company || '—'}</strong></div>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            navigate('/dashboard', {
                              state: { jd: { id: jd.id, title: jd.title, company: jd.company } },
                            })
                          }
                        >
                          Target this role <Icon name="arrow" size={15} className="btn-arrow" />
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
