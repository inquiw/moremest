import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ChevronRight, ChevronLeft } from 'lucide-react';

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

const Collections = () => {
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
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
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
    return (card.offsetWidth + 24) * 2;
  };

  const scrollLeft = () => {
    smoothScroll(scrollRef.current.scrollLeft - getScrollStep());
    setTimeout(updateScrollButtons, 520);
  };
  const scrollRight = () => {
    smoothScroll(scrollRef.current.scrollLeft + getScrollStep());
    setTimeout(updateScrollButtons, 520);
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 xl:py-32 overflow-hidden">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5] via-[#F5F2EE] to-[#FAF8F5]" />

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-2xl sm:text-3xl lg:text-[40px] font-display font-semibold text-ocean-900 leading-tight tracking-tight"
          >
            Подборки жилья, которые<br className="hidden lg:block" /> вам понравятся
          </motion.h2>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex gap-2 flex-wrap overflow-x-auto pb-1 -mb-1 lg:overflow-visible lg:pb-0 lg:mb-0"
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-body font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === i
                    ? 'bg-ocean-800 text-white'
                    : 'text-ocean-700/60 hover:text-ocean-900 hover:bg-ocean-100/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Cards Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 px-2 rounded-2xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={updateScrollButtons}
            onLoad={updateScrollButtons}
          >
            {properties.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                data-card
                className="shrink-0 w-[240px] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] group cursor-pointer bg-white rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3 shadow-lg shadow-black/5 border border-gray-100"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-[12px] sm:rounded-[16px] overflow-hidden mb-2 sm:mb-3">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badge */}
                  <span className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] sm:text-[11px] font-body font-semibold text-ocean-900">
                    {p.badge}
                  </span>

                  {/* Heart */}
                  <button className="absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors">
                    <Heart size={16} className="text-white" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Info */}
                <div className="px-0.5 sm:px-1 pb-0.5 sm:pb-1">
                  <h3 className="text-ocean-900 font-display font-medium text-sm sm:text-base leading-snug mb-0.5 sm:mb-1 group-hover:text-ocean-700 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm font-body mb-1 sm:mb-2">{p.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400 sm:w-[14px] sm:h-[14px]" />
                      <span className="text-ocean-900 text-xs sm:text-sm font-body font-medium">{p.rating}</span>
                      <span className="text-gray-400 text-xs sm:text-sm font-body">({p.reviews})</span>
                    </div>
                    <p className="text-ocean-900 font-display font-semibold text-sm sm:text-base">
                      {p.price} ₽<span className="text-gray-400 font-normal text-xs sm:text-sm"> / ночь</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[#F5F2EE]/60 to-transparent z-10 pointer-events-none rounded-l-2xl" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[#F5F2EE]/60 to-transparent z-10 pointer-events-none rounded-r-2xl" />

          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
            className="absolute left-[6px] top-[35%] -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center hover:scale-110 transition-all duration-500 z-20 hidden lg:flex"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
            className="absolute right-[6px] top-[35%] -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center hover:scale-110 transition-all duration-500 z-20 hidden lg:flex"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Collections;
