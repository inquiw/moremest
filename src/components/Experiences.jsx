import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Экскурсии', img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&q=80' },
  { name: 'Активный отдых', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80' },
  { name: 'Культура и искусство', img: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=400&q=80' },
  { name: 'Гастро туры', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
];

const Experiences = () => {
  return (
    <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28 xl:pb-32">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] xl:min-h-[480px]"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80"
              alt="Scenic mountain landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#062B36]/85 via-[#062B36]/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center h-full p-5 sm:p-8 lg:p-14 gap-6 sm:gap-8 lg:gap-10">
            {/* Left Text */}
            <div className="flex-1">
              <p className="text-white/50 text-xs sm:text-sm font-body font-medium mb-3 sm:mb-4 uppercase tracking-wider">Впечатления</p>
              <h2 className="text-2xl sm:text-3xl lg:text-[44px] font-display font-semibold text-white leading-[1.1] tracking-tight mb-5 sm:mb-6 lg:mb-8">
                Не просто жильё,<br />а целые впечатления
              </h2>
              <button className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white text-ocean-900 text-xs sm:text-sm font-body font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95">
                Найти впечатления
              </button>
            </div>

            {/* Right: Category Cards */}
            <div className="flex gap-3 sm:gap-4 flex-wrap lg:flex-nowrap justify-center">
              {categories.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="w-[100px] sm:w-[120px] lg:w-[140px] xl:w-[150px] cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-[14px] sm:rounded-[16px] lg:rounded-[20px] overflow-hidden mb-2 sm:mb-3 shadow-lg shadow-black/20">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-white text-xs sm:text-sm font-body font-medium text-center leading-tight">{c.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experiences;
