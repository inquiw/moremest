import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, User, Home, BedDouble, DoorOpen,
  Wifi, Tv, Wind, WashingMachine, Car, TreePine, Flame,
  PawPrint, Users, ChevronLeft, ChevronRight, Heart, Share2, Shield,
  Coffee, Bath, UtensilsCrossed, Waves, Mountain, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';

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
  'Охрана': Shield,
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
  apartment: 'Квартира',
  house: 'Дом / Вилла',
  hotel: 'Отель',
  guesthouse: 'Гостевой дом',
  room: 'Номер в гостинице',
  'Квартира': 'Квартира',
  'Дом / Вилла': 'Дом / Вилла',
  'Отель': 'Отель',
  'Гостиница': 'Гостевой дом',
  'Гостевой дом': 'Гостевой дом',
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
  security: { label: 'Охрана', icon: Shield },
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

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

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

  useEffect(() => {
    if (!property || !window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }

      const addressStr = [property.city, property.address].filter(Boolean).join(', ');

      window.ymaps.geocode(addressStr).then(res => {
        const firstGeoObject = res.geoObjects.get(0);
        const coords = firstGeoObject
          ? firstGeoObject.geometry.getCoordinates()
          : [44.6167, 37.0833]; // fallback: Краснодарский край

        const map = new window.ymaps.Map(mapRef.current, {
          center: coords,
          zoom: 15,
          controls: ['zoomControl', 'typeSelector'],
        }, {
          suppressMapOpenBlock: true,
        });

        mapInstance.current = map;

        const placemark = new window.ymaps.Placemark(
          coords,
          {
            balloonContentHeader: property.name,
            balloonContentBody: `<div style="font-family:DM Sans,sans-serif"><b>${Number(property.price).toLocaleString('ru-RU')} ₽/ночь</b><br/>${addressStr}</div>`,
            hintContent: property.name,
            iconCaption: property.name,
          },
          {
            iconLayout: 'default#image',
            iconImageHref: PIN_ICON,
            iconImageSize: [36, 36],
            iconImageOffset: [-18, -18],
            iconCaptionMaxWidth: '150',
          }
        );
        map.geoObjects.add(placemark);
      }).catch(() => {
        // fallback map even if geocode fails
        const map = new window.ymaps.Map(mapRef.current, {
          center: [44.6167, 37.0833],
          zoom: 10,
          controls: ['zoomControl'],
        }, {
          suppressMapOpenBlock: true,
        });
        mapInstance.current = map;
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [property]);

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

  if (error || !property) {
    return (
      <div className="min-h-screen antialiased">
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
    );
  }

  return (
    <div className="min-h-screen antialiased">
      <Header />

      <div className="pt-24 sm:pt-28 pb-20">
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
              <div className="grid grid-cols-2 grid-rows-2 h-[320px] sm:h-[420px] lg:h-[460px] gap-0.5">
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
            ) : (
              <div className="h-[320px] sm:h-[420px] lg:h-[460px] overflow-hidden cursor-pointer" onClick={() => setLightbox({ open: true, index: 0 })}>
                <img
                  src={property.img || property.images?.[0] || '/img/placeholder.jpg'}
                  alt={property.name}
                  className="w-full h-full object-cover object-center hover:brightness-90 transition-all duration-200"
                />
              </div>
            )}
            {/* Градиент + текст поверх */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1.5 rounded-full bg-ocean-700/40 backdrop-blur-xl border border-white/20 text-xs font-body font-semibold text-white">
                  {TYPE_LABELS[property.type] || property.type}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{property.name}</h1>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors">
                <Heart size={18} className="text-white" />
              </button>
              <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors">
                <Share2 size={18} className="text-white" />
              </button>
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
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-black/20"
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
                {[
                  { icon: DoorOpen, label: 'Комнат', value: property.rooms },
                  { icon: Home, label: 'Тип', value: TYPE_LABELS[property.type] || property.type },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center shadow-md shadow-black/15">
                    <s.icon size={22} className="text-ocean-400 mx-auto mb-2" />
                    <p className="text-white font-body font-semibold text-lg">{s.value}</p>
                    <p className="text-white/40 font-body text-xs">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Conditions / amenities */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-black/20"
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
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg shadow-black/20"
              >
                <div className="p-4 pb-0">
                  <h2 className="text-white font-display font-semibold text-xl mb-1">Расположение</h2>
                  <p className="text-white/40 font-body text-sm mb-3">{property.city}{property.address ? `, ${property.address}` : ''}</p>
                </div>
                <div ref={mapRef} className="w-full h-[300px]" />
              </motion.div>
            </div>

            {/* Right — booking card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sticky top-28 shadow-xl shadow-black/25"
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
                      <p className="text-white font-body font-medium text-sm">Собственник</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <Phone size={18} className="text-ocean-400" />
                    <div>
                      <p className="text-white/40 font-body text-xs">Контактный телефон</p>
                      <p className="text-white font-body font-medium text-sm">{property.owner_phone || 'Не указан'}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white font-body font-semibold text-base transition-all duration-200 shadow-lg shadow-ocean-500/30 hover:shadow-ocean-400/40 active:scale-[0.98]">
                  Забронировать
                </button>

                <p className="text-white/30 font-body text-xs text-center mt-3">
                  Вы не будете платить пока не подтвердите бронирование
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lightbox ─── */}
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
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 max-w-[90vw] overflow-x-auto" onClick={(e) => e.stopPropagation()}>
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
