import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Mail, LogOut, Calendar, Heart, Settings, Phone, Home,
  Star, MessageSquare, CreditCard, Gift, Headphones, ChevronRight,
  MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp,
  Save, Shield, Bell, Eye, EyeOff, Lock, Edit3, Plus, Trash2, Send, Copy, Building2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import { useFavorites } from '../hooks/useFavorites';

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

const MOCK_PAYMENTS = [
  { id: 1, type: 'card', label: 'Visa •••• 4242', expiry: '08/27', isDefault: true },
  { id: 2, type: 'card', label: 'Mastercard •••• 8910', expiry: '12/26', isDefault: false },
];

const SIDEBAR_NAV = [
  { key: 'myproperties', label: 'Мои объекты', icon: Building2 },
  { key: 'messages', label: 'Сообщения', icon: MessageSquare },
  { key: 'reviews', label: 'Отзывы', icon: Star },
  { key: 'favorites', label: 'Избранное', icon: Heart },
  { key: 'settings', label: 'Настройки профиля', icon: Settings },
];

const CARD = 'bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md';
const CARD_P = 'p-5';

/* ─── Profile Page ─── */
const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState(searchParams.get('tab') || 'myproperties');
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { isFavorite, toggleFavorite, getFavoriteProperties } = useFavorites();
  const [favProperties, setFavProperties] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [openChatId, setOpenChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatChannelRef = React.useRef(null);
  const chatBottomRef = React.useRef(null);

  // Read chat param from URL for direct links
  useEffect(() => {
    const chatParam = searchParams.get('chat');
    if (chatParam && activeNav === 'messages' && user && !openChatId) {
      openChat(chatParam);
    }
  }, [searchParams, activeNav, user]);

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

  const TYPE_LABELS = { apartment: 'Квартира', house: 'Дом', mini_hotel: 'Гостиница', hotel: 'Гостиница', large_hotel: 'Отель', 'Квартира': 'Квартира', 'Дом / Вилла': 'Дом', 'Отель': 'Отель', 'Гостиница': 'Гостиница', 'Гостевой дом': 'Гостиница', 'Мини-гостиница': 'Гостиница', 'Квартира / Дом': 'Квартира', 'Крупный отель': 'Отель' };

  const OBJECT_TYPE_OPTIONS = [
    { value: 'apartment', label: 'Квартира', sub: '1 объект размещения' },
    { value: 'house', label: 'Дом', sub: '1 объект размещения' },
    { value: 'hotel', label: 'Гостиница', sub: '2–10 номеров' },
    { value: 'large_hotel', label: 'Отель', sub: '11+ номеров' },
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
    const TYPE_REVERSE = {
      'Квартира / Дом': 'apartment', 'Квартира': 'apartment', apartment: 'apartment',
      'Дом / Вилла': 'house', 'Дом': 'house', house: 'house',
      'Мини-гостиница': 'hotel', 'Мини гостиница': 'hotel', 'Гостевой дом': 'hotel', guesthouse: 'hotel', room: 'hotel', mini_hotel: 'hotel',
      'Гостиница': 'hotel', hotel: 'hotel',
      'Крупный отель': 'large_hotel', 'Отель': 'large_hotel', large_hotel: 'large_hotel',
    };
    const typeVal = OBJECT_TYPE_OPTIONS.find(o => o.label === p.type)?.value || TYPE_REVERSE[p.type] || p.type;
    setEditingId(p.id);
    setEditForm({
      name: p.name || '',
      description: p.description || '',
      type: typeVal,
      city: p.city || '',
      street: streetVal,
      house: houseVal,
      rooms: p.rooms?.toString() || '',
      guests: p.guests?.toString() || '',
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
          type: OBJECT_TYPE_OPTIONS.find(o => o.value === editForm.type)?.label || editForm.type,
          city: editForm.city,
          address: [editForm.street, editForm.house].filter(Boolean).join(', '),
          rooms: Number(editForm.rooms) || 1,
          guests: Number(editForm.guests) || 1,
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

  const fetchChats = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, property_id, host_id, guest_id, created_at,
          properties(name, img, images, city, address)
        `)
        .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch last message + unread count for each chat
      const chatsWithMeta = await Promise.all((data || []).map(async (c) => {
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at, is_read')
          .eq('chat_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', c.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        return {
          ...c,
          last_message: msgs?.[0] || null,
          unread_count: count || 0,
        };
      }));

      setChats(chatsWithMeta);
    } catch (err) {
      console.error('Error fetching chats:', err.message);
    } finally {
      setLoadingChats(false);
    }
  };

  // Open a chat — load messages + realtime
  const openChat = async (chatId) => {
    setOpenChatId(chatId);

    // Fetch chat info
    const { data: ci } = await supabase
      .from('chats')
      .select('*, properties(name, img, images, city, address, owner_name, price, type, user_id)')
      .eq('id', chatId)
      .single();
    setChatInfo(ci);

    // Fetch messages
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    setChatMessages(msgs || []);

    // Mark unread as read + refresh chat list
    if (user && msgs) {
      const unreadIds = msgs.filter(m => !m.is_read && m.sender_id !== user.id).map(m => m.id);
      if (unreadIds.length) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        fetchChats(); // refresh unread counts
      }
    }

    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
  };

  // Realtime for open chat
  useEffect(() => {
    if (!openChatId) return;

    // Cleanup previous channel
    if (chatChannelRef.current) {
      supabase.removeChannel(chatChannelRef.current);
      chatChannelRef.current = null;
    }

    const ch = supabase
      .channel(`msg:${openChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${openChatId}` }, (p) => {
        setChatMessages(prev => prev.some(m => m.id === p.new.id) ? prev : [...prev, p.new]);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .subscribe();
    chatChannelRef.current = ch;

    return () => {
      if (chatChannelRef.current) {
        supabase.removeChannel(chatChannelRef.current);
        chatChannelRef.current = null;
      }
    };
  }, [openChatId]);

  // Send message
  const handleChatSend = async (e) => {
    e.preventDefault();
    const t = chatInput.trim();
    if (!t || !user || chatSending || !openChatId) return;
    setChatSending(true);
    setChatInput('');
    await supabase.from('messages').insert({ chat_id: openChatId, sender_id: user.id, content: t });
    setChatSending(false);
    // Refresh chat list
    fetchChats();
  };

  const closeChat = () => {
    setOpenChatId(null);
    setChatMessages([]);
    setChatInfo(null);
    if (chatChannelRef.current) {
      supabase.removeChannel(chatChannelRef.current);
      chatChannelRef.current = null;
    }
    fetchChats();
  };

  useEffect(() => {
    if (activeNav === 'myproperties' && user) {
      fetchMyProperties();
    }
    if (activeNav === 'favorites' && user) {
      setLoadingFavs(true);
      getFavoriteProperties().then((data) => {
        setFavProperties(data);
        setLoadingFavs(false);
      });
    }
    if (activeNav === 'messages' && user) {
      setLoadingChats(true);
      fetchChats();
      // Auto-open chat from URL
      const chatParam = searchParams.get('chat');
      if (chatParam) setOpenChatId(chatParam);
    }
    if (activeNav !== 'messages') {
      setOpenChatId(null);
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
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto items-start">

          {/* ═══════ SIDEBAR ═══════ */}
          <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Личный кабинет</h1>

            {/* Mobile: horizontal tab bar */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {SIDEBAR_NAV.map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-ocean-500/15 text-ocean-400 border border-ocean-500/20'
                        : 'bg-white/5 text-white/60 border border-white/10'
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: full sidebar card */}
            <div className="hidden lg:flex bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 flex-col">
              {/* Profile info + Navigation */}
              <div>
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
              </div>

              {/* Bottom: Help + Logout — pushed to bottom via mt-auto */}
              <div className="mt-auto space-y-3 pt-6">
                <div className="bg-ocean-500/10 border border-ocean-500/15 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-ocean-500/20 flex items-center justify-center shrink-0">
                    <Headphones size={16} className="text-ocean-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-body font-semibold text-white/80">Нужна помощь?</p>
                    <p className="text-[10px] font-body text-white/40">Мы на связи 24/7</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body font-medium text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                    <span>Выйти из аккаунта</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ═══════ MAIN CONTENT ═══════ */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {activeNav === 'myproperties' ? 'Мои объекты' :
                 activeNav === 'messages' ? 'Сообщения' :
                 activeNav === 'reviews' ? 'Отзывы' :
                 activeNav === 'favorites' ? 'Избранное' :
                 activeNav === 'settings' ? 'Настройки профиля' : ''}
              </h2>
              {activeNav === 'myproperties' && (
                <button
                  onClick={() => navigate('/add-property')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold shadow-lg shadow-ocean-500/20 transition-all duration-300 active:scale-[0.97]"
                >
                  <Plus size={16} />
                  Добавить
                </button>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >

              {/* ═══════ MY PROPERTIES ═══════ */}
              {activeNav === 'myproperties' && (
                <div className="space-y-6">

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
                                  <h3 className="text-lg font-body font-semibold text-white">Редактирование</h3>
                                  <div className="flex items-center gap-3">
                                    <button onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-body font-medium transition-all">Отмена</button>
                                    <button
                                      onClick={() => saveEdit(p.id)}
                                      disabled={savingEdit || (() => { const r = Number(editForm.rooms); const ranges = { apartment: [1,1], house: [1,1], hotel: [2,10], large_hotel: [11,999] }; const range = ranges[editForm.type]; return range && editForm.rooms && (r < range[0] || r > range[1]); })()}
                                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold transition-all disabled:opacity-50"
                                    >
                                      <Save size={15} />
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
                                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-body transition-all duration-200 ${editForm.type === o.value ? 'bg-ocean-500/20 border border-ocean-500/40 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
                                      >
                                        <span className="font-medium">{o.label}</span>
                                        <span className="text-[10px] text-white/30">{o.sub}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Город</label>
                                  <input value={editForm.city} onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > 0 && !val.startsWith('г. ')) val = 'г. ' + val.replace(/^[гГ][.\s]*/, '');
                                    setEditForm({...editForm, city: val});
                                  }} placeholder="г. Геленджик" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2">
                                    <label className="text-white/50 font-body text-xs mb-1 block">Улица</label>
                                    <input value={editForm.street || ''} onChange={(e) => {
                                      let val = e.target.value;
                                      if (val.length > 0 && !val.startsWith('ул. ')) val = 'ул. ' + val.replace(/^[уУ][лЛ][.\s]*/, '');
                                      setEditForm({...editForm, street: val});
                                    }} placeholder="ул. Ленина" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                  </div>
                                  <div>
                                    <label className="text-white/50 font-body text-xs mb-1 block">Дом</label>
                                    <input value={editForm.house || ''} onChange={(e) => setEditForm({...editForm, house: e.target.value})} placeholder="15" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-white/50 font-body text-xs mb-1 block">Количество номеров</label>
                                    <input type="text" inputMode="numeric" value={editForm.rooms} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, rooms: v}); }} placeholder="Номеров" className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none transition-colors ${(() => { const r = Number(editForm.rooms); if (!editForm.type || !editForm.rooms) return 'border-white/10 focus:border-ocean-500/50'; if ((editForm.type === 'apartment' || editForm.type === 'house') && r !== 1) return 'border-red-500/50 focus:border-red-500/70'; if (editForm.type === 'hotel' && (r < 2 || r > 10)) return 'border-red-500/50 focus:border-red-500/70'; if (editForm.type === 'large_hotel' && r < 11) return 'border-red-500/50 focus:border-red-500/70'; return 'border-white/10 focus:border-ocean-500/50'; })()}`} />
                                    {(() => {
                                      const r = Number(editForm.rooms);
                                      const ranges = { apartment: [1,1], house: [1,1], hotel: [2,10], large_hotel: [11,999] };
                                      const range = ranges[editForm.type];
                                      if (range && editForm.rooms && (r < range[0] || r > range[1])) {
                                        return <p className="text-red-400/70 text-[10px] font-body mt-1">Для «{OBJECT_TYPE_OPTIONS.find(o => o.value === editForm.type)?.label}» допустимо {range[0]}{range[1] < 999 ? `–${range[1]}` : '+'} номер{range[0] === 1 && range[1] === 1 ? '' : 'ов'}</p>;
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div>
                                    <label className="text-white/50 font-body text-xs mb-1 block">Гостей на номер</label>
                                    <input type="text" inputMode="numeric" value={editForm.guests || ''} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, guests: v}); }} placeholder="Макс. гостей" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-white/50 font-body text-xs mb-1 block">Цена ₽/ночь</label>
                                  <input type="text" inputMode="numeric" value={editForm.price} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, price: v}); }} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-ocean-500/50 transition-colors" />
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
                                  {p.is_published ? 'Активен' : 'Архив'}
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
                                  <span>·</span>
                                  <span>{p.guests || 1} {p.guests === 1 ? 'гость' : p.guests < 5 ? 'гостя' : 'гостей'}</span>
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
                                    onClick={() => { setDeleteTarget(p.id); setDeletePassword(''); setDeleteError(''); }}
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

              {/* ═══════ REVIEWS ═══════ */}
              {activeNav === 'reviews' && (
                <div className="space-y-6">
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
                <AnimatePresence mode="wait">
                {openChatId ? (
                  /* ─── Inline chat view ─── */
                  <motion.div
                    key="chat-open"
                    initial={{ opacity: 0, x: 30, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col"
                    style={{ minHeight: '70vh' }}
                  >
                    {/* Chat header */}
                    <div className="shrink-0 border-b border-white/10 px-5 py-3 flex items-center gap-3">
                      <button onClick={closeChat} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0">
                        <ChevronRight size={16} className="text-white/60 rotate-180" />
                      </button>
                      {chatInfo?.properties && (
                        <>
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={chatInfo.properties.images?.[0] || chatInfo.properties.img || '/img/placeholder.jpg'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-body font-semibold text-sm truncate">{chatInfo.properties.name}</p>
                            <p className="text-white/40 font-body text-xs truncate">
                              {chatInfo.properties.city}{chatInfo.properties.address ? `, ${chatInfo.properties.address}` : ''}
                            </p>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <span className="px-3.5 py-2 rounded-lg bg-white/10 border border-white/15 text-sm font-body text-white font-bold">
                              {chatInfo.properties.owner_name || 'Собственник'}
                            </span>
                            {chatInfo.properties.price ? (
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-body text-white/40">
                                {Number(chatInfo.properties.price).toLocaleString('ru-RU')} ₽/ночь
                              </span>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                      {chatMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <MessageSquare size={28} className="text-white/10 mx-auto mb-3" />
                          <p className="text-white/25 font-body text-sm">Начните диалог</p>
                        </div>
                      )}
                      <div className="flex flex-col gap-4">
                      {chatMessages.map((msg, i) => {
                        const own = msg.sender_id === user?.id;
                        const prev = i > 0 ? chatMessages[i - 1] : null;
                        const samePrev = prev && prev.sender_id === msg.sender_id;
                        const next = i < chatMessages.length - 1 ? chatMessages[i + 1] : null;
                        const sameNext = next && next.sender_id === msg.sender_id;
                        const isTail = !sameNext;

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`relative w-fit max-w-[80%] sm:max-w-[65%] px-4 py-2.5 ${
                                own
                                  ? `bg-ocean-500 text-white ${isTail ? 'rounded-[20px] rounded-br-[6px]' : 'rounded-[20px]'}`
                                  : `bg-white/[0.08] border border-white/[0.06] text-white/90 ${isTail ? 'rounded-[20px] rounded-bl-[6px]' : 'rounded-[20px]'}`
                              }`}
                            >
                              <p className="font-body text-[15px] leading-[1.4] break-words whitespace-pre-wrap">{msg.content}</p>
                              <span className={`block text-[10px] font-body tabular-nums mt-0.5 ${own ? 'text-white/40' : 'text-white/25'} text-right`}>
                                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                      </div>
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Input */}
                    <div className="shrink-0 border-t border-white/10 px-4 py-3">
                      <form onSubmit={handleChatSend} className="flex items-center gap-2.5">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Написать сообщение..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-white font-body text-sm placeholder-white/25 focus:outline-none focus:border-ocean-500/40 transition-colors"
                          disabled={chatSending}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || chatSending}
                          className="w-10 h-10 rounded-full bg-ocean-500 hover:bg-ocean-400 flex items-center justify-center transition-all duration-200 disabled:opacity-20 shrink-0 active:scale-90"
                        >
                          <Send size={16} className="text-white ml-0.5" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  /* ─── Chat list ─── */
                <motion.div
                  key="chat-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {loadingChats ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare size={32} className="text-white/15 mx-auto mb-3" />
                      <p className="text-white/40 font-body text-sm">Пока нет сообщений</p>
                      <p className="text-white/25 font-body text-xs mt-1">Напишите хозяину жилья, чтобы начать диалог</p>
                    </div>
                  ) : (
                  <div className="space-y-3">
                    {chats.map(c => (
                      <div
                        key={c.id}
                        onClick={() => openChat(c.id)}
                        className={`${CARD} ${CARD_P} flex gap-4 items-start cursor-pointer hover:bg-white/[0.06] transition-colors duration-200 group`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={c.properties?.images?.[0] || c.properties?.img || '/img/placeholder.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-body font-semibold text-white truncate">{c.properties?.name || 'Объект'}</h4>
                            <span className="text-[11px] font-body text-white/30 shrink-0 ml-2">
                              {c.last_message?.created_at ? new Date(c.last_message.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs font-body text-white/40 truncate">
                            {c.last_message?.content || 'Нет сообщений'}
                          </p>
                        </div>
                        {c.unread_count > 0 && (
                          <div className="w-5 h-5 rounded-full bg-ocean-500 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-body font-bold text-white">{c.unread_count}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  )}
                </motion.div>
                )}
                </AnimatePresence>
              )}

              {/* ═══════ SETTINGS ═══════ */}
              {activeNav === 'settings' && (
                <div className="space-y-6">
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

              {/* ═══════ FAVORITES ═══════ */}
              {activeNav === 'favorites' && (
                <div className="space-y-6">
                  {loadingFavs ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : favProperties.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart size={32} className="text-white/15 mx-auto mb-3" />
                      <p className="text-white/40 font-body text-sm">Пока ничего в избранном</p>
                      <p className="text-white/25 font-body text-xs mt-1">Нажмите ♡ на карточке жилья, чтобы добавить</p>
                    </div>
                  ) : (
                  <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {favProperties.map(f => (
                      <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60, scale: 0.95, transition: { duration: 0.25 } }}
                        onClick={() => navigate(`/property/${f.id}`)}
                        className={`${CARD} flex gap-4 p-3 hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer group`}
                      >
                        <div className="relative w-40 h-28 rounded-xl overflow-hidden shrink-0">
                          <img src={f.images?.[0] || f.img || '/img/placeholder.jpg'} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 text-[10px] font-body font-semibold text-white">{TYPE_LABELS[f.type] || f.type}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div>
                            <h4 className="text-base font-body font-semibold text-white truncate">{f.name}</h4>
                            <p className="text-xs font-body text-white/50 mt-0.5">{f.city}{f.address ? `, ${f.address}` : ''}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} className="text-amber-400 fill-amber-400" />
                              <span className="text-xs font-body font-medium text-white">{f.rating || '—'}</span>
                            </div>
                            <p className="text-sm font-display font-bold text-white">{(f.price || 0).toLocaleString('ru-RU')} ₽<span className="text-white/40 font-body font-normal text-xs"> / ночь</span></p>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(f.id).then(() => { getFavoriteProperties().then(setFavProperties); }); }} className="self-start shrink-0 w-10 h-10 rounded-full bg-ocean-700/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-ocean-700/50 transition-colors">
                          <Heart size={16} className="text-rose-400 fill-rose-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  </AnimatePresence>
                  )}
                </div>
              )}

            </motion.div>
            </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      </div>

      {/* Модалка удаления */}
      <AnimatePresence>
        {deleteTarget && (() => {
          const prop = myProperties.find(p => p.id === deleteTarget);
          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-2xl shadow-black/40"
            >
              <h3 className="text-xl font-display font-bold text-white mb-1">
                {prop?.name || 'Объект'}
              </h3>
              <p className="text-white/40 text-sm font-body mb-5">
                {TYPE_LABELS[prop?.type] || prop?.type || ''}{prop?.city ? ` · ${prop.city}` : ''}
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                <p className="text-white/70 text-sm font-body leading-relaxed">
                  Вы можете <strong>убрать объект с публикации</strong> — он будет перемещён в архив и доступен для повторной публикации. Или <strong>удалить навсегда</strong> — это действие необратимо.
                </p>
              </div>

              <label className="text-white/60 font-body text-sm mb-2 block">Введите пароль</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                placeholder="Пароль от личного кабинета"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-colors mb-1"
              />
              {deleteError && <p className="text-red-500 text-xs font-body mb-3">{deleteError}</p>}

              <div className="flex items-center justify-between gap-3 mt-5">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-body font-medium transition-all"
                >
                  Отменить
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        await supabase.from('properties').update({ is_published: false }).eq('id', deleteTarget);
                        setDeleteTarget(null);
                        fetchMyProperties();
                      } catch { setDeleteError('Ошибка'); } finally { setDeleting(false); }
                    }}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold transition-all disabled:opacity-50"
                  >
                    {deleting ? '...' : 'В архив'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!deletePassword) { setDeleteError('Введите пароль для удаления'); return; }
                      setDeleting(true);
                      setDeleteError('');
                      try {
                        const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: deletePassword });
                        if (authError) { setDeleteError('Неверный пароль'); setDeleting(false); return; }
                        await supabase.from('properties').delete().eq('id', deleteTarget);
                        setDeleteTarget(null);
                        fetchMyProperties();
                      } catch { setDeleteError('Ошибка при удалении'); } finally { setDeleting(false); }
                    }}
                    disabled={deleting || !deletePassword}
                    className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-body font-semibold transition-all disabled:opacity-50"
                  >
                    {deleting ? '...' : 'Удалить'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
