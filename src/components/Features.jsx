import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, PhoneCall, CalendarCheck, Headset } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Проверенные объекты', desc: 'Тщательная верификация' },
  { icon: PhoneCall, title: 'Прямые контакты', desc: 'Бронь без комиссий' },
  { icon: CalendarCheck, title: 'Умный календарь', desc: 'Только свободные даты' },
  { icon: Headset, title: 'Служба заботы', desc: 'Поддержка 24/7' },
];

const Features = () => {
  return (
    <section className="py-10">
      <div className="max-w-8xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5"
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-6 lg:py-8">
              <div className="shrink-0 w-11 h-11 rounded-full bg-ocean-500/15 flex items-center justify-center">
                <f.icon size={20} className="text-ocean-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-body leading-tight">{f.title}</p>
                <p className="text-[13px] text-white/40 font-body mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
