import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#0E5C4F', '#E0622B', '#6B7178', '#0A453B', '#FCE8DC'];
const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
  }, []);

  useEffect(() => {
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data));
    if (tab === 'jobs') api.get('/admin/jobs').then(({ data }) => setJobs(data));
  }, [tab]);

  const toggleUser = async (id) => {
    await api.put(`/admin/users/${id}/toggle-status`);
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  const removeUser = async (id) => {
    if (!confirm("Foydalanuvchini o'chirmoqchimisiz?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const toggleJob = async (id) => {
    await api.put(`/admin/jobs/${id}/toggle-status`);
    setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, isActive: !j.isActive } : j)));
  };

  const cards = stats
    ? [
        { label: 'Jami foydalanuvchilar', value: stats.totalUsers },
        { label: 'Ish izlovchilar', value: stats.totalJobseekers },
        { label: 'Ish beruvchilar', value: stats.totalEmployers },
        { label: 'Faol vakansiyalar', value: stats.activeJobs },
        { label: 'Jami arizalar', value: stats.totalApplications },
      ]
    : [];

  const jobsChartData = stats?.jobsPerMonth.map((d) => ({
    name: monthNames[d._id.month - 1],
    soni: d.count,
  })) || [];

  const appsChartData = stats?.applicationsByStatus.map((d) => ({
    name: d._id,
    value: d.count,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">Admin panel</h1>

      <div className="flex gap-2 mb-6 border-b border-line">
        {[
          { key: 'stats', label: 'Statistika' },
          { key: 'users', label: 'Foydalanuvchilar' },
          { key: 'jobs', label: 'Vakansiyalar' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="card p-4">
                <p className="text-2xl font-display font-semibold">{c.value}</p>
                <p className="text-xs text-muted mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Oylar bo'yicha joylangan vakansiyalar</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={jobsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D8" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="soni" fill="#0E5C4F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Arizalar holati bo'yicha</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={appsChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {appsChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ism</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-line">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'bg-primary-light text-primary-dark' : 'bg-accent-light text-accent-dark'}`}>
                      {u.isActive ? 'Faol' : 'Bloklangan'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => toggleUser(u._id)} className="text-xs text-primary hover:underline">
                      {u.isActive ? 'Bloklash' : 'Faollashtirish'}
                    </button>
                    <button onClick={() => removeUser(u._id)} className="text-xs text-accent-dark hover:underline">
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'jobs' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Lavozim</th>
                <th className="px-4 py-3 font-medium">Kompaniya</th>
                <th className="px-4 py-3 font-medium">Joylagan</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id} className="border-t border-line">
                  <td className="px-4 py-3">{j.title}</td>
                  <td className="px-4 py-3 text-muted">{j.company}</td>
                  <td className="px-4 py-3 text-muted">{j.postedBy?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${j.isActive ? 'bg-primary-light text-primary-dark' : 'bg-accent-light text-accent-dark'}`}>
                      {j.isActive ? 'Faol' : "O'chirilgan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleJob(j._id)} className="text-xs text-primary hover:underline">
                      {j.isActive ? "Yashirish" : 'Faollashtirish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
