import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import api from '../api/axios';

export default function SavedJobs() {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    api.get('/users/saved-jobs').then(({ data }) => setJobs(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">Saqlangan vakansiyalar</h1>

      {!jobs ? (
        <p className="text-muted text-center py-16">Yuklanmoqda...</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted text-center py-16">Hozircha saqlangan vakansiyalar yo'q</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
