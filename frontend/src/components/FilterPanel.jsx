export default function FilterPanel({ filters, setFilters }) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <aside className="card p-5 space-y-5 h-fit">
      <h3 className="font-display font-semibold text-sm">Filtrlash</h3>

      <div>
        <label className="label">Ish turi</label>
        <select className="input" value={filters.type || ''} onChange={(e) => update('type', e.target.value)}>
          <option value="">Barchasi</option>
          <option value="full-time">To'liq stavka</option>
          <option value="part-time">Qisman stavka</option>
          <option value="contract">Shartnoma</option>
          <option value="internship">Amaliyot</option>
          <option value="remote">Masofaviy</option>
        </select>
      </div>

      <div>
        <label className="label">Tajriba darajasi</label>
        <select
          className="input"
          value={filters.experienceLevel || ''}
          onChange={(e) => update('experienceLevel', e.target.value)}
        >
          <option value="">Barchasi</option>
          <option value="junior">Junior</option>
          <option value="middle">Middle</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      <div>
        <label className="label">Manzil</label>
        <input
          type="text"
          className="input"
          placeholder="Masalan: Toshkent"
          value={filters.location || ''}
          onChange={(e) => update('location', e.target.value)}
        />
      </div>

      <div>
        <label className="label">Min. maosh ($)</label>
        <input
          type="number"
          className="input"
          value={filters.salaryMin || ''}
          onChange={(e) => update('salaryMin', e.target.value)}
        />
      </div>

      <button
        className="btn-outline w-full"
        onClick={() => setFilters({})}
        type="button"
      >
        Tozalash
      </button>
    </aside>
  );
}
