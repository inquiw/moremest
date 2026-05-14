import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Headphones, Lock, Gift, Search } from 'lucide-react';
import SearchBar from './SearchBar';

const destinations = [
  {
    name: 'Сочи',
    price: 'от 3 200 ₽',
    img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80',
  },
  {
    name: 'Геленджик',
    price: 'от 2 100 ₽',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  },
  {
    name: 'Крым',
    price: 'от 2 500 ₽',
    img: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600&q=80',
  },
  {
    name: 'Калининград',
    price: 'от 2 800 ₽',
    img: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80',
  },
  {
    name: 'Алтай',
    price: 'от 1 900 ₽',
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  },
];

const Hero = () => {
  const scrollRef = useRef(null);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto sm:overflow-hidden antialiased">
      {/* Background Image */}
      <div className="absolute inset-0 sm:inset-0">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80"
          alt="Luxury villa with infinity pool overlooking the ocean"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#062B36]/90 via-[#062B36]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#062B36]/70 via-transparent to-[#062B36]/20" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(6,43,54,0.35)_100%)]" />
      </div>

      {/* All content in one column */}
      <div className="relative z-10 sm:h-full flex flex-col max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 pt-20 sm:pt-24 pb-8 sm:pb-0">
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
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4 sm:mb-8"
          >
            <span className="text-xs sm:text-[13px] text-white/90 font-body font-medium">Мир открытий ✦</span>
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
            className="hidden md:block w-full max-w-4xl"
          >
            <SearchBar />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-4 sm:mt-6 lg:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { icon: ShieldCheck, title: 'Тщательная проверка жилья', desc: 'Каждый объект проходит верификацию' },
              { icon: Headphones, title: 'Поддержка 24/7', desc: 'Мы всегда на связи' },
              { icon: Lock, title: 'Безопасная оплата', desc: 'Ваши данные под защитой' },
              { icon: Gift, title: 'Бонусы и скидки', desc: 'Путешествуйте выгоднее' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-xl bg-white/8 backdrop-blur-md border border-white/12">
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <f.icon size={22} className="text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-white font-body leading-tight">{f.title}</p>
                  <p className="text-xs sm:text-sm text-white/80 font-body mt-0.5 sm:mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Destinations */}
          <div className="mt-6 sm:mt-10">
          {/* Header row */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="flex items-center justify-between mb-4 sm:mb-6"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold text-white leading-[1.1] tracking-tight">
              Куда хотите отправиться?
            </h2>
            <button className="hidden sm:inline-flex px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-sm sm:text-base font-body font-semibold text-ocean-900 hover:bg-white/90 transition-all duration-300 active:scale-95">
              Смотреть все
            </button>
          </motion.div>

          {/* Cards Carousel */}
          <div className="relative">
            <div
              ref={scrollRef}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {destinations.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] sm:aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden">
                    <img
                      src={d.img}
                      alt={d.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                      <p className="text-white font-display font-bold text-lg sm:text-2xl leading-none mb-0.5 sm:mb-1">{d.name}</p>
                      <p className="text-white/90 text-xs sm:text-base font-body font-medium">{d.price} / ночь</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
