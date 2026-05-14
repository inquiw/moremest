import React, { useState, useEffect, useRef } from 'react';
import { Heart, Globe, User, Menu, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('ru');
  const langRef = useRef(null);

  const languages = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems = ['Гостиницы', 'Отели', 'Квартиры', 'Для хозяев'];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled || mobileOpen ? 'bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30' : ''
    }`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-white text-2xl sm:text-[28px] font-display font-semibold tracking-tight">
          moremest
        </a>

        {/* Center Nav - Desktop */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-white text-[15px] font-body font-medium hover:text-white/70 transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button className="hidden md:block text-white/70 hover:text-white transition-colors duration-300">
            <Heart size={20} strokeWidth={1.5} />
          </button>
          <div ref={langRef} className="relative hidden md:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors duration-300"
            >
              <Globe size={18} strokeWidth={1.5} />
              <span className="text-sm font-body">{languages.find(l => l.code === lang)?.label}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 overflow-hidden z-50"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <span className="text-lg">{l.flag}</span>
                      <span className="flex-1 text-left">{l.label}</span>
                      {lang === l.code && <Check size={16} className="text-ocean-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="hidden md:block text-white/70 hover:text-white transition-colors duration-300">
            <User size={20} strokeWidth={1.5} />
          </button>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white/70 hover:text-white transition-colors duration-300 p-1"
          >
            {mobileOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="flex flex-col gap-1 px-4 sm:px-6 pb-6 pt-2">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-white/90 text-lg font-body font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors duration-200"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex items-center gap-4 px-4 pt-4 border-t border-white/10 mt-2">
            <button onClick={() => { setLang(lang === 'ru' ? 'en' : 'ru'); setMobileOpen(false); }} className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
              <Globe size={18} strokeWidth={1.5} />
              <span className="text-sm font-body">{languages.find(l => l.code === lang)?.label}</span>
            </button>
            <User size={20} className="text-white/60" strokeWidth={1.5} />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
