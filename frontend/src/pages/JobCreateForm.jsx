import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ── 3D Tilt wrapper ── */
function TiltBox({ children, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 10;
    const y = ((e.clientY - top) / height - 0.5) * -10;
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={className}
      style={{ transition: 'transform 0.3s ease', willChange: 'transform' }}>
      {children}
    </div>
  );
}

const initial = {
  title: '', company: '', location: '', type: 'full-time',
  category: 'general', experienceLevel: 'any',
  salaryMin: '', salaryMax: '', currency: 'USD',
  description: '', skills: '', requirements: '',
  contactPhone: '', contactEmail: '',
};

const steps = [
  { label: 'Asosiy', icon: '📋' },
  { label: 'Tafsilot', icon: '📝' },
  { label: 'Aloqa', icon: '📞' },
];

export default function JobCreateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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
      setError(err.response?.data?.message || 'Vakansiya yaratishda xatolik');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-primary outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(14,92,79,0.12)]';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f5f1 0%, #e4f0ec 50%, #f6f5f1 100%)',
      padding: '40px 20px',
    }}>
      {/* Floating orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[
          { w: 300, top: '10%', left: '-5%', color: 'rgba(14,92,79,0.06)', delay: '0s' },
          { w: 200, top: '60%', left: '90%', color: 'rgba(224,98,43,0.05)', delay: '2s' },
          { w: 150, top: '40%', left: '50%', color: 'rgba(14,92,79,0.04)', delay: '4s' },
        ].map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: o.w, height: o.w,
            top: o.top, left: o.left, borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            animation: `floatOrb 7s ease-in-out ${o.delay} infinite alternate`,
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(14,92,79,0.1)', border: '1px solid rgba(14,92,79,0.2)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 16 }}>💼</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0E5C4F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Yangi vakansiya
            </span>
          </div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 28, fontWeight: 700, color: '#15191E', margin: 0 }}>
            Vakansiya joylash
          </h1>
          <p style={{ color: '#6B7178', fontSize: 14, marginTop: 6 }}>
            Eng yaxshi nomzodlarni topish uchun to'ldiring
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                onClick={() => i < step && setStep(i)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  cursor: i < step ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: i === step ? '#0E5C4F' : i < step ? '#E4F0EC' : '#fff',
                  border: i === step ? '2px solid #0E5C4F' : i < step ? '2px solid #0E5C4F' : '2px solid #E4E1D8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < step ? 18 : 20,
                  transition: 'all 0.3s ease',
                  boxShadow: i === step ? '0 4px 16px rgba(14,92,79,0.25)' : 'none',
                  transform: i === step ? 'scale(1.1)' : 'scale(1)',
                }}>
                  {i < step ? '✓' : s.icon}
                </div>
                <span style={{ fontSize: 11, color: i === step ? '#0E5C4F' : '#6B7178', fontWeight: i === step ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 80, height: 2, marginBottom: 20,
                  background: i < step ? '#0E5C4F' : '#E4E1D8',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <TiltBox>
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #E4E1D8',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden',
          }}>
            {/* Card header strip */}
            <div style={{
              height: 4,
              background: 'linear-gradient(90deg, #0E5C4F, #E0622B)',
            }} />

            <form onSubmit={handleSubmit} style={{ padding: 32 }}>
              {error && (
                <div style={{
                  background: '#FCE8DC', border: '1px solid #E0622B', borderRadius: 8,
                  padding: '12px 16px', marginBottom: 20, color: '#C04F1F', fontSize: 14,
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* ── Step 0: Asosiy ── */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Lavozim nomi *
                    </label>
                    <input required className={inputCls} value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                      placeholder="Masalan: Senior React Developer" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Kompaniya *
                      </label>
                      <input required className={inputCls} value={form.company}
                        onChange={(e) => set('company', e.target.value)} placeholder="Kompaniya nomi" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Manzil *
                      </label>
                      <input required className={inputCls} value={form.location}
                        onChange={(e) => set('location', e.target.value)} placeholder="Toshkent, O'zbekiston" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Ish turi
                      </label>
                      <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
                        <option value="full-time">To'liq stavka</option>
                        <option value="part-time">Qisman stavka</option>
                        <option value="contract">Shartnoma</option>
                        <option value="internship">Amaliyot</option>
                        <option value="remote">Masofaviy</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Tajriba
                      </label>
                      <select className={inputCls} value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
                        <option value="any">Istalgan</option>
                        <option value="junior">Junior</option>
                        <option value="middle">Middle</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Kategoriya
                      </label>
                      <input className={inputCls} value={form.category}
                        onChange={(e) => set('category', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Min. maosh
                      </label>
                      <input type="number" className={inputCls} value={form.salaryMin}
                        onChange={(e) => set('salaryMin', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Max. maosh
                      </label>
                      <input type="number" className={inputCls} value={form.salaryMax}
                        onChange={(e) => set('salaryMax', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Valyuta
                      </label>
                      <input className={inputCls} value={form.currency}
                        onChange={(e) => set('currency', e.target.value)} />
                    </div>
                  </div>

                  <button type="button" onClick={() => setStep(1)}
                    disabled={!form.title || !form.company || !form.location}
                    style={{
                      background: 'linear-gradient(135deg, #0E5C4F, #0A453B)',
                      color: '#fff', border: 'none', borderRadius: 10,
                      padding: '14px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(14,92,79,0.3)',
                      transition: 'all 0.2s ease', opacity: (!form.title || !form.company || !form.location) ? 0.5 : 1,
                    }}>
                    Keyingi → Tafsilotlar
                  </button>
                </div>
              )}

              {/* ── Step 1: Tafsilot ── */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Tavsif *
                    </label>
                    <textarea required rows={5} className={inputCls} value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Vakansiya haqida batafsil ma'lumot..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Ko'nikmalar (vergul bilan)
                    </label>
                    <input className={inputCls} value={form.skills}
                      onChange={(e) => set('skills', e.target.value)}
                      placeholder="React, Node.js, MongoDB, TypeScript" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Talablar (har biri yangi qatordan)
                    </label>
                    <textarea rows={4} className={inputCls} value={form.requirements}
                      onChange={(e) => set('requirements', e.target.value)}
                      placeholder={"3+ yil tajriba\nIngliz tili B2\nJamoa bilan ishlash ko'nikmasi"} />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setStep(0)}
                      style={{
                        flex: 1, background: '#fff', color: '#15191E',
                        border: '1px solid #E4E1D8', borderRadius: 10,
                        padding: '14px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                      }}>
                      ← Orqaga
                    </button>
                    <button type="button" onClick={() => setStep(2)}
                      disabled={!form.description}
                      style={{
                        flex: 2,
                        background: 'linear-gradient(135deg, #0E5C4F, #0A453B)',
                        color: '#fff', border: 'none', borderRadius: 10,
                        padding: '14px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(14,92,79,0.3)',
                        opacity: !form.description ? 0.5 : 1,
                      }}>
                      Keyingi → Aloqa
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Aloqa ── */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #E4F0EC, #f0f8f5)',
                    border: '1px solid rgba(14,92,79,0.15)',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 28 }}>📞</span>
                    <div>
                      <p style={{ fontWeight: 600, color: '#0E5C4F', fontSize: 14, margin: 0 }}>
                        Aloqa ma'lumotlari
                      </p>
                      <p style={{ color: '#6B7178', fontSize: 13, margin: '4px 0 0' }}>
                        Ish izlovchilar siz bilan to'g'ridan-to'g'ri bog'lana oladi
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      📱 Telefon raqam
                    </label>
                    <input type="tel" className={inputCls} value={form.contactPhone}
                      onChange={(e) => set('contactPhone', e.target.value)}
                      placeholder="+998 90 123 45 67" />
                    <p style={{ fontSize: 12, color: '#6B7178', marginTop: 4 }}>
                      Ish izlovchilar bu raqamni ko'ra oladi
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      ✉️ Aloqa email (ixtiyoriy)
                    </label>
                    <input type="email" className={inputCls} value={form.contactEmail}
                      onChange={(e) => set('contactEmail', e.target.value)}
                      placeholder="hr@kompaniya.uz" />
                  </div>

                  {/* Preview */}
                  <div style={{
                    background: '#F6F5F1', borderRadius: 12,
                    border: '1px dashed #C8C5BC', padding: 20,
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                      Vakansiya ko'rinishi
                    </p>
                    <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18, color: '#15191E', margin: '0 0 4px' }}>
                      {form.title || 'Lavozim nomi'}
                    </p>
                    <p style={{ color: '#6B7178', fontSize: 14, margin: '0 0 8px' }}>
                      {form.company || 'Kompaniya'} · {form.location || 'Manzil'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: '#E4F0EC', color: '#0E5C4F', fontSize: 12, padding: '3px 10px', borderRadius: 4, fontWeight: 500 }}>
                        {form.type}
                      </span>
                      {form.salaryMin && (
                        <span style={{ background: '#E4F0EC', color: '#0E5C4F', fontSize: 12, padding: '3px 10px', borderRadius: 4, fontWeight: 500 }}>
                          {Number(form.salaryMin).toLocaleString()} - {Number(form.salaryMax).toLocaleString()} {form.currency}
                        </span>
                      )}
                    </div>
                    {form.contactPhone && (
                      <p style={{ fontSize: 13, color: '#0E5C4F', marginTop: 10, fontWeight: 500 }}>
                        📞 {form.contactPhone}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setStep(1)}
                      style={{
                        flex: 1, background: '#fff', color: '#15191E',
                        border: '1px solid #E4E1D8', borderRadius: 10,
                        padding: '14px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                      }}>
                      ← Orqaga
                    </button>
                    <button type="submit" disabled={loading}
                      style={{
                        flex: 2,
                        background: loading ? '#ccc' : 'linear-gradient(135deg, #E0622B, #C04F1F)',
                        color: '#fff', border: 'none', borderRadius: 10,
                        padding: '14px 24px', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 4px 16px rgba(224,98,43,0.35)',
                        transition: 'all 0.2s ease',
                      }}>
                      {loading ? 'Joylanmoqda...' : '🚀 Vakansiyani joylash'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </TiltBox>
      </div>

      <style>{`
        @keyframes floatOrb {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.06); }
        }
      `}</style>
    </div>
  );
}
