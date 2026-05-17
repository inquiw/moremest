import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Globe, User, Menu, X, Check, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('ru');
  const langRef = useRef(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    const handleOpenAuth = () => setAuthOpen(true);
    window.addEventListener('open-auth', handleOpenAuth);
    return () => { subscription.unsubscribe(); window.removeEventListener('open-auth', handleOpenAuth); };
  }, []);

  const handleAuth = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      setAuthOpen(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(
        err.message === 'Invalid login credentials'
          ? 'Неверный email или пароль'
          : err.message === 'User already registered'
          ? 'Пользователь с таким email уже существует'
          : err.message || 'Произошла ошибка'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
    document.body.style.overflow = mobileOpen || authOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, authOpen]);

  const navItems = ['Гостиницы', 'Отели', 'Квартиры', 'Для хозяев'];

  return (
    <>
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
            <button
              key={item}
              onClick={() => item === 'Для хозяев' ? navigate('/hosts') : null}
              className="text-white text-[15px] font-body font-medium hover:text-white/70 transition-colors duration-300"
            >
              {item}
            </button>
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
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 relative"
            >
              <span className="relative">
                <User size={20} strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1a1a1f]" />
              </span>
              <span className="text-sm font-body hidden sm:inline">Профиль</span>
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden md:block text-white/70 hover:text-white transition-colors duration-300"
            >
              <User size={20} strokeWidth={1.5} />
            </button>
          )}
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
            <button
              key={item}
              onClick={() => { setMobileOpen(false); if (item === 'Для хозяев') navigate('/hosts'); }}
              className="text-white/90 text-lg font-body font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors duration-200 w-full text-left"
            >
              {item}
            </button>
          ))}
          <div className="flex items-center gap-4 px-4 pt-4 border-t border-white/10 mt-2">
            <button onClick={() => { setLang(lang === 'ru' ? 'en' : 'ru'); setMobileOpen(false); }} className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
              <Globe size={18} strokeWidth={1.5} />
              <span className="text-sm font-body">{languages.find(l => l.code === lang)?.label}</span>
            </button>
            {user ? (
              <button onClick={() => { setMobileOpen(false); navigate('/profile'); }} className="relative text-white/60 hover:text-white transition-colors">
                <User size={20} strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1a1a1f]" />
              </button>
            ) : (
              <button onClick={() => { setMobileOpen(false); setAuthOpen(true); }} className="text-white/60 hover:text-white transition-colors">
                <User size={20} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>

    {/* Auth Modal */}
    <AnimatePresence>
      {authOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setAuthOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 rounded-3xl bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 p-8"
          >
            {/* Close button */}
            <button
              onClick={() => setAuthOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
            >
              <X size={18} className="text-white/50" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-display font-semibold text-white mb-6">
              {authMode === 'login' ? 'Вход' : 'Регистрация'}
            </h2>

            {/* Form */}
            <div className="space-y-4 mb-6">
              {/* Email */}
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 focus:bg-white/[0.07] transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 focus:bg-white/[0.07] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {authError && (
                <p className="text-red-400 text-sm font-body text-center">{authError}</p>
              )}
              <button
                onClick={handleAuth}
                disabled={isLoading || !email || !password}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-body font-semibold shadow-lg transition-all duration-300 active:scale-[0.98] ${
                  isLoading || !email || !password
                    ? 'bg-ocean-500/40 shadow-none cursor-not-allowed'
                    : 'bg-ocean-500 hover:bg-ocean-400 shadow-ocean-500/25'
                }`}
              >
                {isLoading ? 'Загрузка...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-body font-medium transition-all duration-300"
              >
                {authMode === 'login' ? 'Зарегистрироваться' : 'Уже есть аккаунт'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;
