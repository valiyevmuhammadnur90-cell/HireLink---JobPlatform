import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const typeLabels = {
  "full-time": "To'liq stavka",
  "part-time": "Qisman stavka",
  contract: "Shartnoma",
  internship: "Amaliyot",
  remote: "Masofaviy",
};
const expLabels = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
  any: "Istalgan",
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState([]);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [headerRef, headerVisible] = useReveal();
  const [bodyRef, bodyVisible] = useReveal();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        console.log(err);
        navigate("/404");
      }
    };

    fetchJob();
  }, [id, navigate]);

  useEffect(() => {
    if (user?.savedJobs) setSaved(user.savedJobs.includes(id));
  }, [user, id]);

  const toggleSave = async () => {
    if (!user) return navigate("/login");
    const { data } = await api.put(`/users/saved-jobs/${id}`);
    setSaved(data.saved);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      if (resumeFile) formData.append("resume", resumeFile);
      await api.post(`/applications/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({
        type: "success",
        message: "Arizangiz muvaffaqiyatli yuborildi! 🎉",
      });
      setApplyOpen(false);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Xatolik yuz berdi",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!job)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #E4E1D8",
              borderTopColor: "#0E5C4F",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#6B7178", fontSize: 14 }}>Yuklanmoqda...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  const salary =
    job.salaryMin || job.salaryMax
      ? `${job.salaryMin?.toLocaleString() || 0} – ${job.salaryMax?.toLocaleString() || 0} ${job.currency}`
      : "Kelishilgan holda";

  return (
    <div style={{ minHeight: "100vh", background: "#F6F5F1" }}>
      {/* ── Hero banner ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0E5C4F 0%, #0A453B 60%, #083830 100%)",
          padding: "48px 20px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "30%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        <div
          ref={headerRef}
          style={{
            maxWidth: 780,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Link
            to="/jobs"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            ← Orqaga
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                opacity: headerVisible ? 1 : 0,
                transform: headerVisible ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {["🏢", "🏬", "🏨", "🏪", "🏪"].at(
                    Math.floor(Math.random() * 5),
                  )}
                </div>
                <div>
                  <h1
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    <span>{job.title}</span>
                  </h1>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      margin: "4px 0 0",
                      fontSize: 15,
                    }}
                  >
                    <span>{job.company}</span> · <span>{job.location}</span>
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                {[
                  typeLabels[job.type] || job.type,
                  expLabels[job.experienceLevel] || job.experienceLevel,
                  job.category,
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Save button */}
            {user?.role === "jobseeker" && (
              <button
                onClick={toggleSave}
                style={{
                  opacity: headerVisible ? 1 : 0,
                  transform: headerVisible ? "scale(1)" : "scale(0.9)",
                  transition:
                    "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
                  background: saved ? "#E0622B" : "rgba(255,255,255,0.12)",
                  border: `1px solid ${saved ? "#E0622B" : "rgba(255,255,255,0.25)"}`,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {saved ? "❤️ Saqlangan" : "🤍 Saqlash"}
              </button>
            )}
          </div>

          {/* Salary banner */}
          <div
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(224,98,43,0.2)",
              border: "1px solid rgba(224,98,43,0.4)",
              borderRadius: 10,
              padding: "8px 18px",
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
            }}
          >
            <span style={{ color: "#f5a06e", fontSize: 16 }}>💰</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              <span>{salary}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          maxWidth: 780,
          margin: "-32px auto 0",
          padding: "0 20px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          ref={bodyRef}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Left: details */}
          <div
            style={{
              opacity: bodyVisible ? 1 : 0,
              transform: bodyVisible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            }}
          >
            {/* Description */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #E4E1D8",
                padding: 28,
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  fontSize: 17,
                  margin: "0 0 14px",
                }}
              >
                📋 Tavsif
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                  margin: 0,
                }}
              >
                <span>{job.description}</span>
              </p>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #E4E1D8",
                  padding: 28,
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: 17,
                    margin: "0 0 14px",
                  }}
                >
                  🛠️ Ko'nikmalar
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "#E4F0EC",
                        color: "#0E5C4F",
                        fontSize: 13,
                        padding: "5px 14px",
                        borderRadius: 6,
                        fontWeight: 500,
                      }}
                    >
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #E4E1D8",
                  padding: 28,
                }}
              >
                <h2
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: 17,
                    margin: "0 0 14px",
                  }}
                >
                  ✅ Talablar
                </h2>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {job.requirements.map((r, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 14,
                        color: "#374151",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          color: "#0E5C4F",
                          fontWeight: 700,
                          marginTop: 1,
                        }}
                      >
                        →
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: action sidebar */}
          <div
            style={{
              opacity: bodyVisible ? 1 : 0,
              transform: bodyVisible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s",
            }}
          >
            {/* Contact card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #E4E1D8",
                padding: 24,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  margin: "0 0 16px",
                  color: "#15191E",
                }}
              >
                Aloqa
              </h3>

              {job.contactPhone ? (
                <a
                  href={`tel:${job.contactPhone}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "linear-gradient(135deg, #E4F0EC, #f0f8f5)",
                    border: "1px solid rgba(14,92,79,0.15)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    textDecoration: "none",
                    marginBottom: 10,
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "#0E5C4F",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    📞
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#6B7178",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Telefon
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0E5C4F",
                        margin: "2px 0 0",
                      }}
                    >
                      <span>{job.contactPhone}</span>
                    </p>
                  </div>
                </a>
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: "#6B7178",
                    fontStyle: "italic",
                  }}
                >
                  Telefon ko'rsatilmagan
                </p>
              )}

              {job.contactEmail && (
                <a
                  href={`mailto:${job.contactEmail}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#F6F5F1",
                    border: "1px solid #E4E1D8",
                    borderRadius: 10,
                    padding: "12px 16px",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "#E0622B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    ✉️
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#6B7178",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Email
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        margin: "2px 0 0",
                      }}
                    >
                      <span>{job.contactEmail}</span>
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Action buttons */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #E4E1D8",
                padding: 24,
              }}
            >
              {status.message && (
                <div
                  style={{
                    background:
                      status.type === "success" ? "#E4F0EC" : "#FCE8DC",
                    border: `1px solid ${status.type === "success" ? "#0E5C4F" : "#E0622B"}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 14,
                    fontSize: 13,
                    color: status.type === "success" ? "#0E5C4F" : "#C04F1F",
                  }}
                >
                  <span>{status.message}</span>
                </div>
              )}

              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #0E5C4F, #0A453B)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(14,92,79,0.3)",
                  }}
                >
                  Kirish → Ariza topshirish
                </button>
              ) : user.role !== "jobseeker" ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "#6B7178",
                    textAlign: "center",
                  }}
                >
                  Faqat ish izlovchilar ariza topshira oladi
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {!applyOpen ? (
                    <>
                      <button
                        onClick={() => {
                          setApplyOpen(true);
                          setChatOpen(false);
                        }}
                        style={{
                          width: "100%",
                          background:
                            "linear-gradient(135deg, #0E5C4F, #0A453B)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "13px",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(14,92,79,0.25)",
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(14,92,79,0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 16px rgba(14,92,79,0.25)";
                        }}
                      >
                        📄 Ariza topshirish
                      </button>

                      <button
                        onClick={() => {
                          setChatOpen(true);
                          setApplyOpen(false);
                        }}
                        style={{
                          width: "100%",
                          background: "#fff",
                          color: "#0E5C4F",
                          border: "2px solid #0E5C4F",
                          borderRadius: 10,
                          padding: "12px",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#E4F0EC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                        }}
                      >
                        💬 Ish beruvchi bilan yozish
                      </button>
                    </>
                  ) : (
                    /* Apply form */
                    <form
                      onSubmit={handleApply}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6B7178",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        CV (PDF/DOC)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ fontSize: 13, color: "#374151" }}
                        onChange={(e) => setResumeFile(e.target.files[0])}
                      />
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6B7178",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Xat (ixtiyoriy)
                      </label>
                      <textarea
                        rows={3}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          border: "1px solid #E4E1D8",
                          padding: "10px 12px",
                          fontSize: 13,
                          outline: "none",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="O'zingiz haqingizda..."
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            flex: 2,
                            background: "#0E5C4F",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "11px",
                            fontWeight: 600,
                            cursor: submitting ? "not-allowed" : "pointer",
                            fontSize: 14,
                          }}
                        >
                          {submitting ? "Yuborilmoqda..." : "✉️ Yuborish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setApplyOpen(false)}
                          style={{
                            flex: 1,
                            background: "#fff",
                            color: "#374151",
                            border: "1px solid #E4E1D8",
                            borderRadius: 8,
                            padding: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 14,
                          }}
                        >
                          Bekor
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Job meta */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #E4E1D8",
                padding: 20,
                marginTop: 16,
              }}
            >
              {[
                {
                  label: "Joylangan",
                  val: new Date(job.createdAt).toLocaleDateString("uz-UZ"),
                },
                { label: "Ko'rishlar", val: job.viewsCount },
                { label: "Arizalar", val: job.applicationsCount },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 10,
                    marginBottom: 10,
                    borderBottom: "1px solid #F3F2EE",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7178" }}>
                    {m.label}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#15191E" }}
                  >
                    {m.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Chat modal ── */}
      {chatOpen && user && (
        <ChatModal
          jobId={id}
          employerId={job.postedBy?._id || job.postedBy}
          currentUser={user}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Chat Modal ── */
function ChatModal({ jobId, employerId, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [lastTs, setLastTs] = useState(0);
  const bottomRef = useRef(null);
  const otherUserId =
    currentUser.role === "jobseeker" ? employerId : currentUser._id;

  // Dastlabki suhbatni yuklash
  useEffect(() => {
    api
      .get(`/messages/${jobId}/${otherUserId}`)
      .then(({ data }) => {
        setMessages(data.messages || []);
        if (data.messages?.length)
          setLastTs(
            new Date(
              data.messages[data.messages.length - 1].createdAt,
            ).getTime(),
          );
      })
      .catch(() => {});
  }, [jobId, otherUserId]);

  // Har 3 soniyada yangi xabarlarni polling
  const poll = useCallback(async () => {
    if (!lastTs) return;
    try {
      const { data } = await api.get(
        `/messages/${jobId}/${otherUserId}/poll?after=${lastTs}`,
      );
      if (data.length) {
        setMessages((prev) => [...prev, ...data]);
        setLastTs(new Date(data[data.length - 1].createdAt).getTime());
      }
    } catch (_) {}
  }, [jobId, otherUserId, lastTs]);

  useEffect(() => {
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [poll]);

  // Eng pastga scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${jobId}/${otherUserId}`, {
        text,
      });
      setMessages((prev) => [...prev, data]);
      setLastTs(new Date(data.createdAt).getTime());
      setText("");
    } catch (_) {
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: 380,
          height: 520,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E4E1D8",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0E5C4F, #0A453B)",
            borderRadius: "16px 16px 0 0",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              💬
            </div>
            <div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  margin: 0,
                  fontSize: 14,
                }}
              >
                Ish beruvchi bilan chat
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#4ade80",
                    animation: "pulse 2s infinite",
                  }}
                />
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                    fontSize: 12,
                  }}
                >
                  Online
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 16px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                margin: "auto",
                color: "#6B7178",
                fontSize: 13,
              }}
            >
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>👋</p>
              Salom! Ish beruvchi bilan muloqotni boshlang
            </div>
          )}
          {messages.map((m, i) => {
            const isMe =
              m.sender?._id === currentUser._id || m.sender === currentUser._id;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    background: isMe
                      ? "linear-gradient(135deg, #0E5C4F, #0A453B)"
                      : "#F6F5F1",
                    color: isMe ? "#fff" : "#15191E",
                    borderRadius: isMe
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: isMe
                      ? "0 2px 8px rgba(14,92,79,0.2)"
                      : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <p style={{ margin: "0 0 4px" }}>{m.text}</p>
                  <p style={{ margin: 0, fontSize: 10, opacity: 0.6 }}>
                    {new Date(m.createdAt).toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #E4E1D8",
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Xabar yozing... (Enter — yuborish)"
            style={{
              flex: 1,
              borderRadius: 10,
              border: "1px solid #E4E1D8",
              padding: "10px 14px",
              fontSize: 13,
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.4,
              maxHeight: 80,
              overflowY: "auto",
            }}
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "none",
              background: text.trim()
                ? "linear-gradient(135deg, #0E5C4F, #0A453B)"
                : "#E4E1D8",
              color: "#fff",
              cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
          >
            {sending ? "..." : "↑"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>
    </div>
  );
}
