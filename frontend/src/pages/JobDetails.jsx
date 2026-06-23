import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data));
  }, [id]);

  useEffect(() => {
    if (user?.savedJobs) setSaved(user.savedJobs.includes(id));
  }, [user, id]);

  const toggleSave = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.put(`/users/saved-jobs/${id}`);
    setSaved(data.saved);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);
      await api.post(`/applications/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: 'Arizangiz muvaffaqiyatli yuborildi!' });
      setApplyOpen(false);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return <p className="text-center py-20 text-muted">Yuklanmoqda...</p>;

  const salary =
    job.salaryMin || job.salaryMax
      ? `${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} ${job.currency}`
      : 'Kelishilgan holda';

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="card p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">{job.title}</h1>
            <p className="text-muted mt-1">{job.company} · {job.location}</p>
          </div>
          {user?.role === 'jobseeker' && (
            <button onClick={toggleSave} className={saved ? 'btn-accent' : 'btn-outline'}>
              {saved ? 'Saqlangan ✓' : 'Saqlash'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="badge bg-primary-light text-primary-dark">{job.type}</span>
          <span className="badge bg-canvas border border-line">{job.experienceLevel}</span>
          <span className="badge bg-canvas border border-line">{job.category}</span>
        </div>

        <p className="font-semibold text-primary-dark mt-5">{salary}</p>

        <div className="mt-6">
          <h2 className="font-display font-semibold mb-2">Tavsif</h2>
          <p className="text-sm text-ink/80 whitespace-pre-line">{job.description}</p>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display font-semibold mb-2">Talab qilinadigan ko'nikmalar</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="badge bg-canvas border border-line">{s}</span>
              ))}
            </div>
          </div>
        )}

        {job.requirements?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display font-semibold mb-2">Talablar</h2>
            <ul className="list-disc list-inside text-sm text-ink/80 space-y-1">
              {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {status.message && (
          <p className={`mt-6 text-sm rounded px-3 py-2 ${status.type === 'success' ? 'bg-primary-light text-primary-dark' : 'bg-accent-light text-accent-dark'}`}>
            {status.message}
          </p>
        )}

        <div className="mt-7 pt-6 border-t border-line">
          {!user ? (
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Ariza topshirish uchun kiring
            </button>
          ) : user.role !== 'jobseeker' ? (
            <p className="text-sm text-muted text-center">Faqat ish izlovchilar ariza topshira oladi</p>
          ) : !applyOpen ? (
            <button onClick={() => setApplyOpen(true)} className="btn-primary w-full">
              Vakansiyaga ariza topshirish
            </button>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="label">Rezyume (CV) — PDF/DOC</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="input"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>
              <div>
                <label className="label">Xat (ixtiyoriy)</label>
                <textarea
                  className="input"
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="O'zingiz haqingizda qisqacha yozing..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
                <button type="button" onClick={() => setApplyOpen(false)} className="btn-outline">
                  Bekor qilish
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
