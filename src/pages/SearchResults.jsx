import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ArrowUpDown, ChevronDown, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabaseClient';
import fallbackProperties from '../data/properties.json';

const TYPE_LABELS = {
  apartment: 'Квартира', house: 'Дом / Вилла', hotel: 'Отель',
  guesthouse: 'Гостевой дом', room: 'Номер в гостинице',
  'Квартира': 'Квартира', 'Дом / Вилла': 'Дом / Вилла', 'Отель': 'Отель',
  'Гостиница': 'Гостевой дом', 'Гостевой дом': 'Гостевой дом',
};

const PropertyCard = ({ property, onClick }) => {
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
          onClick={e => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors"
        >
          <Heart size={18} className="text-white" strokeWidth={1.5} />
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
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }

      const map = new window.ymaps.Map(mapRef.current, {
        center: [44.5611, 38.0814],
        zoom: 13,
        controls: ['zoomControl', 'typeSelector'],
      }, {
        suppressMapOpenBlock: true,
      });

      mapInstance.current = map;

      // Add placemarks using stored coords (no geocoding — prevents wrong positions)
      items.forEach(p => {
        if (p.coords) {
          const placemark = new window.ymaps.Placemark(
            p.coords,
            {
              balloonContentHeader: p.name,
              balloonContentBody: `<div style="font-family:DM Sans,sans-serif"><b>${p.price.toLocaleString('ru-RU')} ₽/ночь</b><br/>${p.address}</div>`,
              hintContent: `${p.name} — ${p.price.toLocaleString('ru-RU')} ₽/ночь`,
              iconCaption: p.name,
            },
            {
              iconLayout: 'default#image',
              iconImageHref: PIN_ICON,
              iconImageSize: [36, 36],
              iconImageOffset: [-18, -18],
              iconCaptionMaxWidth: '150',
            }
          );
          placemark.events.add('click', () => {
            if (onPlacemarkClick) onPlacemarkClick(p.id);
          });
          map.geoObjects.add(placemark);
        }
      });

      // Fit bounds
      if (items.length > 0) {
        const bounds = map.geoObjects.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true, zoomMargin: [40] });
        }
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [items, onPlacemarkClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-xl shadow-black/30"
    />
  );
};

/* ─── SearchResults Page ─── */
const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const sortRef = useRef(null);
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);

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

  const initialStartDate = checkIn ? new Date(checkIn + 'T00:00:00') : null;
  const initialEndDate = checkOut ? new Date(checkOut + 'T00:00:00') : null;
  const totalGuests = parseInt(guestsParam, 10) || 0;
  const initialAdults = totalGuests > 0 ? totalGuests : 0;

  const filtered = useMemo(() => {
    let result = properties;

    if (city) {
      result = result.filter(p =>
        (p.city || p.location || '').toLowerCase().includes(city.toLowerCase()) ||
        (p.region || '').toLowerCase().includes(city.toLowerCase())
      );
    }

    if (totalGuests > 0) {
      result = result.filter(p => (p.maxGuests || p.guests || 0) >= totalGuests);
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
  }, [properties, city, totalGuests, sortBy]);

  const handlePlacemarkClick = useCallback((id) => {
    navigate(`/property/${id}`);
  }, [navigate]);

  const cityLabel = city || 'Все города';
  const sortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label || 'Сортировка';

  return (
    <div className="min-h-screen antialiased">
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 mb-6 flex items-center justify-between">
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

      {/* Content: cards + map */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="flex gap-6">
          {/* Cards column */}
          <div className="flex-1 min-w-0">
            {loadingProps ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => navigate(`/property/${property.id}`)}
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

          {/* Map column — hidden on small screens */}
          <div className="hidden lg:block w-[520px] xl:w-[600px] shrink-0 sticky top-24 self-start">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 h-[calc(100vh-120px)]">
              <YandexMap
                properties={filtered}
                onPlacemarkClick={handlePlacemarkClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
