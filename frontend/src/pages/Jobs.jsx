import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import JobCard from '../components/JobCard';
import api from '../api/axios';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = { search, page, limit: 9, ...filters };
    Object.keys(params).forEach((k) => (params[k] === '' || params[k] === undefined) && delete params[k]);
    const { data } = await api.get('/jobs', { params });
    setJobs(data.jobs);
    setMeta({ total: data.total, page: data.page, pages: data.pages });
    setLoading(false);
  }, [search, page, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (value) => {
    setSearchParams({ search: value, page: 1 });
  };

  const goToPage = (p) => {
    setSearchParams({ search, page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-1">Vakansiyalar</h1>
      <p className="text-muted text-sm mb-6">{meta.total} ta vakansiya topildi</p>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialValue={search} />
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <FilterPanel filters={filters} setFilters={setFilters} />

        <div>
          {loading ? (
            <p className="text-muted text-center py-16">Yuklanmoqda...</p>
          ) : jobs.length === 0 ? (
            <p className="text-muted text-center py-16">Hech narsa topilmadi. Filtrlarni o'zgartirib ko'ring.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded text-sm font-medium ${
                    p === meta.page ? 'bg-primary text-white' : 'bg-surface border border-line text-ink/70'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
