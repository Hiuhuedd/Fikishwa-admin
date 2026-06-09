'use client';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 w-4 h-4 text-textMuted pointer-events-none" />
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm border border-border rounded-xl bg-white text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
      {local && (
        <button onClick={() => { setLocal(''); onChange(''); }} className="absolute right-3">
          <X className="w-4 h-4 text-textMuted" />
        </button>
      )}
    </div>
  );
}
