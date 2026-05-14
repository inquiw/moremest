import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, LogOut, Calendar, Heart, Settings, Phone, Home,
  Star, MessageSquare, CreditCard, Gift, Headphones, ChevronRight,
  MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp,
  Save, Shield, Bell, Eye, EyeOff, Lock, Edit3, Plus, Trash2, Send, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';

/* ─── Mock data ─── */
const UPCOMING_TRIP = {
  img: '/img/villa.jpg',
  name: 'Вилла у моря',
  location: 'Геленджик, Краснодарский край',
  dates: '15 июн — 22 июн 2025',
  daysLeft: 5,
  price: '87 500 ₽',
  guests: 4,
};

const PAST_BOOKINGS = [
  { id: 1, img: '/img/apart1.jpg', name: 'Солнечная мансарда', location: 'Сочи', dates: '1 мар — 7 мар', price: '33 600 ₽', status: 'Завершено' },
  { id: 2, img: '/img/hotel1.jpg', name: 'Спа-отель на берегу', location: 'Пятигорск', dates: '12 янв — 16 янв', price: '30 400 ₽', status: 'Завершено' },
  { id: 3, img: '/img/domik v lesu.jpg', name: 'Домик в сосновом бору', location: 'Кабардинка', dates: '5 нояб — 10 нояб', price: '28 000 ₽', status: 'Завершено' },
];

const FAVORITES = [
  { id: 1, img: '/img/villa3.jpg', name: 'Горное шале', location: 'Домбай, Карачаево-Черкесия', rating: 4.9, reviews: 128, price: '9 800 ₽', type: 'Гостиница' },
  { id: 2, img: '/img/apart5.jpg', name: 'Квартира у Кремля', location: 'Москва, Россия', rating: 4.7, reviews: 95, price: '8 400 ₽', type: 'Квартира' },
  { id: 3, img: '/img/bungalo.jpg', name: 'Бунгало на пляже', location: 'Анапа, Краснодарский край', rating: 4.8, reviews: 73, price: '5 100 ₽', type: 'Отель' },
];

const MOCK_REVIEWS = [
  { id: 1, property: 'Солнечная мансарда', text: 'Отличное место! Вид на горы — просто восторг. Хозяева очень гостеприимные.', rating: 5, date: '7 марта 2025' },
  { id: 2, property: 'Спа-отель на берегу', text: 'Ремонт немного устарел, но спа-зона топ. Завтраки шикарные.', rating: 4, date: '16 января 2025' },
  { id: 3, property: 'Домик в сосновом бору', text: 'Идеально для уединённого отдыха. Тишина, свежий воздух, камина хватает.', rating: 5, date: '10 ноября 2024' },
];

const MOCK_MESSAGES = [
  { id: 1, from: 'Владелец: Вилла у моря', text: 'Добрый день! Заселение с 14:00. Код от ворот пришлю за день.', time: '2 ч назад', unread: true },
  { id: 2, from: 'Поддержка Moremest', text: 'Ваш отзыв опубликован. Спасибо за обратную связь!', time: '1 день', unread: false },
  { id: 3, from: 'Владелец: Горное шале', text: 'Рады, что вам понравилось! Приезжайте ещё — скидка для постоянных гостей.', time: '3 дня', unread: false },
];

const MOCK_PAYMENTS = [
  { id: 1, type: 'card', label: 'Visa •••• 4242', expiry: '08/27', isDefault: true },
  { id: 2, type: 'card', label: 'Mastercard •••• 8910', expiry: '12/26', isDefault: false },
];

const SIDEBAR_NAV = [
  { key: 'home', label: 'Главная', icon: Home },
  { key: 'bookings', label: 'Мои бронирования', icon: Calendar },
  { key: 'favorites', label: 'Избранное', icon: Heart },
  { key: 'reviews', label: 'Отзывы', icon: Star },
  { key: 'messages', label: 'Сообщения', icon: MessageSquare },
  { key: 'settings', label: 'Настройки профиля', icon: Settings },
  { key: 'payment', label: 'Способы оплаты', icon: CreditCard },
  { key: 'invite', label: 'Пригласить друзей', icon: Gift },
];

const CARD = 'bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md';
const CARD_P = 'p-5';

/* ─── Profile Page ─── */
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const [openFavorites, setOpenFavorites] = useState(false);
  const [openBookings, setOpenBookings] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [formName, setFormName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/'); return; }
      setUser(session.user);
      const meta = session.user.user_metadata || {};
      setFormName(meta.first_name || '');
      setFormLastName(meta.last_name || '');
      setFormEmail(session.user.email || '');
      setFormPhone(meta.phone || '');
      setLoading(false);
    });
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase.auth.updateUser({
      email: formEmail,
      data: { first_name: formName, last_name: formLastName, phone: formPhone },
    });
    setSaving(false);
    if (error) {
      setSaveMsg('Ошибка: ' + error.message);
    } else {
      setSaveMsg('Сохранено!');
      // Refresh user state
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      setTimeout(() => setSaveMsg(''), 2500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1f] via-[#111114] to-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.first_name || 'Пользователь';

  return (
    <div className="relative min-h-screen antialiased">
      {/* Background image */}
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />

      <div className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome - full width above sidebar+content */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-1">
              Добро пожаловать, {displayName}!
            </h1>
            <p className="text-sm font-body text-white/60">Управляйте своими бронированиями и настройками</p>
          </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ═══════ SIDEBAR ═══════ */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-72 shrink-0"
          >
            <div className="lg:sticky lg:top-28 space-y-4">
              {/* Profile card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User size={22} className="text-white/70" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-body font-semibold text-white truncate">
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail size={12} className="text-white/50 shrink-0" />
                      <p className="text-xs font-body text-white/60 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {SIDEBAR_NAV.map(item => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveNav(item.key)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-ocean-500/15 text-ocean-400 border border-ocean-500/20'
                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Divider + Logout */}
                <div className="border-t border-white/5 mt-4 pt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body font-medium text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                    <span>Выйти из аккаунта</span>
                  </button>
                </div>
              </div>

              {/* Help card - aligned with content below */}
              <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean-500/15 flex items-center justify-center">
                    <Headphones size={18} className="text-ocean-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-body font-semibold text-white/90">Нужна помощь?</p>
                    <p className="text-xs font-body text-white/50">Мы на связи 24/7</p>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-body font-medium transition-all duration-200">
                  Связаться с нами
                </button>
              </div>
            </div>
          </motion.aside>

          {/* ═══════ MAIN CONTENT ═══════ */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >

              {/* ═══════ HOME ═══════ */}
              {activeNav === 'home' && (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8 space-y-6">
                      {/* Upcoming trip */}
                      <div className={`${CARD} overflow-hidden`}>
                        <div className="p-5 pb-3">
                          <h2 className="text-base font-body font-semibold text-white">Предстоящая поездка</h2>
                        </div>
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-[45%] h-48 md:h-auto shrink-0">
                            <img src={UPCOMING_TRIP.img} alt={UPCOMING_TRIP.name} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-body font-semibold text-white bg-ocean-700/30 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20">
                              <Clock size={12} />Через {UPCOMING_TRIP.daysLeft} дней
                            </span>
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-display font-semibold text-white mb-1">{UPCOMING_TRIP.name}</h3>
                              <div className="flex items-center gap-1.5 mb-3">
                                <MapPin size={14} className="text-white/50" />
                                <span className="text-sm font-body text-white/60">{UPCOMING_TRIP.location}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm font-body text-white/70">
                                <span className="flex items-center gap-1.5"><Calendar size={14} />{UPCOMING_TRIP.dates}</span>
                                <span className="flex items-center gap-1.5"><User size={14} />{UPCOMING_TRIP.guests} гостя</span>
                              </div>
                            </div>
                            <p className="text-lg font-display font-bold text-white mt-4">{UPCOMING_TRIP.price}</p>
                          </div>
                        </div>
                      </div>

                      {/* Favorites collapsible */}
                      <div className={`${CARD} overflow-hidden`}>
                        <button onClick={() => setOpenFavorites(!openFavorites)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <Heart size={18} className="text-rose-400" strokeWidth={1.5} />
                            <h2 className="text-base font-body font-semibold text-white">Избранное</h2>
                            <span className="text-xs font-body text-white/40">{FAVORITES.length}</span>
                          </div>
                          <ChevronRight size={18} className={`text-white/40 transition-transform duration-300 ${openFavorites ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {openFavorites && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                              <div className="px-5 pb-5 space-y-3">
                                {FAVORITES.map(f => (
                                  <div key={f.id} className="flex gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer group">
                                    <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0">
                                      <img src={f.img} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-[10px] font-body font-semibold text-white">{f.type}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                      <div>
                                        <h4 className="text-sm font-body font-semibold text-white truncate">{f.name}</h4>
                                        <p className="text-xs font-body text-white/50 mt-0.5">{f.location}</p>
                                      </div>
                                      <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1.5">
                                          <Star size={13} className="text-amber-400 fill-amber-400" />
                                          <span className="text-xs font-body font-medium text-white">{f.rating}</span>
                                          <span className="text-[11px] font-body text-white/40">({f.reviews})</span>
                                        </div>
                                        <p className="text-sm font-display font-bold text-white">{f.price}<span className="text-white/40 font-body font-normal text-xs"> / ночь</span></p>
                                      </div>
                                    </div>
                                    <button className="self-start shrink-0 w-9 h-9 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors">
                                      <Heart size={15} className="text-rose-400 fill-rose-400" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Past bookings collapsible */}
                      <div className={`${CARD} overflow-hidden`}>
                        <button onClick={() => setOpenBookings(!openBookings)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-ocean-400" strokeWidth={1.5} />
                            <h2 className="text-base font-body font-semibold text-white">История бронирований</h2>
                            <span className="text-xs font-body text-white/40">{PAST_BOOKINGS.length}</span>
                          </div>
                          <ChevronRight size={18} className={`text-white/40 transition-transform duration-300 ${openBookings ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {openBookings && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                              <div className="px-5 pb-5 space-y-3">
                                {PAST_BOOKINGS.map(b => (
                                  <div key={b.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors duration-200">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                      <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-body font-semibold text-white truncate">{b.name}</h4>
                                      <p className="text-xs font-body text-white/50">{b.location} · {b.dates}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-sm font-body font-semibold text-white">{b.price}</p>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-body text-emerald-400/70"><CheckCircle2 size={10} />{b.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="xl:col-span-4 space-y-6">
                      {/* Profile completeness */}
                      <div className={`${CARD} ${CARD_P}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <TrendingUp size={18} className="text-amber-400" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h3 className="text-sm font-body font-semibold text-white/90">Заполненность профиля</h3>
                            <p className="text-xs font-body text-white/50">Добавьте данные для доверия</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl font-display font-bold text-white">80%</span>
                          <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-ocean-500 to-ocean-400" />
                          </div>
                        </div>
                        <button onClick={() => setActiveNav('settings')} className="w-full py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-xs font-body font-semibold shadow-lg shadow-ocean-500/20 transition-all duration-300 active:scale-[0.98]">Заполнить профиль</button>
                      </div>
                      {/* Invite friends */}
                      <div className="bg-gradient-to-br from-ocean-500/15 to-purple-500/10 border border-ocean-500/20 rounded-3xl backdrop-blur-md p-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-body font-semibold text-white mb-1">Пригласите друзей</h3>
                          <p className="text-xs font-body text-white/50 mb-3">Получите скидку 10%</p>
                          <button onClick={() => setActiveNav('invite')} className="px-6 py-2 rounded-xl bg-white text-black text-xs font-body font-medium hover:bg-white/90 transition-all duration-200">Пригласить</button>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-ocean-500/20 flex items-center justify-center shrink-0">
                          <Gift size={22} className="text-ocean-400" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ═══════ BOOKINGS ═══════ */}
              {activeNav === 'bookings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white">Мои бронирования</h2>
                  {/* Upcoming */}
                  <div className={`${CARD} overflow-hidden`}>
                    <div className="p-5 pb-3"><h3 className="text-base font-body font-semibold text-white">Предстоящая</h3></div>
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-[45%] h-48 md:h-auto shrink-0">
                        <img src={UPCOMING_TRIP.img} alt={UPCOMING_TRIP.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-body font-semibold text-white bg-ocean-700/30 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20"><Clock size={12} />Через {UPCOMING_TRIP.daysLeft} дней</span>
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-display font-semibold text-white mb-1">{UPCOMING_TRIP.name}</h4>
                          <div className="flex items-center gap-1.5 mb-3"><MapPin size={14} className="text-white/50" /><span className="text-sm font-body text-white/60">{UPCOMING_TRIP.location}</span></div>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-body text-white/70">
                            <span className="flex items-center gap-1.5"><Calendar size={14} />{UPCOMING_TRIP.dates}</span>
                            <span className="flex items-center gap-1.5"><User size={14} />{UPCOMING_TRIP.guests} гостя</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-lg font-display font-bold text-white">{UPCOMING_TRIP.price}</p>
                          <button className="px-5 py-2 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-xs font-body font-semibold transition-all duration-200">Управлять</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Past */}
                  <div className={`${CARD} ${CARD_P}`}>
                    <h3 className="text-base font-body font-semibold text-white mb-4">Завершённые</h3>
                    <div className="space-y-3">
                      {PAST_BOOKINGS.map(b => (
                        <div key={b.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors duration-200">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"><img src={b.img} alt={b.name} className="w-full h-full object-cover" /></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-body font-semibold text-white truncate">{b.name}</h4>
                            <p className="text-xs font-body text-white/50">{b.location} · {b.dates}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-body font-semibold text-white">{b.price}</p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-body text-emerald-400/70"><CheckCircle2 size={10} />{b.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════ FAVORITES ═══════ */}
              {activeNav === 'favorites' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white">Избранное</h2>
                  <div className="space-y-3">
                    {FAVORITES.map(f => (
                      <div key={f.id} className={`${CARD} flex gap-4 p-3 hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer group`}>
                        <div className="relative w-40 h-28 rounded-xl overflow-hidden shrink-0">
                          <img src={f.img} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-[10px] font-body font-semibold text-white">{f.type}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div>
                            <h4 className="text-base font-body font-semibold text-white truncate">{f.name}</h4>
                            <p className="text-xs font-body text-white/50 mt-0.5">{f.location}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} className="text-amber-400 fill-amber-400" />
                              <span className="text-xs font-body font-medium text-white">{f.rating}</span>
                              <span className="text-[11px] font-body text-white/40">({f.reviews})</span>
                            </div>
                            <p className="text-sm font-display font-bold text-white">{f.price}<span className="text-white/40 font-body font-normal text-xs"> / ночь</span></p>
                          </div>
                        </div>
                        <button className="self-start shrink-0 w-10 h-10 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors">
                          <Heart size={16} className="text-rose-400 fill-rose-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════ REVIEWS ═══════ */}
              {activeNav === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white">Мои отзывы</h2>
                  <div className="space-y-4">
                    {MOCK_REVIEWS.map(r => (
                      <div key={r.id} className={`${CARD} ${CARD_P}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-body font-semibold text-white">{r.property}</h4>
                          <span className="text-xs font-body text-white/40">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                          ))}
                        </div>
                        <p className="text-sm font-body text-white/70 leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════ MESSAGES ═══════ */}
              {activeNav === 'messages' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white">Сообщения</h2>
                  <div className="space-y-3">
                    {MOCK_MESSAGES.map(m => (
                      <div key={m.id} className={`${CARD} ${CARD_P} flex gap-4 items-start cursor-pointer hover:bg-white/[0.06] transition-colors duration-200`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.unread ? 'bg-ocean-500/20' : 'bg-white/5'}`}>
                          <MessageSquare size={18} className={m.unread ? 'text-ocean-400' : 'text-white/40'} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-body font-semibold truncate ${m.unread ? 'text-white' : 'text-white/70'}`}>{m.from}</h4>
                            <span className="text-[11px] font-body text-white/30 shrink-0 ml-2">{m.time}</span>
                          </div>
                          <p className={`text-xs font-body truncate ${m.unread ? 'text-white/60' : 'text-white/40'}`}>{m.text}</p>
                        </div>
                        {m.unread && <div className="w-2.5 h-2.5 rounded-full bg-ocean-500 shrink-0 mt-2" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════ SETTINGS ═══════ */}
              {activeNav === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white">Настройки профиля</h2>
                  {/* Personal info */}
                  <div className={`${CARD} ${CARD_P}`}>
                    <h3 className="text-base font-body font-semibold text-white mb-4">Личные данные</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-body text-white/50 mb-1.5 block">Имя</label>
                        <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-body text-white/50 mb-1.5 block">Фамилия</label>
                        <input type="text" value={formLastName} onChange={e => setFormLastName(e.target.value)} placeholder="Введите фамилию" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-body text-white/50 mb-1.5 block">Email</label>
                        <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-body text-white/50 mb-1.5 block">Телефон</label>
                        <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+7 (___) ___-__-__" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 disabled:opacity-50 text-white text-xs font-body font-semibold transition-all duration-200">
                        <Save size={14} />{saving ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      {saveMsg && <span className={`text-xs font-body ${saveMsg === 'Сохранено!' ? 'text-emerald-400' : 'text-rose-400'}`}>{saveMsg}</span>}
                    </div>
                  </div>
                  {/* Password */}
                  <div className={`${CARD} ${CARD_P}`}>
                    <h3 className="text-base font-body font-semibold text-white mb-4">Смена пароля</h3>
                    <div className="space-y-3 max-w-md">
                      <div>
                        <label className="text-xs font-body text-white/50 mb-1.5 block">Текущий пароль</label>
                        <div className="relative">
                          <input type={showPw ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-body text-white/50 mb-1.5 block">Новый пароль</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                      </div>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-xs font-body font-semibold transition-all duration-200">
                        <Lock size={14} />Обновить пароль
                      </button>
                    </div>
                  </div>
                  {/* Notifications */}
                  <div className={`${CARD} ${CARD_P}`}>
                    <h3 className="text-base font-body font-semibold text-white mb-4">Уведомления</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-body text-white">Email-уведомления</p>
                          <p className="text-xs font-body text-white/40">Бронирования, отзывы, акции</p>
                        </div>
                        <button onClick={() => setNotifEmail(!notifEmail)} className={`w-11 h-6 rounded-full transition-colors duration-200 ${notifEmail ? 'bg-ocean-500' : 'bg-white/10'} relative`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${notifEmail ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-body text-white">Push-уведомления</p>
                          <p className="text-xs font-body text-white/40">Мгновенные оповещения</p>
                        </div>
                        <button onClick={() => setNotifPush(!notifPush)} className={`w-11 h-6 rounded-full transition-colors duration-200 ${notifPush ? 'bg-ocean-500' : 'bg-white/10'} relative`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${notifPush ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════ PAYMENT ═══════ */}
              {activeNav === 'payment' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-semibold text-white">Способы оплаты</h2>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-xs font-body font-semibold transition-all duration-200">
                      <Plus size={14} />Добавить карту
                    </button>
                  </div>
                  <div className="space-y-3">
                    {MOCK_PAYMENTS.map(p => (
                      <div key={p.id} className={`${CARD} ${CARD_P} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <CreditCard size={20} className="text-white/50" />
                          </div>
                          <div>
                            <p className="text-sm font-body font-semibold text-white">{p.label}</p>
                            <p className="text-xs font-body text-white/40">Истекает {p.expiry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {p.isDefault && <span className="text-[11px] font-body text-ocean-400 bg-ocean-500/15 px-2.5 py-1 rounded-full">По умолчанию</span>}
                          <button className="text-white/30 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════ INVITE ═══════ */}
              {activeNav === 'invite' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white">Пригласите друзей</h2>
                  <div className="bg-gradient-to-br from-ocean-500/15 to-purple-500/10 border border-ocean-500/20 rounded-3xl backdrop-blur-md p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-ocean-500/20 flex items-center justify-center">
                        <Gift size={30} className="text-ocean-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-semibold text-white">Получите скидку 10%</h3>
                        <p className="text-sm font-body text-white/50">За каждого приглашённого друга</p>
                      </div>
                    </div>
                    <p className="text-sm font-body text-white/70 mb-6 leading-relaxed">Поделитесь ссылкой с друзьями. Когда они зарегистрируются и совершат первое бронирование, вы оба получите скидку 10% на следующую поездку.</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-body text-white/60 truncate">
                        https://moremest.com/ref/{user?.id?.slice(0, 8) || 'abc12345'}
                      </div>
                      <button
                        onClick={() => { navigator.clipboard?.writeText(`https://moremest.com/ref/${user?.id?.slice(0, 8) || 'abc12345'}`); setInviteCopied(true); setTimeout(() => setInviteCopied(false), 2000); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-xs font-body font-medium hover:bg-white/90 transition-all duration-200 shrink-0"
                      >
                        <Copy size={14} />{inviteCopied ? 'Скопировано!' : 'Копировать'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
