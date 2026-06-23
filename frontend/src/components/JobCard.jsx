import { Link } from 'react-router-dom';

const typeLabels = {
  'full-time': "To'liq stavka",
  'part-time': 'Qisman stavka',
  contract: 'Shartnoma',
  internship: 'Amaliyot',
  remote: 'Masofaviy',
};

export default function JobCard({ job }) {
  const salary =
    job.salaryMin || job.salaryMax
      ? `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0} ${job.currency}`
      : "Kelishilgan holda";

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card block p-5 hover:border-primary transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-base text-ink group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-muted mt-0.5">{job.company} · {job.location}</p>
        </div>
        <span className="badge bg-primary-light text-primary-dark shrink-0">
          {typeLabels[job.type] || job.type}
        </span>
      </div>

      <p className="text-sm text-ink/70 mt-3 line-clamp-2">{job.description}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
        <span className="text-sm font-semibold text-primary-dark">{salary}</span>
        <span className="text-xs text-muted">{job.applicationsCount} ta ariza</span>
      </div>
    </Link>
  );
}
