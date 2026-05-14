import React, { useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { Input } from './input';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchable?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchable = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 h-11 text-sm text-left bg-white dark:bg-gray-800 border border-border/40 rounded-xl hover:border-primary/50 transition-all shadow-sm"
      >
        <span className={selectedLabel ? 'font-bold' : 'text-muted-foreground'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-border/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {searchable && (
              <div className="p-3 border-b border-border/40">
                <div className="relative">
                  <Input
                    placeholder="Search options..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 text-xs pl-9 bg-slate-50 dark:bg-slate-800 rounded-lg border-none"
                    autoFocus
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto p-1.5">
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-all flex items-center justify-between ${
                      value === opt.value 
                        ? 'bg-primary text-primary-foreground font-black' 
                        : 'hover:bg-primary/5 text-foreground font-bold'
                    }`}
                  >
                    {opt.label}
                    {value === opt.value && <Check size={14} />}
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground font-medium">
                  No options found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
