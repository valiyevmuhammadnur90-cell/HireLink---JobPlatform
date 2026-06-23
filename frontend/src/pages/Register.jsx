import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-semibold text-center mb-1">Ro'yxatdan o'tish</h1>
      <p className="text-muted text-sm text-center mb-8">Bir necha daqiqada hisob yarating</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-accent-dark bg-accent-light rounded px-3 py-2">{error}</p>}

        <div>
          <label className="label">To'liq ism</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Parol</label>
          <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label className="label">Men kimman?</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'jobseeker', label: 'Ish izlovchi' },
              { value: 'employer', label: 'Ish beruvchi' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm({ ...form, role: opt.value })}
                className={`rounded border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.role === opt.value ? 'border-primary bg-primary-light text-primary-dark' : 'border-line text-ink/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Yaratilmoqda...' : "Hisob yaratish"}
        </button>

        <p className="text-sm text-center text-muted">
          Hisobingiz bormi? <Link to="/login" className="text-primary font-medium">Kiring</Link>
        </p>
      </form>
    </div>
  );
}
