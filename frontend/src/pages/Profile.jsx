import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setProfile(data);
      setForm({
        name: data.name,
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        skills: (data.skills || []).join(', '),
        company: data.company || {},
      });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) };
      const { data } = await api.put('/users/profile', payload);
      updateUserData({ name: data.name });
      setMessage("Profil muvaffaqiyatli yangilandi");
    } catch (err) {
      setMessage(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const { data } = await api.post('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setProfile((p) => ({ ...p, resume: data.resume }));
    setMessage('Rezyume yuklandi');
  };

  if (!profile) return <p className="text-center py-20 text-muted">Yuklanmoqda...</p>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">Mening profilim</h1>

      {message && <p className="text-sm bg-primary-light text-primary-dark rounded px-3 py-2 mb-4">{message}</p>}

      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <div>
          <label className="label">Ism</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-canvas" value={profile.email} disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Telefon</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Manzil</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="label">Ko'nikmalar (vergul bilan ajrating)</label>
          <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>

        {profile.role === 'employer' && (
          <div>
            <label className="label">Kompaniya nomi</label>
            <input
              className="input"
              value={form.company?.name || ''}
              onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
            />
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saqlanmoqda...' : "Saqlash"}
        </button>
      </form>

      {profile.role === 'jobseeker' && (
        <div className="card p-6 mt-6">
          <h2 className="font-display font-semibold mb-3">Rezyume (CV)</h2>
          {profile.resume && (
            <a href={profile.resume} target="_blank" rel="noreferrer" className="text-primary text-sm underline">
              Joriy faylni ko'rish
            </a>
          )}
          <form onSubmit={handleResumeUpload} className="flex gap-3 mt-3">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="input"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <button type="submit" className="btn-outline shrink-0">Yuklash</button>
          </form>
        </div>
      )}
    </div>
  );
}
