import { useState, useEffect, useRef } from 'react';

export interface CountryResult {
  id: string;
  name: string;
  center: [number, number];
}

interface MapSearchProps {
  onSelect: (center: [number, number]) => void;
}

export function MapSearch({ onSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<CountryResult[]>([]);
  const [suggestions, setSuggestions] = useState<CountryResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/country_centroids.json')
      .then((r) => r.json())
      .then((data) => setCountries(data))
      .catch((e) => console.error('Failed to load country centroids', e));
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = countries.filter((c) => c.name.toLowerCase().includes(q));
    setSuggestions(filtered.slice(0, 5));
    setIsOpen(true);
  }, [query, countries]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="map-search" ref={containerRef}>
      <div className="map-search__input-wrapper">
        <span className="map-search__icon">🔍</span>
        <input
          type="text"
          className="map-search__input"
          placeholder="Search country..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query) setIsOpen(true); }}
        />
        {query && (
          <button className="map-search__clear" onClick={() => { setQuery(''); setSuggestions([]); }}>
            ✕
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="map-search__dropdown">
          {suggestions.map((c) => (
            <li
              key={c.id}
              className="map-search__item"
              onClick={() => {
                onSelect(c.center);
                setQuery(c.name);
                setIsOpen(false);
              }}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
