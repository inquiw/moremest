import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Heart, ArrowUpDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import properties from '../data/properties.json';

const PropertyCard = ({ property }) => (
  <div className="group cursor-pointer bg-gradient-to-b from-[#f5ebe0] via-[#fef9f3] to-white rounded-2xl p-2.5 shadow-lg shadow-black/20">
    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
      <img
        src={property.img}
        alt={property.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-xs font-body font-semibold text-white">
        {property.type}
      </span>
      <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors">
        <Heart size={18} className="text-white" strokeWidth={1.5} />
      </button>
    </div>
    <div className="px-1 pb-1">
      <h3 className="text-ocean-900 font-display font-semibold text-lg leading-snug mb-1 group-hover:text-ocean-700 transition-colors">
        {property.name}
      </h3>
      <p className="text-gray-400 text-base font-body mb-1.5">{property.location}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="text-ocean-900 text-base font-body font-medium">{property.rating}</span>
          <span className="text-gray-400 text-base font-body">({property.reviews})</span>
        </div>
        <p className="text-ocean-900 font-display font-bold text-lg">
          {property.price.toLocaleString('ru-RU')} ₽<span className="text-gray-400 font-normal text-base"> / ночь</span>
        </p>
      </div>
    </div>
  </div>
);

const SORT_OPTIONS = [
  { key: 'popular', label: 'По популярности' },
  { key: 'rating', label: 'По оценке' },
  { key: 'priceAsc', label: 'По стоимости: дешёво' },
  { key: 'priceDesc', label: 'По стоимости: дорого' },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const city = searchParams.get('city') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '0';

  // Parse dates
  const initialStartDate = checkIn ? new Date(checkIn + 'T00:00:00') : null;
  const initialEndDate = checkOut ? new Date(checkOut + 'T00:00:00') : null;

  // Parse guests
  const totalGuests = parseInt(guestsParam, 10) || 0;
  const initialAdults = totalGuests > 0 ? totalGuests : 0;

  const filtered = useMemo(() => {
    let result = properties;

    // Filter by city
    if (city) {
      result = result.filter(p =>
        p.location.toLowerCase() === city.toLowerCase() ||
        p.region.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Filter by guests capacity
    if (totalGuests > 0) {
      result = result.filter(p => p.guests >= totalGuests);
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'priceAsc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return sorted;
  }, [city, totalGuests, sortBy]);

  const cityLabel = city || 'Все города';
  const sortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label || 'Сортировка';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1f] via-[#111114] to-[#0a0a0c] antialiased">
      <Header />

      {/* Search island */}
      <div className="pt-24 sm:pt-28 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <SearchBar
            initialCity={city}
            initialStartDate={initialStartDate}
            initialEndDate={initialEndDate}
            initialAdults={initialAdults}
          />
        </div>
      </div>

      {/* Results header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-body font-semibold text-white">
          {cityLabel}
          <span className="text-white/40 font-normal"> — {filtered.length} вариант{filtered.length === 1 ? '' : filtered.length > 1 && filtered.length < 5 ? 'а' : 'ов'} жилья</span>
        </h1>

        {/* Sort button */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <ArrowUpDown size={16} className="text-white/60" />
            <span className="text-sm font-body text-white/60 hidden sm:inline">{sortLabel}</span>
            <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 overflow-hidden z-50"
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-body transition-colors duration-200 ${
                      sortBy === opt.key ? 'text-ocean-400 bg-ocean-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Property grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-lg font-body text-white/40">Жильё не найдено</p>
            <p className="text-sm font-body text-white/25 mt-1">Попробуйте другой город</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
