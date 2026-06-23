import { useState, useEffect } from 'react';
import api from '../api/axios';

const statusOptions = ['pending', 'reviewed', 'accepted', 'rejected'];
const statusLabel = {
  pending: 'Kutilmoqda',
  reviewed: "Ko'rib chiqilmoqda",
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi',
};

export default function MyListings() {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/jobs/my/listings').then(({ data }) => setJobs(data));
  }, []);

  const openApplications = async (job) => {
    setActiveJob(job);
    const { data } = await api.get(`/applications/job/${job._id}`);
    setApplications(data);
  };

  const updateStatus = async (appId, status) => {
    const { data } = await api.put(`/applications/${appId}/status`, { status });
    setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status: data.status } : a)));
  };

  const deleteJob = async (jobId) => {
    if (!confirm("Ushbu vakansiyani o'chirmoqchimisiz?")) return;
    await api.delete(`/jobs/${jobId}`);
    setJobs((prev) => prev.filter((j) => j._id !== jobId));
    if (activeJob?._id === jobId) setActiveJob(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">Mening vakansiyalarim</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {jobs.length === 0 && <p className="text-muted">Hali vakansiya joylamadingiz</p>}
          {jobs.map((job) => (
            <div
              key={job._id}
              className={`card p-4 cursor-pointer ${activeJob?._id === job._id ? 'border-primary' : ''}`}
              onClick={() => openApplications(job)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted">{job.applicationsCount} ta ariza · {job.viewsCount} ko'rishlar</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteJob(job._id); }}
                  className="text-xs text-accent-dark hover:underline"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          {activeJob ? (
            <div>
              <h2 className="font-display font-semibold mb-3">"{activeJob.title}" uchun arizalar</h2>
              <div className="space-y-3">
                {applications.length === 0 && <p className="text-muted text-sm">Hali arizalar yo'q</p>}
                {applications.map((app) => (
                  <div key={app._id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{app.applicant?.name}</p>
                        <p className="text-xs text-muted">{app.applicant?.email}</p>
                      </div>
                      <a href={app.resume} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                        CV
                      </a>
                    </div>
                    {app.coverLetter && <p className="text-sm text-ink/70 mt-2">{app.coverLetter}</p>}
                    <select
                      className="input mt-3 !py-1.5 text-xs"
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted text-sm">Arizalarni ko'rish uchun chapdan vakansiya tanlang</p>
          )}
        </div>
      </div>
    </div>
  );
}
