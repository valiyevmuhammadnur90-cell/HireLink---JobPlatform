import { useState } from 'react';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const submit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Lavozim, kompaniya yoki ko'nikma bo'yicha qidirish..."
        className="input flex-1 !text-ink placeholder:!text-muted"
      />
      <button type="submit" className="btn-accent">Qidirish</button>
    </form>
  );
}