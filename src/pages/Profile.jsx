import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, LogOut, Calendar, Heart, Settings, Phone, Home,
  Star, MessageSquare, CreditCard, Gift, Headphones, ChevronRight,
  MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp,
  Save, Shield, Bell, Eye, EyeOff, Lock, Edit3, Plus, Trash2, Send, Copy, Building2, X
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
  { key: 'myproperties', label: 'Мои объекты', icon: Building2 },
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
  const [myProperties, setMyProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editPhotos, setEditPhotos] = useState([]);
  const [uploadingEditPhotos, setUploadingEditPhotos] = useState(false);

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

  const TYPE_LABELS = { apartment: 'Квартира', house: 'Дом / Вилла', hotel: 'Отель', guesthouse: 'Гостевой дом', room: 'Номер в гостинице', 'Квартира': 'Квартира', 'Дом / Вилла': 'Дом / Вилла', 'Отель': 'Отель', 'Гостиница': 'Гостевой дом', 'Гостевой дом': 'Гостевой дом' };

  const OBJECT_TYPE_OPTIONS = [
    { value: 'Квартира', label: 'Квартира' },
    { value: 'Дом / Вилла', label: 'Дом / Вилла' },
    { value: 'Номер в гостинице', label: 'Номер в гостинице' },
    { value: 'Гостевой дом', label: 'Гостевой дом' },
  ];

  const LEGAL_STATUS_OPTIONS = [
    { value: 'individual', label: 'Физ. лицо' },
    { value: 'selfemployed', label: 'Самозанятый' },
    { value: 'ip', label: 'ИП' },
    { value: 'ooo', label: 'ООО' },
  ];

  const formatPhone = (raw) => {
    const d = raw.replace(/\D/g, '');
    if (d.length === 0) return '';
    if (d.length <= 1) return '+' + d;
    if (d.length <= 4) return `+${d[0]} (${d.slice(1)}`;
    if (d.length <= 7) return `+${d[0]} (${d.slice(1,4)}) ${d.slice(4)}`;
    if (d.length <= 9) return `+${d[0]} (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
    return `+${d[0]} (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;
  };

  const isValidPhone = (phone) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);

  const setEditMainPhoto = (url) => {
    setEditPhotos((prev) => {
      const rest = prev.filter((p) => p !== url);
      return [url, ...rest];
    });
  };

  const startEdit = (p) => {
    const addrParts = (p.address || '').split(',').map(s => s.trim());
    const streetVal = addrParts.length > 1 ? addrParts.slice(0, -1).join(', ') : addrParts[0] || '';
    const houseVal = addrParts.length > 1 ? addrParts[addrParts.length - 1] : '';
    setEditingId(p.id);
    setEditForm({
      name: p.name || '',
      description: p.description || '',
      type: p.type || '',
      city: p.city || '',
      street: streetVal,
      house: houseVal,
      rooms: p.rooms?.toString() || '',
      price: p.price?.toString() || '',
      phone: p.owner_phone || '',
      amenities: p.amenities || [],
      legalStatus: p.legal_status || '',
      is_published: p.is_published,
    });
    setEditPhotos(p.images || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditPhotos([]);
  };

  const saveEdit = async (propertyId) => {
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          name: editForm.name,
          description: editForm.description,
          type: editForm.type,
          city: editForm.city,
          address: [editForm.street, editForm.house].filter(Boolean).join(', '),
          rooms: Number(editForm.rooms) || 1,
          price: Number(editForm.price) || 0,
          owner_phone: editForm.phone,
          amenities: editForm.amenities,
          legal_status: editForm.legalStatus,
          is_published: editForm.is_published,
          img: editPhotos[0] || '/img/placeholder.jpg',
          images: editPhotos,
        })
        .eq('id', propertyId);
      if (error) throw error;
      setEditingId(null);
      fetchMyProperties();
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditPhotoUpload = async (files) => {
    if (!user || !files.length) return;
    setUploadingEditPhotos(true);
    const uploaded = [];
    try {
      for (const file of files) {
        if (editPhotos.length + uploaded.length >= 10) break;
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
        uploaded.push(urlData.publicUrl);
      }
      setEditPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      alert('Ошибка загрузки фото: ' + err.message);
    } finally {
      setUploadingEditPhotos(false);
    }
  };

  const removeEditPhoto = (url) => {
    setEditPhotos((prev) => prev.filter((p) => p !== url));
  };

  const toggleEditAmenity = (value) => {
    setEditForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value],
    }));
  };

  const AMENITY_LABELS = { wifi: 'Wi-Fi', tv: 'ТВ', ac: 'Кондиционер', laundry: 'Стиральная машина', parking: 'Парковка', kitchen: 'Кухня', bed: 'Двуспальная кровать', pool: 'Бассейн', fireplace: 'Камин', bathhouse: 'Баня', bbq: 'Мангал', yard: 'Двор', garden: 'Сад', terrace: 'Терраса', balcony: 'Балкон', stove: 'Печь', hammock: 'Гамак', breakfast: 'Завтрак', dining: 'Питание', spa: 'Спа', shower: 'Душ', jacuzzi: 'Джакузи', vineyard: 'Виноградник', security: 'Охрана', restaurant: 'Ресторан', sea_view: 'Вид на море', mountain_view: 'Вид на горы', city_view: 'Вид на город', forest_view: 'Вид на лес', sunbeds: 'Шезлонги', ski_room: 'Лыжная комната', banquet: 'Банкетный зал', campfire: 'Кострище', linens: 'Постельное бельё', spring: 'Источник', eco_heat: 'Эко-отопление', pets: 'С питомцами' };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchMyProperties = async () => {
    if (!user) return;
    setLoadingProps(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMyProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err.message);
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    if (activeNav === 'myproperties' && user) {
      fetchMyProperties();
    }
  }, [activeNav, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

              {/* ═══════ MY PROPERTIES ═══════ */}
              {activeNav === 'myproperties' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-semibold text-white">Мои объекты</h2>
                    <button
                      onClick={() => navigate('/add-property')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold shadow-lg shadow-ocean-500/20 transition-all duration-300 active:scale-[0.97]"
                    >
                      <Plus size={16} />
                      Добавить
                    </button>
                  </div>

                  {loadingProps ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : myProperties.length === 0 ? (
                    <div className={`${CARD} p-10 text-center`}>
                      <div className="w-16 h-16 rounded-2xl bg-ocean-500/15 flex items-center justify-center mx-auto mb-5">
                        <Building2 size={28} className="text-ocean-400" />
                      </div>
                      <h3 className="text-lg font-display font-semibold text-white mb-2">Пока нет объектов</h3>
                      <p className="text-sm font-body text-white/50 mb-6">Добавьте свой первый объект и начните получать гостей</p>
                      <button
                        onClick={() => navigate('/add-property')}
                        className="px-6 py-3 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold shadow-lg shadow-ocean-500/20 transition-all duration-300"
                      >
                        Добавить объект
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myProperties.map((p) => (
                        <div key={p.id} className={`${CARD} overflow-hidden`}>
                          {editingId === p.id ? (
                            /* ── РЕЖИМ РЕДАКТИРОВАНИЯ ── */
                            <div className="p-5 sm:p-6 space-y-5">
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-body font-semibold text-white">Редактирование</h3>
                                <div className="flex items-center gap-2">
                                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-body font-medium transition-all">Отмена</button>
                                  <button
                                    onClick={() => saveEdit(p.id)}
                                    disabled={savingEdit}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-ocean-500 hover:bg-ocean-400 text-white text-xs font-body font-semibold transition-all disabled:opacity-50"
                                  >
                                    <Save size={13} />
                                    {savingEdit ? 'Сохранение...' : 'Сохранить'}
                                  </button>
                                </div>
                              </div>

                              {/* Фото */}
                              <div>
                                <label className="text-white/50 font-body text-xs mb-2 block">Фотографии</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                                  {editPhotos.map((url, i) => (
                                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                      <button onClick={() => setEditMainPhoto(url)} className={`absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-opacity ${i === 0 ? 'bg-ocean-500/80 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
                                        <Star size={14} className={i === 0 ? 'text-white fill-white' : 'text-white/70'} />
                                      </button>
                                      <button onClick={() => removeEditPhoto(url)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={14} className="text-white" />
                                      </button>
                                      {i === 0 && <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-ocean-500/80 text-[10px] font-body font-semibold text-white">Главное</span>}
                                    </div>
                                  ))}
                                  <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingEditPhotos ? 'border-ocean-500/40' : 'border-white/15 hover:border-ocean-500/40'}`}>
                                    <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => handleEditPhotoUpload(Array.from(e.target.files))} disabled={uploadingEditPhotos || editPhotos.length >= 10} />
                                    {uploadingEditPhotos ? <div className="w-5 h-5 border border-ocean-500 border-t-transparent rounded-full animate-spin" /> : <Plus size={22} className="text-white/30" />}
                                    <span className="text-white/25 text-[10px] font-body mt-1">Добавить</span>
                                  </label>
                                </div>
                              </div>

                              {/* Поля */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Название</label>
                                  <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-white/50 font-body text-xs mb-1.5 block">Тип объекта</label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {OBJECT_TYPE_OPTIONS.map(o => (
                                      <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => setEditForm({...editForm, type: o.value})}
                                        className={`px-3 py-2 rounded-xl text-xs font-body transition-all duration-200 ${editForm.type === o.value ? 'bg-ocean-500/20 border border-ocean-500/40 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
                                      >
                                        {o.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Город</label>
                                  <input value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2">
                                    <label className="text-white/50 font-body text-xs mb-1 block">Улица</label>
                                    <input value={editForm.street || ''} onChange={(e) => setEditForm({...editForm, street: e.target.value})} placeholder="ул. Ленина" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                  </div>
                                  <div>
                                    <label className="text-white/50 font-body text-xs mb-1 block">Дом</label>
                                    <input value={editForm.house || ''} onChange={(e) => setEditForm({...editForm, house: e.target.value})} placeholder="15" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Комнат</label>
                                  <input type="number" min="1" value={editForm.rooms} onChange={(e) => setEditForm({...editForm, rooms: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                </div>
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Цена ₽/ночь</label>
                                  <input type="number" min="1" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                </div>
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Телефон</label>
                                  <input type="tel" value={editForm.phone} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ''); if (raw.length <= 11) setEditForm({...editForm, phone: formatPhone(raw)}); }} placeholder="+7 (___) ___-__-__" className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none transition-colors ${editForm.phone && !isValidPhone(editForm.phone) ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-ocean-500/50'}`} />
                                  {editForm.phone && !isValidPhone(editForm.phone) && <p className="text-red-400/70 text-[10px] font-body mt-1">Введите номер в формате +7 (XXX) XXX-XX-XX</p>}
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-white/50 font-body text-xs mb-1.5 block">Юридический статус</label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {LEGAL_STATUS_OPTIONS.map(o => (
                                      <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => setEditForm({...editForm, legalStatus: o.value})}
                                        className={`px-3 py-2 rounded-xl text-xs font-body transition-all duration-200 ${editForm.legalStatus === o.value ? 'bg-ocean-500/20 border border-ocean-500/40 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
                                      >
                                        {o.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Описание */}
                              <div>
                                <label className="text-white/50 font-body text-xs mb-1 block">Описание</label>
                                <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors resize-none" />
                              </div>

                              {/* Удобства */}
                              <div>
                                <label className="text-white/50 font-body text-xs mb-2 block">Удобства</label>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => toggleEditAmenity(key)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${editForm.amenities?.includes(key) ? 'bg-ocean-500/20 border border-ocean-500/40 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Переключатель публикации */}
                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-sm font-body text-white/60">Публикация</span>
                                <button
                                  onClick={() => setEditForm({...editForm, is_published: !editForm.is_published})}
                                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${editForm.is_published ? 'bg-ocean-500' : 'bg-white/10'}`}
                                >
                                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${editForm.is_published ? 'translate-x-5' : ''}`} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ── РЕЖИМ ПРОСМОТРА ── */
                            <>
                              {/* Фото-гелерея */}
                              <div className="p-5 sm:p-6">
                                {(p.images && p.images.length > 0) ? (
                                  <div className="grid grid-cols-3 gap-4 mb-4">
                                    {p.images.map((url, i) => (
                                      <div key={url} className="aspect-video rounded-xl overflow-hidden">
                                        <img src={url} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="aspect-video rounded-xl overflow-hidden mb-4">
                                    <img src={p.img || '/img/placeholder.jpg'} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-body font-semibold backdrop-blur-xl border mb-3 ${
                                  p.is_published
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                    : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                                }`}>
                                  {p.is_published ? 'Активен' : 'Черновик'}
                                </span>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="text-lg font-display font-semibold text-white">{p.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <MapPin size={14} className="text-white/40" />
                                      <span className="text-sm font-body text-white/50">{p.city}{p.address ? `, ${p.address}` : ''}</span>
                                    </div>
                                  </div>
                                  <p className="text-xl font-display font-bold text-white shrink-0">
                                    {Number(p.price).toLocaleString('ru-RU')} ₽
                                    <span className="text-white/40 font-body font-normal text-sm"> / ночь</span>
                                  </p>
                                </div>

                                {p.description && (
                                  <p className="text-sm font-body text-white/50 leading-relaxed mb-4">{p.description}</p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-body text-white/40">
                                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">{TYPE_LABELS[p.type] || p.type}</span>
                                  <span>{p.rooms} {p.rooms === 1 ? 'комната' : p.rooms < 5 ? 'комнаты' : 'комнат'}</span>
                                  {p.amenities && p.amenities.length > 0 && (
                                    <>
                                      <span>·</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {p.amenities.map((a) => (
                                          <span key={a} className="px-2 py-0.5 rounded-md bg-ocean-500/10 text-ocean-400 text-xs">{AMENITY_LABELS[a] || a}</span>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {p.owner_phone && (
                                  <div className="flex items-center gap-2 text-sm font-body text-white/40 mb-4">
                                    <Phone size={14} />
                                    <span>{p.owner_phone}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                  <button
                                    onClick={() => startEdit(p)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ocean-500/15 hover:bg-ocean-500/25 border border-ocean-500/30 text-ocean-400 text-sm font-body font-semibold transition-all duration-200"
                                  >
                                    <Edit3 size={14} />
                                    Редактировать
                                  </button>
                                  <button
                                    onClick={() => navigate(`/property/${p.id}`)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-body font-medium transition-all duration-200"
                                  >
                                    <Eye size={14} />
                                    Просмотр
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm('Удалить объект?')) return;
                                      await supabase.from('properties').delete().eq('id', p.id);
                                      fetchMyProperties();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/30 hover:text-red-400 text-sm font-body font-medium transition-all duration-200 ml-auto"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
