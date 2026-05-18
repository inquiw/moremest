import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

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

const Destinations = () => {
  const scrollRef = useRef(null);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section className="bg-sand-50 py-24 lg:py-32 overflow-hidden">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:w-[280px] shrink-0 flex flex-col justify-center"
          >
            <h2 className="text-3xl lg:text-[40px] font-display font-semibold text-ocean-900 leading-[1.1] tracking-tight mb-4">
              Куда хотите<br />отправиться?
            </h2>
            <p className="text-base text-gray-400 font-body leading-relaxed mb-8">
              Популярные направления для вашего следующего путешествия
            </p>
            <button className="w-fit px-6 py-3 rounded-full border border-ocean-900/20 text-sm font-body font-semibold text-ocean-900 hover:bg-ocean-900 hover:text-white transition-all duration-300">
              Смотреть все
            </button>
          </motion.div>

          {/* Cards Carousel */}
          <div className="relative flex-1 min-w-0">
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mr-6 lg:-mr-10 pr-6 lg:pr-10 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {destinations.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="shrink-0 w-[160px] sm:w-[200px] lg:w-[220px] snap-start group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] rounded-[28px] overflow-hidden mb-3">
                    <img
                      src={d.img}
                      alt={d.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-white font-display font-semibold text-lg leading-none">{d.name}</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-400 font-body px-1">{d.price} / ночь</p>
                </motion.div>
              ))}
            </div>

            {/* Arrow Button */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-xl shadow-black/10 flex items-center justify-center hover:scale-110 transition-all duration-300 z-10 hidden lg:flex"
            >
              <ChevronRight size={20} className="text-ocean-800" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
