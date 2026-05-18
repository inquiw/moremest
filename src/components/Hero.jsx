import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, PhoneCall, CalendarCheck, Headset, Search, Heart, Star, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import SearchBar from './SearchBar';
import fallbackProperties from '../data/properties.json';
import { supabase } from '../lib/supabaseClient';

const tabs = ['Популярные', 'У моря', 'С бассейном', 'Для семьи', 'Уникальные'];

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  const [allProperties, setAllProperties] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setAllProperties(data);
        } else {
          setAllProperties(fallbackProperties);
        }
      } catch (err) {
        console.error('Error fetching properties for Hero:', err);
        setAllProperties(fallbackProperties);
      }
      setLoaded(true);
    };
    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    if (!loaded) return [];
    const source = allProperties;
    switch (activeTab) {
      case 0: // Популярные
        return [...source].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 9);
      case 1: // У моря
        return source.filter(p =>
          p.conditions && p.conditions.some(c => c.toLowerCase().includes('море'))
        );
      case 2: // С бассейном
        return source.filter(p => p.conditions && p.conditions.includes('Бассейн'));
      case 3: // Для семьи
        return source.filter(p => (p.maxGuests || p.guests || 0) >= 5);
      case 4: // Уникальные
        return source.filter(p =>
          p.conditions && p.conditions.some(c => ['Камин', 'Печь', 'Баня', 'Джакузи', 'Виноградник', 'Банкетный зал'].includes(c))
        );
      default:
        return source.slice(0, 9);
    }
  }, [activeTab, allProperties, loaded]);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const smoothScroll = (target) => {
    const el = scrollRef.current;
    if (!el) return;
    const start = el.scrollLeft;
    const distance = target - start;
    const duration = 500;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.scrollLeft = start + distance * ease;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const getScrollStep = () => {
    const el = scrollRef.current;
    if (!el) return 360;
    const card = el.querySelector('[data-card]');
    if (!card) return 360;
    return (card.offsetWidth + 16) * 2;
  };

  const handleScrollLeft = () => {
    smoothScroll(scrollRef.current.scrollLeft - getScrollStep());
    setTimeout(updateScrollButtons, 520);
  };
  const handleScrollRight = () => {
    smoothScroll(scrollRef.current.scrollLeft + getScrollStep());
    setTimeout(updateScrollButtons, 520);
  };

  return (
    <section className="relative w-full overflow-x-hidden antialiased">
      {/* Hero card with image */}
      <div className="max-w-[100rem] mx-auto px-2 sm:px-4 lg:px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-screen shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          <img
            src="/hero-bg.jpg"
            alt="Luxury villa with infinity pool overlooking the ocean"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Darkening overlay: left + bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Content overlay */}
          <div className="relative z-10 h-full flex flex-col px-6 sm:px-10 lg:px-14 pt-24 sm:pt-28 pb-6">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 mb-4 sm:mb-8"
          >
            <span className="text-sm sm:text-base text-white/90 font-body font-medium">Мир открытий ✦</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[86px] font-display font-extralight text-white leading-[0.95] tracking-[-0.02em] mb-4 sm:mb-6"
          >
            Живите<br />вдохновением
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-body font-normal leading-relaxed max-w-md"
          >
            Уникальные дома и впечатления<br className="hidden sm:block" />
            в самых красивых местах России
          </motion.p>
        </motion.div>

        {/* Bottom group: search + features + destinations */}
        <div className="mt-6 sm:mt-10">
          {/* Search Bar - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:hidden"
          >
            <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 luxury-shadow-lg">
              <Search size={20} className="text-ocean-600 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ocean-900 font-body leading-none">Куда хотите отправиться?</p>
                <p className="text-xs text-gray-400 font-body mt-0.5">Даты · Гости</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center shrink-0 transition-all duration-300">
                <Search size={18} className="text-white" strokeWidth={2} />
              </button>
            </div>
          </motion.div>

          {/* Search Bar - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block w-full"
          >
            <SearchBar />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 sm:mt-6 lg:mt-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-y-1"
          >
            {[
              { icon: ShieldCheck, title: 'Проверенные объекты', desc: 'Тщательная верификация' },
              { icon: PhoneCall, title: 'Прямые контакты', desc: 'Бронь без комиссий' },
              { icon: CalendarCheck, title: 'Умный календарь', desc: 'Только свободные даты' },
              { icon: Headset, title: 'Служба заботы', desc: 'Поддержка 24/7' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-start gap-3 px-3 sm:px-4 py-3 ${i > 0 ? 'md:border-l border-white/15' : ''} ${i === 2 ? 'md:border-l' : ''}`}
              >
                <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center">
                  <f.icon size={20} className="text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-white font-body leading-tight">{f.title}</p>
                  <p className="text-xs sm:text-sm text-white/70 font-body mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Collections: Подборки жилья */}
          <div className="mt-auto pt-8 sm:pt-12">
            {/* Header + Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold text-white leading-tight tracking-tight">
                Подборки жилья, которые<br className="hidden sm:block" /> вам понравятся
              </h2>
              <div className="flex gap-2 sm:gap-3 flex-wrap overflow-x-auto pb-1 -mb-1 sm:overflow-visible sm:pb-0 sm:mb-0">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-body font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === i
                        ? 'bg-white text-ocean-900 shadow-lg shadow-black/20'
                        : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white hover:bg-black/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Carousel */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto overflow-y-hidden"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={updateScrollButtons}
                  onLoad={updateScrollButtons}
                >
                {filtered.length === 0 ? (
                  /* Skeleton placeholders */
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[72%] sm:w-[45%] md:w-[calc(33.33%-12px)] lg:w-[calc(25%-12px)] rounded-2xl p-2.5 bg-white/10 animate-pulse">
                      <div className="aspect-[4/3] rounded-xl bg-white/15 mb-2" />
                      <div className="px-1 pb-1 space-y-2">
                        <div className="h-5 bg-white/10 rounded-lg w-3/4" />
                        <div className="h-4 bg-white/10 rounded-lg w-1/2" />
                        <div className="flex justify-between">
                          <div className="h-4 bg-white/10 rounded w-1/3" />
                          <div className="h-5 bg-white/10 rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    data-card
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="shrink-0 w-[72%] sm:w-[45%] md:w-[calc(33.33%-12px)] lg:w-[calc(25%-12px)] group cursor-pointer bg-gradient-to-b from-[#f5ebe0] via-[#fef9f3] to-white rounded-3xl p-2.5 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                      <img
                        src={p.images && p.images.length > 0 ? p.images[0] : (p.img || '/img/placeholder.jpg')}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-xs font-body font-semibold text-white">
                        {p.type}
                      </span>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors"
                      >
                        <Heart size={18} className="text-white" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="px-1 pb-1">
                      <h3 className="text-ocean-900 font-display font-semibold text-lg leading-snug mb-1 group-hover:text-ocean-700 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-400 text-sm font-body mb-1.5">
                        <MapPin size={13} className="shrink-0" />
                        <span>{p.city || p.location}{p.address ? `, ${p.address}` : ''}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                          <span className="text-ocean-900 text-base font-body font-medium">{p.rating}</span>
                          <span className="text-gray-400 text-base font-body">({p.reviews})</span>
                        </div>
                        <p className="text-ocean-900 font-display font-bold text-lg">
                          {(p.price || 0).toLocaleString('ru-RU')} ₽<span className="text-gray-400 font-normal text-base"> / ночь</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>

              {/* Left Arrow */}
              <button
                onClick={handleScrollLeft}
                style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center hover:scale-110 transition-all duration-500 z-20 hidden lg:flex"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleScrollRight}
                style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-14 h-14 rounded-full bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center hover:scale-110 transition-all duration-500 z-20 hidden lg:flex"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
