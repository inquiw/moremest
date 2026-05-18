import React from 'react';
import { Send, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const columns = [
    {
      title: 'Компания',
      links: ['О нас', 'Карьера', 'Пресс-центр', 'Партнёры'],
    },
    {
      title: 'Поддержка',
      links: ['Помощь', 'Условия', 'Безопасность', 'Отмена бронирования'],
    },
    {
      title: 'Для хозяев',
      links: ['Сдать жильё', 'Для хозяев', 'Ресурсы'],
    },
  ];

  return (
    <footer className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#062B36] to-[#0A2230]" />

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-6 sm:pb-8">
        {/* Top Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-8 pb-10 sm:pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <a href="/" className="text-white text-2xl sm:text-xl font-display font-semibold tracking-tight">
              moremest
            </a>
            <p className="text-white/40 text-xs sm:text-sm font-body mt-2 sm:mt-3 leading-relaxed">
              Сервис бронирования уникального жилья по всей России
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white/60 text-[11px] sm:text-[13px] font-body font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/50 text-xs sm:text-sm font-body hover:text-white transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Socials */}
          <div>
            <h4 className="text-white/60 text-[11px] sm:text-[13px] font-body font-semibold uppercase tracking-wider mb-3 sm:mb-4">
              Мы в соцсетях
            </h4>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                >
                  <Icon size={18} className="text-white/70" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white/60 text-[11px] sm:text-[13px] font-body font-semibold uppercase tracking-wider mb-2">
              Получайте вдохновение
            </h4>
            <p className="text-white/30 text-[11px] sm:text-[13px] font-body mb-3 sm:mb-4">и скидки на почту</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-body placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-ocean-600 hover:bg-ocean-500 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 gap-3 sm:gap-4">
          <p className="text-white/30 text-[11px] sm:text-[13px] font-body">
            © 2024 moremest. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1 sm:gap-6">
            <a href="#" className="text-white/30 text-[11px] sm:text-[13px] font-body hover:text-white/60 transition-colors">
              Публичная оферта
            </a>
            <a href="#" className="text-white/30 text-[11px] sm:text-[13px] font-body hover:text-white/60 transition-colors">
              Конфиденциальность
            </a>
            <a href="#" className="text-white/30 text-[11px] sm:text-[13px] font-body hover:text-white/60 transition-colors hidden sm:inline">
              Условия использования
            </a>
            <span className="text-white/30 text-[11px] sm:text-[13px] font-body hidden sm:inline">Русский ▾</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
