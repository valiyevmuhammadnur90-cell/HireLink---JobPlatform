import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-line">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          to="/home"
          className="font-display text-lg font-semibold text-ink tracking-tight"
        >
          Hire<span className="text-accent">Link</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink/80">
          <Link to="/jobs" className="hover:text-primary transition-colors">
            Vakansiyalar
          </Link>
          {user?.role === "jobseeker" && (
            <>
              <Link
                to="/saved-jobs"
                className="hover:text-primary transition-colors"
              >
                Saqlanganlar
              </Link>
              <Link
                to="/my-applications"
                className="hover:text-primary transition-colors"
              >
                Arizalarim
              </Link>
            </>
          )}
          {(user?.role === "employer" || user?.role === "admin") && (
            <>
              <Link
                to="/jobs/create"
                className="hover:text-primary transition-colors"
              >
                Vakansiya joylash
              </Link>
              <Link
                to="/my-listings"
                className="hover:text-primary transition-colors"
              >
                Mening vakansiyalarim
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-primary transition-colors">
              Admin panel
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm font-medium text-ink hover:text-primary transition-colors"
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="btn-outline !py-1.5 !px-3 text-xs"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline !py-1.5 !px-3 text-xs">
                Kirish
              </Link>
              <Link
                to="/register"
                className="btn-primary !py-1.5 !px-3 text-xs"
              >
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
