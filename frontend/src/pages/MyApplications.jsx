import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusLabels = {
  pending: { label: 'Kutilmoqda', cls: 'bg-canvas border border-line' },
  reviewed: { label: "Ko'rib chiqilmoqda", cls: 'bg-primary-light text-primary-dark' },
  accepted: { label: 'Qabul qilindi', cls: 'bg-primary text-white' },
  rejected: { label: 'Rad etildi', cls: 'bg-accent-light text-accent-dark' },
};

export default function MyApplications() {
  const [applications, setApplications] = useState(null);

  useEffect(() => {
    api.get('/applications/my').then(({ data }) => setApplications(data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">Mening arizalarim</h1>

      {!applications ? (
        <p className="text-muted text-center py-16">Yuklanmoqda...</p>
      ) : applications.length === 0 ? (
        <p className="text-muted text-center py-16">Hali hech qanday vakansiyaga ariza topshirmagansiz</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app._id} className="card p-4 flex items-center justify-between">
              <div>
                <Link to={`/jobs/${app.job?._id}`} className="font-medium hover:text-primary">
                  {app.job?.title || "O'chirilgan vakansiya"}
                </Link>
                <p className="text-sm text-muted">{app.job?.company}</p>
              </div>
              <span className={`badge ${statusLabels[app.status].cls}`}>{statusLabels[app.status].label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
