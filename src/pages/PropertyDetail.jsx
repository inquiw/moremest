import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, User, Home, BedDouble, DoorOpen,
  Wifi, Tv, Wind, WashingMachine, Car, TreePine, Flame,
  PawPrint, Dumbbell, Coffee, Bath, UtensilsCrossed, Waves, Mountain, X,
  Building2, Hotel, Building, BadgeCheck, Castle, Share2, ShieldCheck, ChevronLeft, ChevronRight, Heart, Users, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { YMaps, Map as YMap, Placemark, ZoomControl } from 'react-yandex-maps';
import Header from '../components/Header';
import ShareModal from '../components/ShareModal';
import { supabase } from '../lib/supabaseClient';
import { useFavorites } from '../hooks/useFavorites';

const AMENITY_ICONS = {
  'Wi-Fi': Wifi,
  'ТВ': Tv,
  'Кондиционер': Wind,
  'Стиральная машина': WashingMachine,
  'Парковка': Car,
  'Кухня': UtensilsCrossed,
  'Двуспальная кровать': BedDouble,
  'Бассейн': Waves,
  'Камин': Flame,
  'Баня': Bath,
  'Мангал': Flame,
  'Двор': TreePine,
  'Сад': TreePine,
  'Терраса': Mountain,
  'Балкон': Mountain,
  'Печь': Flame,
  'Гамак': Coffee,
  'Завтрак': Coffee,
  'Питание': Coffee,
  'Спа': Bath,
  'Душ': Bath,
  'Джакузи': Bath,
  'Виноградник': TreePine,
  'Охрана': ShieldCheck,
  'Ресторан': Coffee,
  'Вид на море': Mountain,
  'Вид на горы': Mountain,
  'Вид на озеро': Mountain,
  'Вид на город': Mountain,
  'Вид на лес': TreePine,
  'Вид на реку': Mountain,
  'Шезлонги': Coffee,
  'Барбекю': Flame,
  'Лыжная комната': Mountain,
  'Банкетный зал': Home,
  'Кострище': Flame,
  'Постельное бельё': BedDouble,
  'Источник': Coffee,
  'Эко-отопление': Flame,
};

const PIN_ICON = '/placeholder-filled-point.png';

const TYPE_LABELS = {
  apartment: 'Квартира', house: 'Дом', mini_hotel: 'Гостиница', hotel: 'Гостиница', large_hotel: 'Отель',
  guesthouse: 'Гостиница', room: 'Гостиница',
  'Квартира': 'Квартира', 'Дом / Вилла': 'Дом', 'Отель': 'Отель',
  'Гостиница': 'Гостиница', 'Гостевой дом': 'Гостиница', 'Мини-гостиница': 'Гостиница', 'Мини гостиница': 'Гостиница', 'Квартира / Дом': 'Квартира', 'Крупный отель': 'Отель',
};

const TYPE_REVERSE = {
  'Квартира / Дом': 'apartment', 'Квартира': 'apartment', apartment: 'apartment',
  'Дом / Вилла': 'house', 'Дом': 'house', house: 'house',
  'Мини гостиница': 'hotel', 'Мини-гостиница': 'hotel', 'Гостевой дом': 'hotel', guesthouse: 'hotel', room: 'hotel', mini_hotel: 'hotel',
  'Гостиница': 'hotel', hotel: 'hotel',
  'Крупный отель': 'large_hotel', 'Отель': 'large_hotel', large_hotel: 'large_hotel',
};

const AMENITY_KEYS = {
  wifi: { label: 'Wi-Fi', icon: Wifi },
  tv: { label: 'ТВ', icon: Tv },
  ac: { label: 'Кондиционер', icon: Wind },
  laundry: { label: 'Стиральная машина', icon: WashingMachine },
  parking: { label: 'Парковка', icon: Car },
  kitchen: { label: 'Кухня', icon: UtensilsCrossed },
  bed: { label: 'Двуспальная кровать', icon: BedDouble },
  pool: { label: 'Бассейн', icon: Waves },
  fireplace: { label: 'Камин', icon: Flame },
  bathhouse: { label: 'Баня', icon: Bath },
  bbq: { label: 'Мангал', icon: Flame },
  yard: { label: 'Двор', icon: TreePine },
  garden: { label: 'Сад', icon: TreePine },
  terrace: { label: 'Терраса', icon: Mountain },
  balcony: { label: 'Балкон', icon: Mountain },
  stove: { label: 'Печь', icon: Flame },
  hammock: { label: 'Гамак', icon: Coffee },
  breakfast: { label: 'Завтрак', icon: Coffee },
  dining: { label: 'Питание', icon: Coffee },
  spa: { label: 'Спа', icon: Bath },
  shower: { label: 'Душ', icon: Bath },
  jacuzzi: { label: 'Джакузи', icon: Bath },
  vineyard: { label: 'Виноградник', icon: TreePine },
  security: { label: 'Охрана', icon: ShieldCheck },
  restaurant: { label: 'Ресторан', icon: Coffee },
  sea_view: { label: 'Вид на море', icon: Mountain },
  mountain_view: { label: 'Вид на горы', icon: Mountain },
  city_view: { label: 'Вид на город', icon: Mountain },
  forest_view: { label: 'Вид на лес', icon: TreePine },
  sunbeds: { label: 'Шезлонги', icon: Coffee },
  ski_room: { label: 'Лыжная комната', icon: Mountain },
  banquet: { label: 'Банкетный зал', icon: Home },
  campfire: { label: 'Кострище', icon: Flame },
  linens: { label: 'Постельное бельё', icon: BedDouble },
  spring: { label: 'Источник', icon: Coffee },
  eco_heat: { label: 'Эко-отопление', icon: Flame },
  pets: { label: 'С питомцами', icon: PawPrint },
};

const YMAPS_KEY = '08885af9-b66b-41e6-9210-09a83996162a';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [coords, setCoords] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUser(session.user);
    });
  }, []);

  const handleWriteHost = async () => {
    if (!currentUser || !property) return;
    // Don't show for own property
    if (currentUser.id === property.user_id) return;

    // Check if chat already exists
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('property_id', property.id)
      .eq('host_id', property.user_id)
      .eq('guest_id', currentUser.id)
      .maybeSingle();

    if (existing) {
      navigate(`/profile?tab=messages&chat=${existing.id}`);
      return;
    }

    // Create new chat
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ property_id: property.id, host_id: property.user_id, guest_id: currentUser.id })
      .select('id')
      .single();

    if (!error && newChat) {
      navigate(`/profile?tab=messages&chat=${newChat.id}`);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: dbError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        if (dbError || !data) {
          setError('Объект не найден');
          setLoading(false);
          return;
        }
        setProperty(data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка загрузки');
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleMapLoad = useCallback((ymaps) => {
    if (!property) return;
    const addressStr = [property.city, property.address].filter(Boolean).join(', ');
    if (!addressStr) { setMapError(true); return; }

    ymaps.geocode(addressStr, { results: 1 }).then(
      (res) => {
        const first = res.geoObjects.get(0);
        if (first) {
          setCoords(first.geometry.getCoordinates());
        } else {
          setMapError(true);
        }
      },
      () => { setMapError(true); }
    );
  }, [property]);

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

  if (error || !property) {
    return (
      <div className="relative min-h-screen antialiased">
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />
        <div className="pt-28 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-lg font-body text-white/40">{error || 'Жильё не найдено'}</p>
            <button onClick={() => navigate('/search')} className="mt-4 px-5 py-2.5 rounded-xl bg-ocean-500 text-white text-sm font-body font-semibold hover:bg-ocean-400 transition-colors">
              Вернуться к поиску
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="relative min-h-screen antialiased">
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />

      <div className="pt-24 sm:pt-28 pb-28 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-body">Назад</span>
          </motion.button>

          {/* Photo gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl overflow-hidden mb-8 shadow-xl shadow-black/30 border border-white/10"
          >
            {property.images && property.images.length > 1 ? (
              <>
                {/* Mobile: horizontal scroll */}
                <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory lg:hidden h-[280px] sm:h-[340px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {property.images.map((url, i) => (
                    <div key={url} className="shrink-0 w-[85%] sm:w-[70%] snap-center overflow-hidden cursor-pointer" onClick={() => setLightbox({ open: true, index: i })}>
                      <img src={url} alt={`${property.name} - ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {/* Desktop: grid */}
                <div className="hidden lg:grid grid-cols-2 grid-rows-2 h-[460px] gap-0.5">
                {/* Главное фото — 2 строки слева */}
                <div className="row-span-2 overflow-hidden cursor-pointer" onClick={() => setLightbox({ open: true, index: 0 })}>
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover object-center hover:brightness-90 transition-all duration-200"
                  />
                </div>
                {/* Боковые фото справа */}
                {property.images.slice(1, 3).map((url, i) => (
                  <div key={url} className="relative overflow-hidden min-h-0 cursor-pointer" onClick={() => setLightbox({ open: true, index: i + 1 })}>
                    <img src={url} alt="" className="w-full h-full object-cover object-center hover:brightness-90 transition-all duration-200" />
                    {i === 1 && property.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white text-xl font-body font-semibold">+{property.images.length - 3}</span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Пустые ячейки */}
                {property.images.length < 3 && Array.from({ length: 3 - property.images.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white/5" />
                ))}
              </div>
              </>
            ) : (
              <div className="h-[280px] sm:h-[340px] lg:h-[460px] overflow-hidden cursor-pointer" onClick={() => setLightbox({ open: true, index: 0 })}>
                <img
                  src={property.img || property.images?.[0] || '/img/placeholder.jpg'}
                  alt={property.name}
                  className="w-full h-full object-cover object-center hover:brightness-90 transition-all duration-200"
                />
              </div>
            )}
            {/* Градиент + текст поверх */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1.5 rounded-full bg-ocean-700/40 backdrop-blur-xl border border-white/20 text-xs font-body font-semibold text-white">
                  {TYPE_LABELS[property.type] || property.type}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white">{property.name}</h1>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => toggleFavorite(property.id)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors">
                <Heart size={18} className={isFavorite(property.id) ? 'text-rose-400 fill-rose-400' : 'text-white'} strokeWidth={isFavorite(property.id) ? 0 : 1.5} />
              </button>
              <div className="relative">
                <button onClick={() => setIsShareOpen(true)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors">
                  <Share2 size={18} className="text-white" />
                </button>
                <ShareModal
                  isOpen={isShareOpen}
                  onClose={() => setIsShareOpen(false)}
                  url={window.location.href}
                  title={property?.name || ''}
                />
              </div>
            </div>
          </motion.div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Quick info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/20"
              >
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-amber-400 fill-amber-400" />
                    <span className="text-white font-body font-semibold text-lg">{property.rating}</span>
                    <span className="text-white/40 font-body text-sm">({property.reviews} отзывов)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={18} />
                    <span className="font-body text-sm">{property.city}{property.address ? `, ${property.address}` : ''}</span>
                  </div>
                </div>
                <p className="text-white/70 font-body text-base leading-relaxed">{property.description}</p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {/* Тип объекта */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center justify-between min-h-[120px] shadow-md shadow-black/15">
                  <div className="flex flex-col items-center">
                    {(() => {
                      const t = property.type;
                      const mapped = TYPE_REVERSE[t] || t;
                      if (mapped === 'hotel') return <Hotel size={24} className="text-ocean-400 mb-2" />;
                      if (mapped === 'mini_hotel') return <Building2 size={24} className="text-ocean-400 mb-2" />;
                      if (mapped === 'large_hotel') return <Building size={24} className="text-ocean-400 mb-2" />;
                      if (mapped === 'house') return <Castle size={24} className="text-ocean-400 mb-2" />;
                      return <Home size={24} className="text-ocean-400 mb-2" />;
                    })()}
                    <p className="text-white font-body font-semibold text-base text-center">{TYPE_LABELS[property.type] || property.type}</p>
                  </div>
                  <p className="text-white/40 font-body text-xs mt-auto">Тип объекта</p>
                </div>
                {/* Номеров */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center justify-between min-h-[120px] shadow-md shadow-black/15">
                  <div className="flex flex-col items-center">
                    <DoorOpen size={24} className="text-ocean-400 mb-2" />
                    <p className="text-white font-body font-bold text-3xl">{property.rooms || '—'}</p>
                  </div>
                  <p className="text-white/40 font-body text-xs mt-auto">Номеров</p>
                </div>
                {/* Гостей на номер */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center justify-between min-h-[120px] shadow-md shadow-black/15">
                  <div className="flex flex-col items-center">
                    <Users size={24} className="text-ocean-400 mb-2" />
                    <p className="text-white font-body font-bold text-3xl">{property.guests || '—'}</p>
                  </div>
                  <p className="text-white/40 font-body text-xs mt-auto">Гостей на номер</p>
                </div>
                {/* Проверенный собственник */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center justify-between min-h-[120px] shadow-md shadow-black/15">
                  <div className="flex flex-col items-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ocean-400 mb-2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="m9 12 2 2 4-4" className="text-ocean-300"/>
                    </svg>
                    <p className="text-white font-body font-semibold text-sm">Проверенный</p>
                    <p className="text-white font-body font-semibold text-sm">собственник</p>
                  </div>
                  <p className="text-white/40 font-body text-xs mt-auto">Верификация</p>
                </div>
              </motion.div>

              {/* Conditions / amenities */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/20"
              >
                <h2 className="text-white font-display font-semibold text-xl mb-4">Условия проживания</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(property.amenities || []).map(a => {
                    const info = AMENITY_KEYS[a] || { label: a, icon: Home };
                    const Icon = info.icon;
                    return (
                      <div key={a} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                        <Icon size={16} className="text-ocean-400 shrink-0" />
                        <span className="text-white/80 font-body text-sm">{info.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg shadow-black/20"
              >
                <div className="p-4 pb-0">
                  <h2 className="text-white font-display font-semibold text-xl mb-1">Расположение</h2>
                  <p className="text-white/40 font-body text-sm mb-3">{property.city}{property.address ? `, ${property.address}` : ''}</p>
                </div>
                {mapError ? (
                  <div className="w-full h-[300px] flex items-center justify-center bg-white/[0.02]">
                    <div className="text-center">
                      <MapPin size={28} className="text-white/15 mx-auto mb-2" />
                      <p className="text-white/30 font-body text-sm">Не удалось найти координаты</p>
                    </div>
                  </div>
                ) : (
                  <YMaps query={{ apikey: YMAPS_KEY, load: 'package.full' }}>
                    <YMap
                      onLoad={handleMapLoad}
                      defaultState={{
                        center: coords || [44.5611, 38.0814],
                        zoom: coords ? 15 : 9,
                        controls: ['zoomControl', 'typeSelector'],
                      }}
                      options={{ suppressMapOpenBlock: true }}
                      width="100%"
                      height="300px"
                    >
                      {coords && (
                        <Placemark
                          geometry={coords}
                          properties={{
                            balloonContentHeader: property.name,
                            balloonContentBody: `<div style="font-family:DM Sans,sans-serif"><b>${Number(property.price).toLocaleString('ru-RU')} ₽/ночь</b><br/>${[property.city, property.address].filter(Boolean).join(', ')}</div>`,
                            hintContent: property.name,
                            iconCaption: property.name,
                          }}
                          options={{
                            iconLayout: 'default#image',
                            iconImageHref: PIN_ICON,
                            iconImageSize: [36, 36],
                            iconImageOffset: [-18, -18],
                            iconCaptionMaxWidth: '150',
                          }}
                        />
                      )}
                    </YMap>
                  </YMaps>
                )}
              </motion.div>
            </div>

            {/* Right — booking card (desktop only) */}
            <div className="hidden lg:block lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 sticky top-28 shadow-xl shadow-black/25"
              >
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-white font-display font-bold text-3xl">
                    {Number(property.price).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-white/40 font-body text-base">/ ночь</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <User size={18} className="text-ocean-400" />
                    <div>
                      <p className="text-white/40 font-body text-xs">Собственник</p>
                      <p className="text-white font-body font-medium text-sm">{property.owner_name || 'Собственник'}</p>
                    </div>
                  </div>
                  {currentUser ? (
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <Phone size={18} className="text-ocean-400" />
                    <div>
                      <p className="text-white/40 font-body text-xs">Контактный телефон</p>
                      <p className="text-white font-body font-medium text-sm">{property.owner_phone || 'Не указан'}</p>
                    </div>
                  </div>
                  ) : (
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <Phone size={18} className="text-ocean-400" />
                    <div>
                      <p className="text-white/40 font-body text-xs">Контактный телефон</p>
                      <p className="text-white/30 font-body text-sm">Войдите, чтобы увидеть номер</p>
                    </div>
                  </div>
                  )}
                </div>

                {currentUser && property && currentUser.id !== property.user_id && (
                  <button
                    onClick={handleWriteHost}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-body font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 mb-3"
                  >
                    <MessageCircle size={18} />
                    Написать хозяину
                  </button>
                )}

                <button className="w-full py-3.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white font-body font-semibold text-base transition-all duration-200 shadow-lg shadow-ocean-500/30 hover:shadow-ocean-400/40 active:scale-[0.98]">
                  Забронировать
                </button>

                <p className="text-white/30 font-body text-xs text-center mt-3">
                  Бронируйте без комиссии агента!
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile Fixed Bottom Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-display font-bold text-xl">
                {Number(property.price).toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-white/40 font-body text-sm">/ ночь</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-white/60 font-body text-xs">{property.rating} ({property.reviews})</span>
            </div>
          </div>
          <button className="px-6 py-3 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white font-body font-semibold text-sm transition-all duration-200 shadow-lg shadow-ocean-500/30 active:scale-95 shrink-0">
            Забронировать
          </button>
        </div>
      </div>

      {lightbox.open && (() => {
        const allImages = property.images && property.images.length > 0
          ? property.images
          : [property.img || '/img/placeholder.jpg'];
        const total = allImages.length;
        const current = lightbox.index;

        const goPrev = () => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + total) % total }));
        const goNext = () => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % total }));

        return (
          <div
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightbox({ open: false, index: 0 })}
          >
            {/* Счётчик */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-body font-medium">
              {current + 1} / {total}
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={() => setLightbox({ open: false, index: 0 })}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Предыдущее */}
            {total > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 sm:left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
            )}

            {/* Фото */}
            <img
              src={allImages[current]}
              alt={`Фото ${current + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Следующее */}
            {total > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 sm:right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            )}

            {/* Превью-лента внизу */}
            {total > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 max-w-[90vw] overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                {allImages.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setLightbox({ open: true, index: i })}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 ${i === current ? 'ring-2 ring-ocean-400 scale-110' : 'opacity-50 hover:opacity-80'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default PropertyDetail;
