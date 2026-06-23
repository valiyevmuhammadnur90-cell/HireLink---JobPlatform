import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const initial = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  category: 'general',
  experienceLevel: 'any',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  description: '',
  skills: '',
  requirements: '',
};

export default function JobCreateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.post('/jobs', payload);
      navigate(`/jobs/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Vakansiya yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">Yangi vakansiya joylash</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-accent-dark bg-accent-light rounded px-3 py-2">{error}</p>}

        <div>
          <label className="label">Lavozim nomi</label>
          <input required className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Kompaniya</label>
            <input required className="input" value={form.company} onChange={(e) => set('company', e.target.value)} />
          </div>
          <div>
            <label className="label">Manzil</label>
            <input required className="input" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Ish turi</label>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="full-time">To'liq stavka</option>
              <option value="part-time">Qisman stavka</option>
              <option value="contract">Shartnoma</option>
              <option value="internship">Amaliyot</option>
              <option value="remote">Masofaviy</option>
            </select>
          </div>
          <div>
            <label className="label">Tajriba</label>
            <select className="input" value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
              <option value="any">Istalgan</option>
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
          <div>
            <label className="label">Kategoriya</label>
            <input className="input" value={form.category} onChange={(e) => set('category', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Min. maosh</label>
            <input type="number" className="input" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
          </div>
          <div>
            <label className="label">Max. maosh</label>
            <input type="number" className="input" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
          </div>
          <div>
            <label className="label">Valyuta</label>
            <input className="input" value={form.currency} onChange={(e) => set('currency', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Tavsif</label>
          <textarea required rows={5} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div>
          <label className="label">Ko'nikmalar (vergul bilan ajrating)</label>
          <input className="input" value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, Node.js, MongoDB" />
        </div>

        <div>
          <label className="label">Talablar (har birini yangi qatordan yozing)</label>
          <textarea rows={4} className="input" value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Joylanmoqda...' : 'Vakansiyani joylash'}
        </button>
      </form>
    </div>
  );
}
