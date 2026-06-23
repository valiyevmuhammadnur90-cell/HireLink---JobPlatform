import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import api from '../api/axios';

function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return offset * speed;
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 18;
    const y = ((e.clientY - top) / height - 0.5) * -18;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03,1.03,1.03)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: 'transform 0.25s ease', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

function FloatingOrb({ size, top, left, delay = 0, opacity = 0.12 }) {
  return (
    <div
      style={{
        position: 'absolute', width: size, height: size, top, left,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
        opacity,
        animation: `floatOrb 6s ease-in-out ${delay}s infinite alternate`,
        pointerEvents: 'none',
      }}
    />
  );
}

function CountUp({ target }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(start);
    }, 16);
    return () => clearInterval(t);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0 });
  const parallaxY = useParallax(0.35);
  const [heroRef, heroVisible] = useReveal();
  const [secRef, secVisible] = useReveal();

  useEffect(() => {
    api.get('/jobs?limit=6&sort=-createdAt').then(({ data }) => {
      setRecentJobs(data.jobs);
      setStats({ totalJobs: data.total });
    }).catch(() => {});
  }, []);

  const handleSearch = (value) => {
    navigate(`/jobs${value ? `?search=${encodeURIComponent(value)}` : ''}`);
  };

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── Hero ── */}
      <section
        style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0E5C4F 0%, #0A453B 60%, #083830 100%)' }}
        className="text-white"
      >
        {/* Parallax layer */}
        <div style={{ transform: `translateY(${parallaxY}px)`, transition: 'transform 0.05s linear', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <FloatingOrb size="420px" top="-80px"  left="-60px"  delay={0}   opacity={0.08} />
          <FloatingOrb size="300px" top="40px"   left="65%"    delay={1.5} opacity={0.10} />
          <FloatingOrb size="200px" top="200px"  left="40%"    delay={3}   opacity={0.06} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div ref={heroRef} className="max-w-6xl mx-auto px-5 py-24 text-center" style={{ position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(224,98,43,0.2)', border: '1px solid rgba(224,98,43,0.4)',
            borderRadius: '999px', padding: '6px 16px', marginBottom: '20px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E0622B', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span className="text-accent font-medium text-sm tracking-wide uppercase">
              <CountUp target={stats.totalJobs} />+ faol vakansiya
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-2xl mx-auto" style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          }}>
            Kasbingizga mos ishni{' '}
            <span style={{ background: 'linear-gradient(90deg, #E0622B, #f5a06e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              shu yerdan
            </span>{' '}
            toping
          </h1>

          {/* Subtext */}
          <p className="text-white/75 mt-5 max-w-lg mx-auto" style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
          }}>
            Minglab kompaniyalar, real vaqtdagi vakansiyalar va bitta arizada ko'plab ishga murojaat qilish imkoniyati.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto bg-white rounded-lg p-1.5" style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
            transition: 'opacity 0.8s ease 0.45s, transform 0.8s ease 0.45s',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center gap-10 flex-wrap" style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s',
          }}>
            {[
              { label: 'Kompaniyalar', value: '500+' },
              { label: 'Muvaffaqiyatli ishga joylashdilar', value: '2,400+' },
              { label: 'Kategoriyalar', value: '40+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-semibold text-white">{s.value}</p>
                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#F6F5F1" />
          </svg>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: '🔍', title: 'Aqlli qidiruv', desc: "Kalit so'zlar, maosh, joylashuv bo'yicha bir zumda filtrlang" },
            { icon: '📄', title: 'Oson ariza', desc: "CV yuklang va bir marta bosish bilan ko'plab vakansiyalarga murojaat qiling" },
            { icon: '📊', title: 'Real vaqt holati', desc: "Arizangizning holati yangilanganda darhol xabar oling" },
          ].map((f, i) => (
            <TiltCard key={f.title} className="card p-6">
              <div style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.7s ease ${0.1 + i * 0.15}s, transform 0.7s ease ${0.1 + i * 0.15}s`,
              }}>
                <span style={{ fontSize: 32 }}>{f.icon}</span>
                <h3 className="font-display font-semibold mt-3 mb-1">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── Recent jobs ── */}
      <section ref={secRef} className="max-w-6xl mx-auto px-5 pb-20">
        <div className="flex items-center justify-between mb-6" style={{
          opacity: secVisible ? 1 : 0,
          transform: secVisible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <h2 className="font-display text-xl font-semibold">So'nggi vakansiyalar</h2>
          <button onClick={() => navigate('/jobs')} className="text-sm text-primary font-medium hover:underline">
            Barchasini ko'rish →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentJobs.map((job, i) => (
            <div key={job._id} style={{
              opacity: secVisible ? 1 : 0,
              transform: secVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
              transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
            }}>
              <TiltCard>
                <JobCard job={job} />
              </TiltCard>
            </div>
          ))}
          {recentJobs.length === 0 && (
            <p className="text-muted col-span-full text-center py-10">Hozircha vakansiyalar yo'q</p>
          )}
        </div>
      </section>

      <style>{`
        @keyframes floatOrb {
          0%   { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-30px) scale(1.08); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}