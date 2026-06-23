import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="font-display text-5xl font-semibold text-primary">404</p>
      <p className="text-muted mt-2 mb-6">Sahifa topilmadi</p>
      <Link to="/" className="btn-primary">Bosh sahifaga qaytish</Link>
    </div>
  );
}
