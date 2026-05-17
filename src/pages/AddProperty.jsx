import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Home, Hotel, Building, MapPin, FileText,
  Phone, Banknote, UploadCloud, ShieldCheck, ChevronRight, ChevronLeft,
  CheckCircle, Wifi, Wind, Car, PawPrint, Waves, User, Lock, X, Star
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';

/* ─── Конфиг ─── */
const TOTAL_STEPS = 5;

const OBJECT_TYPES = [
  { value: 'apartment', label: 'Квартира', icon: Building2 },
  { value: 'house', label: 'Дом / Вилла', icon: Home },
  { value: 'room', label: 'Номер в гостинице', icon: Hotel },
  { value: 'guesthouse', label: 'Гостевой дом', icon: Building },
];

const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'ac', label: 'Кондиционер', icon: Wind },
  { value: 'pool', label: 'Бассейн', icon: Waves },
  { value: 'parking', label: 'Парковка', icon: Car },
  { value: 'pets', label: 'Можно с питомцами', icon: PawPrint },
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
    amenities: [],
    price: '',
    phone: '',
    legalStatus: '',
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
          name: form.name,
          description: form.description,
          type: OBJECT_TYPES.find(t => t.value === form.type)?.label || form.type,
          city: form.city,
          address: fullAddress,
          rooms: Number(form.rooms) || 1,
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
      <div className="min-h-screen antialiased">
        <Header />
        <div className="pt-28 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* ─── Auth gate ─── */
  if (!user) {
    return (
      <div className="min-h-screen antialiased">
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
              <span>{t.label}</span>
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
            onChange={(e) => update('city', e.target.value)}
            placeholder="Например, Геленджик"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-white/60 font-body text-sm mb-2 block">Улица</label>
          <div className="relative">
            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={form.street}
              onChange={(e) => update('street', e.target.value)}
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
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder='Например, "Вилла у моря"'
          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
        />
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Краткое описание</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Расскажите о вашем объекте..."
          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300 resize-none"
        />
      </div>
      <div>
        <label className="text-white/60 font-body text-sm mb-2 block">Количество номеров / комнат</label>
        <input
          type="number"
          min="1"
          value={form.rooms}
          onChange={(e) => update('rooms', e.target.value)}
          placeholder="Например, 3"
          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
        />
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
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
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
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
    <div className="min-h-screen antialiased">
      <Header />

      <div className="pt-28 sm:pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* ─── Прогресс-бар ─── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-all duration-300 ${
                      i < step
                        ? 'bg-ocean-500 text-white'
                        : i === step
                        ? 'bg-ocean-500/20 border border-ocean-500/40 text-ocean-400'
                        : 'bg-white/5 border border-white/10 text-white/25'
                    }`}
                  >
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-body mt-1.5 hidden sm:block ${
                    i <= step ? 'text-white/60' : 'text-white/25'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-ocean-500 rounded-full"
                initial={false}
                animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                  disabled={!canNext() || submitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-body font-semibold transition-all duration-300 ${
                    canNext() && !submitting
                      ? 'bg-ocean-500 hover:bg-ocean-400 text-white shadow-lg shadow-ocean-500/25 active:scale-[0.97]'
                      : 'bg-ocean-500/30 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Публикация...' : 'Опубликовать'}
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
