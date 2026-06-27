import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message || "Tizimga kirishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-semibold text-center mb-1">
        Tizimga kirish
      </h1>
      <p className="text-muted text-sm text-center mb-8">
        Hisobingizga kiring va ish izlashni davom ettiring
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <p className="text-sm text-accent-dark bg-accent-light rounded px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Parol</label>
          <div className="flex">
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>

        <p className="text-sm text-center text-muted">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-primary font-medium">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </form>
    </div>
  );
}
