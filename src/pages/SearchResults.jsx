import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ArrowUpDown, ChevronDown, MapPin, ChevronLeft, ChevronRight, Map as MapIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { YMaps, Map as YMap, Placemark, ZoomControl } from 'react-yandex-maps';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabaseClient';
import fallbackProperties from '../data/properties.json';
import { useFavorites } from '../hooks/useFavorites';

const YMAPS_KEY = '08885af9-b66b-41e6-9210-09a83996162a';

const TYPE_LABELS = {
  apartment: 'Квартира', house: 'Дом', mini_hotel: 'Гостиница', hotel: 'Гостиница', large_hotel: 'Отель',
  'Квартира': 'Квартира', 'Дом / Вилла': 'Дом', 'Отель': 'Отель',
  'Гостиница': 'Гостиница', 'Гостевой дом': 'Гостиница', 'Мини-гостиница': 'Гостиница', 'Квартира / Дом': 'Квартира', 'Крупный отель': 'Отель',
};

const PropertyCard = ({ property, onClick, isFavorite, onToggleFavorite }) => {
  const images = property.images && property.images.length > 0 ? property.images : [property.img || '/img/placeholder.jpg'];
  const [photoIdx, setPhotoIdx] = useState(0);
  const total = images.length;

  const goPrev = (e) => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + total) % total); };
  const goNext = (e) => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % total); };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-gradient-to-b from-[#f5ebe0] via-[#fef9f3] to-white rounded-3xl p-2 shadow-xl shadow-black/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40"
    >
      {/* Фото с навигацией */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-2 h-[220px] sm:h-[260px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[photoIdx]}
            src={images[photoIdx]}
            alt={property.name}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Стрелка назад */}
        {total > 1 && photoIdx > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={18} className="text-gray-800" />
          </button>
        )}

        {/* Стрелка вперёд */}
        {total > 1 && photoIdx < total - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={18} className="text-gray-800" />
          </button>
        )}

        {/* Счётчик фото */}
        {total > 1 && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xl text-white text-xs font-body font-medium flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            {photoIdx + 1}/{total}
          </div>
        )}

        {/* Точки-индикаторы */}
        {total > 1 && total <= 7 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === photoIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />
            ))}
          </div>
        )}

        {/* Бейдж типа */}
        <span className="absolute top-2.5 left-2.5 px-3 py-1.5 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-xs font-body font-semibold text-white">
          {TYPE_LABELS[property.type] || property.type}
        </span>

        {/* Кнопка избранное */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite?.(property.id); }}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors"
        >
          <Heart size={18} className={isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white'} strokeWidth={isFavorite ? 0 : 1.5} />
        </button>
      </div>

      {/* Информация */}
      <div className="px-1.5 pb-1.5">
        <h3 className="text-ocean-900 font-display font-semibold text-lg leading-snug mb-1 group-hover:text-ocean-700 transition-colors">
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-gray-400 text-sm font-body mb-1.5">
          <MapPin size={13} className="shrink-0" />
          <span>{property.city || property.location}{property.address ? `, ${property.address}` : ''}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-ocean-900 text-base font-body font-medium">{property.rating || 0}</span>
            <span className="text-gray-400 text-base font-body">({property.reviews || 0})</span>
          </div>
          <p className="text-ocean-900 font-display font-bold text-lg">
            {(property.price || 0).toLocaleString?.('ru-RU') || property.price} ₽<span className="text-gray-400 font-normal text-base"> / ночь</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const SORT_OPTIONS = [
  { key: 'popular', label: 'По популярности' },
  { key: 'rating', label: 'По оценке' },
  { key: 'priceAsc', label: 'По стоимости: дешёво' },
  { key: 'priceDesc', label: 'По стоимости: дорого' },
];

/* ─── Custom dark placemark icon ─── */
const PIN_ICON = '/placeholder-filled-point.png';

/* ─── Yandex Map Component ─── */
const YandexMap = ({ properties: items, onPlacemarkClick }) => {
  const [placemarks, setPlacemarks] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);

  const handleMapLoad = useCallback((ymaps) => {
    if (!items || items.length === 0) return;

    const geocodeAll = async () => {
      const results = [];
      for (const p of items) {
        const addressStr = [p.city, p.address].filter(Boolean).join(', ');
        if (!addressStr) continue;

        try {
          const res = await ymaps.geocode(addressStr, { results: 1 });
          const first = res.geoObjects.get(0);
          if (first) {
            results.push({
              id: p.id,
              coords: first.geometry.getCoordinates(),
              name: p.name,
              price: p.price,
              city: p.city,
              address: p.address,
            });
          }
        } catch {}
      }
      setPlacemarks(results);

      if (results.length > 0) {
        const lats = results.map(r => r.coords[0]);
        const lngs = results.map(r => r.coords[1]);
        setMapBounds([
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ]);
      }
    };

    geocodeAll();
  }, [items]);

  return (
    <YMaps query={{ apikey: YMAPS_KEY, load: 'package.full' }}>
      <YMap
        onLoad={handleMapLoad}
        defaultState={{ center: [44.5611, 38.0814], zoom: 9, controls: ['zoomControl', 'typeSelector'] }}
        state={mapBounds ? { bounds: mapBounds } : undefined}
        options={{ suppressMapOpenBlock: true }}
        width="100%"
        height="100%"
      >
        {placemarks.map((pm) => (
          <Placemark
            key={pm.id}
            geometry={pm.coords}
            properties={{
              balloonContentHeader: pm.name,
              balloonContentBody: `<div style="font-family:DM Sans,sans-serif"><b>${(pm.price || 0).toLocaleString('ru-RU')} ₽/ночь</b><br/>${pm.city || ''}${pm.address ? ', ' + pm.address : ''}</div>`,
              hintContent: `${pm.name} — ${(pm.price || 0).toLocaleString('ru-RU')} ₽/ночь`,
              iconCaption: pm.name,
            }}
            options={{
              iconLayout: 'default#image',
              iconImageHref: PIN_ICON,
              iconImageSize: [36, 36],
              iconImageOffset: [-18, -18],
              iconCaptionMaxWidth: '150',
            }}
            onClick={() => { if (onPlacemarkClick) onPlacemarkClick(pm.id); }}
          />
        ))}
      </YMap>
    </YMaps>
  );
};

/* ─── SearchResults Page ─── */
const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const typeParam = searchParams.get('type') || sessionStorage.getItem('searchTypeFilter') || 'all';
  const [typeFilter, setTypeFilter] = useState(typeParam);
  const sortRef = useRef(null);
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Restore scroll position & filter when returning from property detail
  useEffect(() => {
    if (!loadingProps) {
      const saved = sessionStorage.getItem('searchScrollY');
      if (saved) {
        sessionStorage.removeItem('searchScrollY');
        setTimeout(() => window.scrollTo(0, Number(saved)), 50);
      }
    }
  }, [loadingProps]);

  // Save scroll position & filter before navigating to property detail
  const handlePropertyClick = (id) => {
    sessionStorage.setItem('searchScrollY', String(window.scrollY));
    sessionStorage.setItem('searchTypeFilter', typeFilter);
    navigate(`/property/${id}`);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProps(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setProperties(data);
        } else {
          setProperties(fallbackProperties);
        }
      } catch {
        setProperties(fallbackProperties);
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProperties();
  }, []);

  const city = searchParams.get('city') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '0';
  const petsParam = searchParams.get('pets') || '0';

  const initialStartDate = checkIn ? new Date(checkIn + 'T00:00:00') : null;
  const initialEndDate = checkOut ? new Date(checkOut + 'T00:00:00') : null;
  const totalGuests = parseInt(guestsParam, 10) || 0;
  const hasPets = parseInt(petsParam, 10) > 0;
  const initialAdults = totalGuests > 0 ? totalGuests : 0;

  const TYPE_TABS = [
    { key: 'all', label: 'Все' },
    { key: 'hotel', label: 'Гостиница' },
    { key: 'large_hotel', label: 'Отель' },
    { key: 'apartment', label: 'Квартира' },
    { key: 'house', label: 'Дом' },
  ];

  const TYPE_REVERSE = {
    'Квартира / Дом': 'apartment', 'Квартира': 'apartment', apartment: 'apartment',
    'Дом / Вилла': 'house', 'Дом': 'house', house: 'house',
    'Мини гостиница': 'hotel', 'Мини-гостиница': 'hotel', 'Гостевой дом': 'hotel', guesthouse: 'hotel', room: 'hotel', mini_hotel: 'hotel',
    'Гостиница': 'hotel', hotel: 'hotel',
    'Крупный отель': 'large_hotel', 'Отель': 'large_hotel', large_hotel: 'large_hotel',
  };

  const filtered = useMemo(() => {
    let result = properties;

    if (city) {
      result = result.filter(p =>
        (p.city || p.location || '').toLowerCase().includes(city.toLowerCase()) ||
        (p.region || '').toLowerCase().includes(city.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(p => {
        const mapped = TYPE_REVERSE[p.type] || p.type;
        return mapped === typeFilter;
      });
    }

    if (totalGuests > 0) {
      result = result.filter(p => (p.guests || p.maxGuests || 0) >= totalGuests);
    }

    if (hasPets) {
      result = result.filter(p => {
        const am = p.amenities || p.conditions || [];
        return am.some(a => a.toLowerCase().includes('питомц') || a.toLowerCase().includes('животн') || a === 'pets');
      });
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'priceAsc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'priceDesc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
    }

    return sorted;
  }, [properties, city, totalGuests, hasPets, typeFilter, sortBy]);

  // Sync typeFilter with URL param changes
  useEffect(() => {
    setTypeFilter(typeParam);
  }, [typeParam]);

  const handlePlacemarkClick = useCallback((id) => {
    navigate(`/property/${id}`);
  }, [navigate]);

  const cityLabel = city || 'Все города';
  const sortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label || 'Сортировка';

  return (
    <div className="min-h-screen antialiased">
      {/* Background */}
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-3 pb-3">
        <h1 className="text-xl sm:text-2xl font-body font-semibold text-white">
          {cityLabel}
          <span className="text-white/40 font-normal"> — {filtered.length} вариант{filtered.length === 1 ? '' : filtered.length > 1 && filtered.length < 5 ? 'а' : 'ов'} жилья</span>
        </h1>
      </div>

      {/* Content: filters + cards + map */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pb-12 lg:grid lg:grid-cols-[1fr_520px] xl:lg:grid-cols-[1fr_600px] lg:gap-6">
        {/* Filters + Sort */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1 lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2">
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 -mb-1 lg:overflow-visible lg:pb-0 lg:mb-0">
            {TYPE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-300 whitespace-nowrap shrink-0 ${
                  typeFilter === tab.key
                    ? 'bg-ocean-500 text-white shadow-md shadow-ocean-500/25'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm sm:text-base font-body font-medium transition-all duration-300"
            >
              <ArrowUpDown size={16} />
              {sortLabel}
              <ChevronDown size={14} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 overflow-hidden z-50"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                      className={`w-full px-4 py-2.5 text-sm font-body text-left transition-colors duration-200 ${
                        sortBy === opt.key ? 'bg-ocean-500/20 text-ocean-400' : 'text-white/70 hover:bg-white/10 hover:text-white'
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

        {/* Cards — row 2, col 1 */}
        <div className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3">
          {loadingProps ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                  isFavorite={isFavorite(property.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-lg font-body text-white/40">Жильё не найдено</p>
                <p className="text-sm font-body text-white/25 mt-1">Попробуйте другой город</p>
              </div>
            )}
          </>
          )}
        </div>

        {/* Map — row 2, col 2 (same level as cards, not filters) */}
        <div className="hidden lg:block sticky top-24 self-start lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 h-[calc(100vh-120px)]">
            <YandexMap
              properties={filtered}
              onPlacemarkClick={handlePlacemarkClick}
            />
          </div>
        </div>

        {/* Mobile Map Toggle Button */}
        <button
          onClick={() => setShowMobileMap(true)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3.5 rounded-full bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-body font-semibold shadow-2xl shadow-black/40 transition-all duration-300 active:scale-95"
        >
          <MapIcon size={18} />
          Карта
        </button>

        {/* Mobile Map Overlay */}
        <AnimatePresence>
          {showMobileMap && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-0 z-50 bg-[#0a0a0c]"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowMobileMap(false)}
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="w-full h-full">
                <YandexMap
                  properties={filtered}
                  onPlacemarkClick={(id) => { setShowMobileMap(false); handlePropertyClick(id); }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default SearchResults;
