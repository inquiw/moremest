import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Home, Hotel, Building, MapPin, FileText,
  Phone, Banknote, UploadCloud, ShieldCheck, ChevronRight, ChevronLeft,
  CheckCircle, Wifi, Wind, Car, PawPrint, Waves, User, Lock, X, Star,
  Tv, WashingMachine, UtensilsCrossed, BedDouble, Flame, Bath, TreePine,
  Mountain, Coffee, Shield, BadgeCheck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';

/* ─── Конфиг ─── */
const TOTAL_STEPS = 5;

const OBJECT_TYPES = [
  { value: 'apartment', label: 'Квартира / Дом', sub: '1 объект размещения', icon: Home },
  { value: 'mini_hotel', label: 'Мини-гостиница', sub: '2–5 номеров', icon: Building2 },
  { value: 'hotel', label: 'Гостиница', sub: '6–10 номеров', icon: Hotel },
  { value: 'large_hotel', label: 'Крупный отель', sub: '11+ номеров', icon: Building },
];

const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'tv', label: 'ТВ', icon: Tv },
  { value: 'ac', label: 'Кондиционер', icon: Wind },
  { value: 'laundry', label: 'Стиральная машина', icon: WashingMachine },
  { value: 'parking', label: 'Парковка', icon: Car },
  { value: 'kitchen', label: 'Кухня', icon: UtensilsCrossed },
  { value: 'bed', label: 'Двуспальная кровать', icon: BedDouble },
  { value: 'pool', label: 'Бассейн', icon: Waves },
  { value: 'fireplace', label: 'Камин', icon: Flame },
  { value: 'bathhouse', label: 'Баня', icon: Bath },
  { value: 'bbq', label: 'Мангал', icon: Flame },
  { value: 'yard', label: 'Двор', icon: TreePine },
  { value: 'garden', label: 'Сад', icon: TreePine },
  { value: 'terrace', label: 'Терраса', icon: Mountain },
  { value: 'balcony', label: 'Балкон', icon: Mountain },
  { value: 'stove', label: 'Печь', icon: Flame },
  { value: 'hammock', label: 'Гамак', icon: Coffee },
  { value: 'breakfast', label: 'Завтрак', icon: Coffee },
  { value: 'dining', label: 'Питание', icon: Coffee },
  { value: 'spa', label: 'Спа', icon: Bath },
  { value: 'shower', label: 'Душ', icon: Bath },
  { value: 'jacuzzi', label: 'Джакузи', icon: Bath },
  { value: 'vineyard', label: 'Виноградник', icon: TreePine },
  { value: 'security', label: 'Охрана', icon: Shield },
  { value: 'restaurant', label: 'Ресторан', icon: Coffee },
  { value: 'sea_view', label: 'Вид на море', icon: Mountain },
  { value: 'mountain_view', label: 'Вид на горы', icon: Mountain },
  { value: 'city_view', label: 'Вид на город', icon: Mountain },
  { value: 'forest_view', label: 'Вид на лес', icon: TreePine },
  { value: 'sunbeds', label: 'Шезлонги', icon: Coffee },
  { value: 'ski_room', label: 'Лыжная комната', icon: Mountain },
  { value: 'banquet', label: 'Банкетный зал', icon: Building },
  { value: 'campfire', label: 'Кострище', icon: Flame },
  { value: 'linens', label: 'Постельное бельё', icon: BedDouble },
  { value: 'spring', label: 'Источник', icon: Coffee },
  { value: 'eco_heat', label: 'Эко-отопление', icon: Flame },
  { value: 'pets', label: 'С питомцами', icon: PawPrint },
];

const LEGAL_STATUSES = [
  { value: 'individual', label: 'Физическое лицо' },
  { value: 'selfemployed', label: 'Самозанятый' },
  { value: 'ip', label: 'ИП' },
  { value: 'ooo', label: 'ООО' },
];

/* ─── Компонент ─── */
const AddProperty = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    type: '',
    city: '',
    street: '',
    house: '',
    address: '',
    name: '',
    description: '',
    rooms: '',
    guests: '',
    amenities: [],
    price: '',
    phone: '',
    legalStatus: '',
    isTermsAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const navigate = useNavigate();

  /* Auth gate */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = () => {
    window.dispatchEvent(new CustomEvent('open-auth'));
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCityChange = (e) => {
    let val = e.target.value;
    if (val.length > 0 && !val.startsWith('г. ')) {
      val = 'г. ' + val.replace(/^[гГ][.\s]*/, '');
    }
    update('city', val);
  };

  const handleStreetChange = (e) => {
    let val = e.target.value;
    if (val.length > 0 && !val.startsWith('ул. ')) {
      val = 'ул. ' + val.replace(/^[уУ][лЛ][.\s]*/, '');
    }
    update('street', val);
  };

  const toggleAmenity = (value) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value],
    }));
  };

  const handlePhotoUpload = async (files) => {
    if (!user || !files.length) return;
    setUploadingPhotos(true);
    const uploaded = [];
    try {
      for (const file of files) {
        if (photos.length + uploaded.length >= 10) break;
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
        uploaded.push(urlData.publicUrl);
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setSubmitError('Ошибка загрузки фото: ' + err.message);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (url) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const formatPhone = (raw) => {
    const d = raw.replace(/\D/g, '');
    if (d.length === 0) return '';
    if (d.length <= 1) return '+' + d;
    if (d.length <= 4) return `+${d[0]} (${d.slice(1)}`;
    if (d.length <= 7) return `+${d[0]} (${d.slice(1,4)}) ${d.slice(4)}`;
    if (d.length <= 9) return `+${d[0]} (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
    return `+${d[0]} (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 11) {
      update('phone', formatPhone(raw));
    }
  };

  const isValidPhone = (phone) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);

  const setMainPhoto = (url) => {
    setPhotos((prev) => {
      const rest = prev.filter((p) => p !== url);
      return [url, ...rest];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    const fullAddress = [form.street, form.house].filter(Boolean).join(', ');
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          owner_name: [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(' ') || 'Собственник',
          name: form.name,
          description: form.description,
          type: OBJECT_TYPES.find(t => t.value === form.type)?.label || form.type,
          city: form.city,
          address: fullAddress,
          rooms: Number(form.rooms) || 1,
          guests: Number(form.guests) || 1,
          amenities: form.amenities,
          price: Number(form.price) || 0,
          owner_phone: form.phone,
          legal_status: form.legalStatus,
          is_published: true,
          rating: 0,
          reviews: 0,
          img: photos[0] || '/img/placeholder.jpg',
          images: photos,
        })
        .select()
        .single();

      if (error) throw error;
      navigate('/profile');
    } catch (err) {
      setSubmitError(err.message || 'Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Загрузка ─── */
  if (loading) {
    return (
      <div className="relative min-h-screen antialiased">
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />
        <div className="pt-28 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
    );
  }

  /* ─── Auth gate ─── */
  if (!user) {
    return (
      <div className="relative min-h-screen antialiased">
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />
        <div className="pt-28 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-10 sm:p-14 text-center max-w-md w-full shadow-xl shadow-black/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-ocean-500/15 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-ocean-400" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-white mb-3">
              Требуется авторизация
            </h2>
            <p className="text-white/50 font-body text-sm leading-relaxed mb-8">
              Чтобы добавить объект, необходимо войти в&nbsp;систему. Это нужно для&nbsp;безопасности и&nbsp;связи с&nbsp;вами.
            </p>
            <button
              onClick={openAuthModal}
              className="px-8 py-3.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-ocean-400/40 transition-all duration-300 active:scale-[0.97]"
            >
              Войти
            </button>
          </motion.div>
        </div>
      </div>
      </div>
    );
  }

  /* ─── Шаги ─── */
  const stepContent = [
    /* ── Шаг 1: Базовая информация ── */
    <div key="step1" className="space-y-6">
      <div>
        <label className="text-white/60 font-body text-sm mb-3 block">Тип объекта</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OBJECT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update('type', t.value)}
              className={`flex flex-col items-center gap-2.5 px-4 py-4 rounded-2xl text-sm font-body transition-all duration-200 ${
                form.type === t.value
                  ? 'bg-ocean-500/20 border border-ocean-500/40 text-white shadow-md shadow-ocean-500/10'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <t.icon size={24} className={form.type === t.value ? 'text-ocean-400' : ''} />
              <span className="font-medium">{t.label}</span>
              <span className="text-[11px] text-white/40">{t.sub}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Город</label>
        <div className="relative">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={form.city}
            onChange={handleCityChange}
            placeholder="г. Геленджик"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-white/60 font-body text-sm mb-2 block">Улица</label>
          <div className="relative">
            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={form.street}
              onChange={handleStreetChange}
              placeholder="ул. Ленина"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
            />
          </div>
        </div>
        <div>
          <label className="text-white/60 font-body text-sm mb-2 block">Дом</label>
          <input
            type="text"
            value={form.house}
            onChange={(e) => update('house', e.target.value)}
            placeholder="15"
            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
          />
        </div>
      </div>
    </div>,

    /* ── Шаг 2: Детали объекта ── */
    <div key="step2" className="space-y-6">
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Название объекта</label>
        <input
          type="text"
          maxLength={30}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder='Например, "Вилла у моря"'
          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
        />
        <p className="text-white/30 text-xs font-body mt-1">{form.name.length}/30</p>
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Краткое описание</label>
        <textarea
          rows={4}
          maxLength={150}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Расскажите о вашем объекте..."
          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300 resize-none"
        />
        <p className="text-white/30 text-xs font-body mt-1">{form.description.length}/150</p>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/60 font-body text-sm mb-2 block">Количество номеров</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.rooms}
              onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); update('rooms', v); }}
              placeholder="Номеров"
              className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white text-sm font-body placeholder:text-white/25 focus:outline-none transition-all duration-300 ${
                form.type && form.rooms && (() => {
                  const r = Number(form.rooms);
                  if (form.type === 'apartment' && r > 1) return 'border-amber-500/60 focus:border-amber-500';
                  if (form.type === 'mini_hotel' && (r < 2 || r > 5)) return 'border-amber-500/60 focus:border-amber-500';
                  if (form.type === 'hotel' && (r < 6 || r > 10)) return 'border-amber-500/60 focus:border-amber-500';
                  if (form.type === 'large_hotel' && r < 11) return 'border-amber-500/60 focus:border-amber-500';
                  return 'border-white/10 focus:border-ocean-500/50';
                })()
              }`}
            />
          </div>
          <div>
            <label className="text-white/60 font-body text-sm mb-2 block">Гостей на номер</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.guests}
              onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); update('guests', v); }}
              placeholder="Макс. количество гостей"
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
            />
          </div>
        </div>
        {form.type && form.rooms && (() => {
          const r = Number(form.rooms);
          const typeRanges = { apartment: [1, 1], mini_hotel: [2, 5], hotel: [6, 10], large_hotel: [11, 999] };
          const range = typeRanges[form.type];
          if (range && (r < range[0] || r > range[1])) {
            const suggested = r <= 1 ? 'apartment' : r <= 5 ? 'mini_hotel' : r <= 10 ? 'hotel' : 'large_hotel';
            const suggestedLabel = OBJECT_TYPES.find(t => t.value === suggested)?.label;
            return (
              <div className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-sm mt-0.5">⚠</span>
                <p className="text-amber-300/90 text-xs font-body leading-relaxed">
                  Количество номеров не соответствует типу «{OBJECT_TYPES.find(t => t.value === form.type)?.label}».
                  Рекомендуем изменить тип на <button type="button" onClick={() => update('type', suggested)} className="text-amber-300 font-semibold underline underline-offset-2 hover:text-amber-200 transition-colors">«{suggestedLabel}»</button>
                </p>
              </div>
            );
          }
          return null;
        })()}
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-3 block">Удобства</label>
        <div className="flex flex-wrap gap-2.5">
          {AMENITIES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => toggleAmenity(a.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
                form.amenities.includes(a.value)
                  ? 'bg-ocean-500/20 border border-ocean-500/40 text-white'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <a.icon size={16} />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,

    /* ── Шаг 3: Контакты и стоимость ── */
    <div key="step3" className="space-y-6">
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Базовая стоимость за ночь</label>
        <div className="relative">
          <Banknote size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); update('price', v); }}
            placeholder="От ... руб"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
          />
        </div>
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Номер телефона для связи с гостями</label>
        <div className="relative">
          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="tel"
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border text-white text-sm font-body placeholder:text-white/25 focus:outline-none transition-all duration-300 ${form.phone && !isValidPhone(form.phone) ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-ocean-500/50'}`}
          />
        </div>
        <p className="text-white/30 text-xs font-body mt-2">
          Гости будут видеть этот номер и звонить напрямую — у нас нет онлайн-оплаты
        </p>
      </div>
    </div>,

    /* ── Шаг 4: Фотографии ── */
    <div key="step4" className="space-y-6">
      <label
        className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-colors duration-300 flex flex-col items-center ${uploadingPhotos ? 'border-ocean-500/40 bg-ocean-500/5' : 'border-white/15 hover:border-ocean-500/40'}`}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handlePhotoUpload(Array.from(e.target.files))}
          disabled={uploadingPhotos || photos.length >= 10}
        />
        {uploadingPhotos ? (
          <div className="w-10 h-10 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4" />
        ) : (
          <UploadCloud size={48} className="text-white/20 mb-4" />
        )}
        <p className="text-white/50 font-body text-sm mb-1">
          {uploadingPhotos ? 'Загрузка...' : 'Перетащите фото сюда или нажмите для выбора'}
        </p>
        <p className="text-white/25 font-body text-xs">
          PNG, JPG до 10 МБ. До 10 фотографий.
        </p>
      </label>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {photos.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setMainPhoto(url)}
                className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-opacity ${i === 0 ? 'bg-ocean-500/80 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}
              >
                <Star size={12} className={i === 0 ? 'text-white fill-white' : 'text-white/70'} />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-ocean-500/80 text-[10px] font-body font-semibold text-white">Главное</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>,

    /* ── Шаг 5: Верификация ── */
    <div key="step5" className="space-y-6">
      <div className="bg-ocean-500/10 border border-ocean-500/20 rounded-2xl p-5 flex items-start gap-4">
        <ShieldCheck size={22} className="text-ocean-400 shrink-0 mt-0.5" />
        <p className="text-white/60 font-body text-sm leading-relaxed">
          Для публикации объекта нам необходимо убедиться, что вы являетесь его законным владельцем или имеете право на&nbsp;субаренду.
        </p>
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Документ, подтверждающий право собственности</label>
        <div
          className="border-2 border-dashed border-white/15 hover:border-ocean-500/40 rounded-2xl p-8 text-center cursor-pointer transition-colors duration-300"
          onClick={() => {}}
        >
          <UploadCloud size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 font-body text-sm mb-1">
            Выписка из ЕГРН или договор субаренды
          </p>
          <p className="text-white/25 font-body text-xs">PDF, JPG, PNG до 20 МБ</p>
        </div>
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-3 block">Юридический статус</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LEGAL_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update('legalStatus', s.value)}
              className={`px-4 py-3.5 rounded-xl text-sm font-body transition-all duration-200 ${
                form.legalStatus === s.value
                  ? 'bg-ocean-500/20 border border-ocean-500/40 text-white'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
            form.isTermsAccepted
              ? 'bg-ocean-500 border-ocean-500'
              : 'bg-white/5 border-white/20 group-hover:border-white/40'
          }`}>
            {form.isTermsAccepted && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <input type="checkbox" checked={form.isTermsAccepted} onChange={() => update('isTermsAccepted', !form.isTermsAccepted)} className="hidden" />
          <span className="text-white/50 font-body text-xs leading-relaxed">
            Я принимаю условия <span className="text-white/70 underline underline-offset-2">Пользовательского соглашения</span>, соглашаюсь с <span className="text-white/70 underline underline-offset-2">Политикой обработки персональных данных</span> и даю согласие на публикацию моих контактных данных для связи с гостями, согласно <span className="text-white/70 underline underline-offset-2">ФЗ-152</span>.
          </span>
        </label>
      </div>
    </div>,
  ];

  const stepLabels = [
    'Локация',
    'Детали',
    'Стоимость',
    'Фото',
    'Верификация',
  ];

  const canNext = () => {
    switch (step) {
      case 0: return form.type && form.city && form.street;
      case 1: return form.name && form.rooms;
      case 2: return form.price && form.phone && isValidPhone(form.phone);
      case 3: return true;
      case 4: return form.legalStatus;
      default: return false;
    }
  };

  return (
    <div className="relative min-h-screen antialiased">
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />

      <div className="pt-28 sm:pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* ─── Прогресс-бар ─── */}
          <div className="mb-10">
            {/* Шаги */}
            <div className="flex items-start justify-between mb-3">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex flex-col items-center flex-1">
                  <div
                    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-body font-bold transition-all duration-500 ${
                      i < step
                        ? 'bg-gradient-to-br from-ocean-400 to-ocean-600 text-white shadow-lg shadow-ocean-500/25 scale-100'
                        : i === step
                        ? 'bg-ocean-500/15 border-2 border-ocean-400/60 text-ocean-300 scale-110'
                        : 'bg-white/[0.03] border border-white/10 text-white/20 scale-100'
                    }`}
                  >
                    {i < step ? <BadgeCheck size={20} /> : i + 1}
                    {i === step && (
                      <span className="absolute -inset-1 rounded-2xl bg-ocean-400/20 animate-pulse -z-10" />
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-body mt-2 transition-colors duration-300 ${
                    i < step
                      ? 'text-ocean-400 font-medium'
                      : i === step
                      ? 'text-white/80 font-semibold'
                      : 'text-white/20'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            {/* Полоска прогресса */}
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-full"
                initial={false}
                animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* ─── Контейнер формы ─── */}
          <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/20">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-white mb-6">
              {stepLabels[step]}
            </h2>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {stepContent[step]}
              </motion.div>
            </AnimatePresence>

            {/* ─── Навигация ─── */}
            {submitError && (
              <p className="text-red-400 text-sm font-body text-center mb-4">{submitError}</p>
            )}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-body font-medium transition-all duration-300"
                >
                  <ChevronLeft size={18} />
                  Назад
                </button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS - 1 ? (
                <button
                  onClick={() => canNext() && setStep(step + 1)}
                  disabled={!canNext()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-body font-semibold transition-all duration-300 ${
                    canNext()
                      ? 'bg-ocean-500 hover:bg-ocean-400 text-white shadow-lg shadow-ocean-500/25 active:scale-[0.97]'
                      : 'bg-ocean-500/30 text-white/40 cursor-not-allowed'
                  }`}
                >
                  Далее
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canNext() || !form.isTermsAccepted || submitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-body font-semibold transition-all duration-300 ${
                    canNext() && form.isTermsAccepted && !submitting
                      ? 'bg-ocean-500 hover:bg-ocean-400 text-white shadow-lg shadow-ocean-500/25 active:scale-[0.97]'
                      : 'bg-ocean-500/30 text-white/40 cursor-not-allowed opacity-50'
                  }`}
                >
                  {submitting ? 'Публикация...' : 'Опубликовать'}
                  <BadgeCheck size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddProperty;
