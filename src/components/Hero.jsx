import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Headphones, Lock, Gift, Search, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from './SearchBar';

const tabs = ['Популярные', 'У моря', 'С бассейном', 'Для семьи', 'Уникальные'];

const properties = [
  {
    title: 'Вилла на склоне с видом на океан',
    location: 'Сочи, Краснодарский край',
    rating: 4.98,
    reviews: 128,
    price: '12 500',
    badge: 'Выбор',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  },
  {
    title: 'Лофт в центре города',
    location: 'Москва, Россия',
    rating: 4.95,
    reviews: 96,
    price: '6 200',
    badge: 'Суперхозяин',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  },
  {
    title: 'Домик у озера',
    location: 'Карелия, Россия',
    rating: 4.93,
    reviews: 54,
    price: '7 800',
    badge: 'Новое',
    img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80',
  },
  {
    title: 'Апартаменты с террасой',
    location: 'Сочи, Россия',
    rating: 4.97,
    reviews: 72,
    price: '9 300',
    badge: 'Суперхозяин',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
  {
    title: 'Эко-дом в лесу',
    location: 'Алтай, Россия',
    rating: 4.91,
    reviews: 53,
    price: '5 400',
    badge: 'Новое',
    img: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&q=80',
  },
  {
    title: 'Шале с камином и панорамой',
    location: 'Приэльбрусье, Кабардино-Балкария',
    rating: 4.96,
    reviews: 87,
    price: '8 900',
    badge: 'Выбор',
    img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80',
  },
  {
    title: 'Дом с террасой у моря',
    location: 'Геленджик, Россия',
    rating: 4.94,
    reviews: 64,
    price: '6 800',
    badge: 'Суперхозяин',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
  {
    title: 'Горный домик с видом на ущелье',
    location: 'Домбай, Карачаево-Черкесия',
    rating: 4.89,
    reviews: 41,
    price: '4 700',
    badge: 'Новое',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  },
  {
    title: 'Вилла с бассейном и садом',
    location: 'Анапа, Россия',
    rating: 4.92,
    reviews: 76,
    price: '11 200',
    badge: 'Выбор',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
];

const Hero = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

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
    <section className="relative w-full overflow-x-hidden antialiased bg-gradient-to-b from-[#1a1a1f] via-[#111114] to-[#0a0a0c]">
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
            className="mt-4 sm:mt-6 lg:mt-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4"
          >
            {[
              { icon: ShieldCheck, title: 'Тщательная проверка', desc: 'Верификация объектов' },
              { icon: Headphones, title: 'Поддержка 24/7', desc: 'Мы всегда на связи' },
              { icon: Lock, title: 'Безопасная оплата', desc: 'Данные под защитой' },
              { icon: Gift, title: 'Бонусы и скидки', desc: 'Путешествуйте выгоднее' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-l border-white/15' : ''}`}
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
                {properties.map((p, i) => (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    data-card
                    className="shrink-0 w-[calc(25%-12px)] group cursor-pointer bg-gradient-to-b from-[#f5ebe0] via-[#fef9f3] to-white rounded-2xl p-2.5 shadow-lg shadow-black/20"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                      <img
                        src={p.img}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-xs font-body font-semibold text-white">
                        {p.badge}
                      </span>
                      <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors">
                        <Heart size={18} className="text-white" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="px-1 pb-1">
                      <h3 className="text-ocean-900 font-display font-semibold text-lg leading-snug mb-1 group-hover:text-ocean-700 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-gray-400 text-base font-body mb-1.5">{p.location}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                          <span className="text-ocean-900 text-base font-body font-medium">{p.rating}</span>
                          <span className="text-gray-400 text-base font-body">({p.reviews})</span>
                        </div>
                        <p className="text-ocean-900 font-display font-bold text-lg">
                          {p.price} ₽<span className="text-gray-400 font-normal text-base"> / ночь</span>
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
