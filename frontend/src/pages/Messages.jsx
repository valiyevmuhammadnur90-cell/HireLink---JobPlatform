import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function Messages() {
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [lastTs, setLastTs] = useState(0);
  const bottomRef = useRef(null);
  const [listRef, listVisible] = useReveal();

  // Suhbatlar ro'yxati
  useEffect(() => {
    api.get('/messages').then(({ data }) => setConvs(data)).catch(() => {});
  }, []);

  // Faol suhbatni yuklash
  const openConv = async (conv) => {
    setActive(conv);
    const otherId = user.role === 'jobseeker' ? conv.employer._id : conv.jobseeker._id;
    try {
      const { data } = await api.get(`/messages/${conv.job._id}/${otherId}`);
      setMessages(data.messages || []);
      if (data.messages?.length) setLastTs(new Date(data.messages[data.messages.length - 1].createdAt).getTime());
      // O'qilmagan hisobni nolga tushirish
      setConvs((prev) => prev.map((c) => c._id === conv._id ? { ...c, unread: 0 } : c));
    } catch (_) {}
  };

  // Polling
  const poll = useCallback(async () => {
    if (!active || !lastTs) return;
    const otherId = user.role === 'jobseeker' ? active.employer._id : active.jobseeker._id;
    try {
      const { data } = await api.get(`/messages/${active.job._id}/${otherId}/poll?after=${lastTs}`);
      if (data.length) {
        setMessages((prev) => [...prev, ...data]);
        setLastTs(new Date(data[data.length - 1].createdAt).getTime());
      }
    } catch (_) {}
  }, [active, lastTs, user]);

  useEffect(() => {
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending || !active) return;
    setSending(true);
    const otherId = user.role === 'jobseeker' ? active.employer._id : active.jobseeker._id;
    try {
      const { data } = await api.post(`/messages/${active.job._id}/${otherId}`, { text });
      setMessages((prev) => [...prev, data]);
      setLastTs(new Date(data.createdAt).getTime());
      setText('');
    } catch (_) {} finally { setSending(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const otherName = active
    ? user.role === 'jobseeker' ? active.employer?.name : active.jobseeker?.name
    : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F6F5F1' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0E5C4F, #0A453B)', padding: '32px 20px 60px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
            💬 Xabarlar
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 14 }}>
            Ish beruvchilar va ish izlovchilar bilan muloqot
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '-32px auto 0', padding: '0 20px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

          {/* ── Suhbatlar ro'yxati ── */}
          <div ref={listRef} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E4E1D8',
            overflow: 'hidden',
            opacity: listVisible ? 1 : 0,
            transform: listVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E1D8', background: '#FAFAF8' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#15191E' }}>Suhbatlar</p>
            </div>
            {convs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#6B7178', fontSize: 13 }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
                Hali suhbatlar yo'q
              </div>
            ) : (
              convs.map((c, i) => {
                const other = user.role === 'jobseeker' ? c.employer : c.jobseeker;
                const isActive = active?._id === c._id;
                return (
                  <div key={c._id}
                    onClick={() => openConv(c)}
                    style={{
                      padding: '14px 18px', cursor: 'pointer',
                      background: isActive ? '#E4F0EC' : '#fff',
                      borderBottom: '1px solid #F3F2EE',
                      borderLeft: isActive ? '3px solid #0E5C4F' : '3px solid transparent',
                      transition: 'all 0.2s ease',
                      opacity: listVisible ? 1 : 0,
                      transform: listVisible ? 'translateX(0)' : 'translateX(-16px)',
                      transitionDelay: `${i * 0.06}s`,
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F6F5F1'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#15191E', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {other?.name || 'Foydalanuvchi'}
                        </p>
                        <p style={{ margin: '2px 0', fontSize: 12, color: '#6B7178', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {c.job?.title}
                        </p>
                        {c.lastMessage && (
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9CA3AF', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {c.lastMessage.text}
                          </p>
                        )}
                      </div>
                      {c.unread > 0 && (
                        <span style={{
                          background: '#E0622B', color: '#fff', fontSize: 11, fontWeight: 700,
                          borderRadius: 999, minWidth: 20, height: 20, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', padding: '0 6px',
                          flexShrink: 0,
                        }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Chat oynasi ── */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E4E1D8',
            display: 'flex', flexDirection: 'column', minHeight: 520,
            opacity: listVisible ? 1 : 0,
            transform: listVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}>
            {!active ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B7178', gap: 12 }}>
                <div style={{ fontSize: 56 }}>💬</div>
                <p style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 600, fontSize: 16, color: '#15191E', margin: 0 }}>
                  Suhbatni tanlang
                </p>
                <p style={{ fontSize: 13, margin: 0 }}>Chap tarafdan suhbatni bosing</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{
                  padding: '16px 20px', borderBottom: '1px solid #E4E1D8',
                  display: 'flex', alignItems: 'center', gap: 12, background: '#FAFAF8',
                  borderRadius: '14px 14px 0 0',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0E5C4F, #E0622B)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                  }}>
                    {otherName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#15191E' }}>{otherName}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6B7178' }}>
                      {active.job?.title} · {active.job?.company}
                    </p>
                  </div>
                  <Link to={`/jobs/${active.job?._id}`} style={{ marginLeft: 'auto', fontSize: 12, color: '#0E5C4F', textDecoration: 'none', fontWeight: 500 }}>
                    Vakansiyani ko'rish →
                  </Link>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.length === 0 && (
                    <div style={{ margin: 'auto', textAlign: 'center', color: '#6B7178', fontSize: 13 }}>
                      <p style={{ fontSize: 32, margin: '0 0 8px' }}>👋</p>
                      Muloqotni boshlang!
                    </div>
                  )}
                  {messages.map((m, i) => {
                    const isMe = m.sender?._id === user._id || m.sender === user._id;
                    const time = new Date(m.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                        {!isMe && (
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #0E5C4F, #E0622B)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 12, fontWeight: 700,
                          }}>
                            {otherName?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div style={{
                          maxWidth: '65%',
                          background: isMe ? 'linear-gradient(135deg, #0E5C4F, #0A453B)' : '#F6F5F1',
                          color: isMe ? '#fff' : '#15191E',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          padding: '10px 16px', fontSize: 14, lineHeight: 1.5,
                          boxShadow: isMe ? '0 2px 10px rgba(14,92,79,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                        }}>
                          <p style={{ margin: '0 0 4px' }}>{m.text}</p>
                          <p style={{ margin: 0, fontSize: 10, opacity: 0.6, textAlign: 'right' }}>{time}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #E4E1D8', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    rows={1} value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Xabar yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
                    style={{
                      flex: 1, borderRadius: 10, border: '1px solid #E4E1D8',
                      padding: '10px 14px', fontSize: 14, outline: 'none',
                      resize: 'none', fontFamily: 'inherit', maxHeight: 100,
                    }}
                  />
                  <button onClick={send} disabled={sending || !text.trim()} style={{
                    width: 44, height: 44, borderRadius: 10, border: 'none',
                    background: text.trim() ? 'linear-gradient(135deg, #0E5C4F, #0A453B)' : '#E4E1D8',
                    color: '#fff', cursor: text.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s ease',
                    boxShadow: text.trim() ? '0 2px 8px rgba(14,92,79,0.25)' : 'none',
                  }}>
                    {sending ? '⏳' : '↑'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
