import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const { data } = await api.get("/messages");
        const total = data.reduce((sum, c) => sum + (c.unread || 0), 0);
        setUnread(total);
      } catch (_) {}
    };
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#fff",
        borderBottom: "1px solid #E4E1D8",
      }}
    >
      <nav
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            fontFamily: '"Space Grotesk",sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: "#15191E",
          }}
        >
          Topish<span style={{ color: "#E0622B" }}>Job</span>
        </Link>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(21,25,30,0.75)",
          }}
        >
          <NavLink to="/jobs">Vakansiyalar</NavLink>

          {user?.role === "jobseeker" && (
            <>
              <NavLink to="/saved-jobs">Saqlanganlar</NavLink>
              <NavLink to="/my-applications">Arizalarim</NavLink>
            </>
          )}

          {(user?.role === "employer" || user?.role === "admin") && (
            <>
              <NavLink to="/jobs/create">Joylash</NavLink>
              <NavLink to="/my-listings">Vakansiyalarim</NavLink>
            </>
          )}

          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}

          {/* Messages */}
          {user && (
            <Link
              to="/messages"
              style={{
                position: "relative",
                textDecoration: "none",
                color: "rgba(21,25,30,0.75)",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0E5C4F")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(21,25,30,0.75)")
              }
            >
              Xabarlar
              {unread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -12,
                    background: "#E0622B",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 999,
                    minWidth: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    animation: "pulse 2s infinite",
                  }}
                >
                  {unread}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <Link
                to="/profile"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#15191E",
                  textDecoration: "none",
                  background: "#F6F5F1",
                  border: "1px solid #E4E1D8",
                  borderRadius: 8,
                  padding: "6px 14px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#0E5C4F")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#E4E1D8")
                }
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6B7178",
                  background: "none",
                  border: "1px solid #E4E1D8",
                  borderRadius: 8,
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#E0622B";
                  e.currentTarget.style.color = "#E0622B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E4E1D8";
                  e.currentTarget.style.color = "#6B7178";
                }}
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#15191E",
                  textDecoration: "none",
                  background: "#fff",
                  border: "1px solid #E4E1D8",
                  borderRadius: 8,
                  padding: "6px 14px",
                }}
              >
                Kirish
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #0E5C4F, #0A453B)",
                  borderRadius: 8,
                  padding: "7px 14px",
                  boxShadow: "0 2px 8px rgba(14,92,79,0.25)",
                }}
              >
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </nav>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.15)} }`}</style>
    </header>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "inherit",
        transition: "color 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#0E5C4F")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(21,25,30,0.75)")
      }
    >
      {children}
    </Link>
  );
}
