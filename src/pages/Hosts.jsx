import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, PhoneCall, CalendarDays, CheckCircle, X, Send,
  Home, Hotel, Building, User, Phone, MapPin
} from 'lucide-react';
import Header from '../components/Header';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Квартира / Дом', icon: Home },
  { value: 'mini', label: 'Мини-гостиница', icon: Building },
  { value: 'standard', label: 'Стандартный Отель', icon: Hotel },
  { value: 'premium', label: 'Крупный Отель', icon: Hotel },
];

const WHY_CARDS = [
  {
    icon: Scale,
    title: 'Честная тарификация',
    text: 'Стоимость зависит только от размера вашего бизнеса: отдельная цена для квартир, мини-гостиниц и отелей. Никаких скрытых доплат.',
  },
  {
    icon: PhoneCall,
    title: 'Все сделки — ваши',
    text: 'Мы не берём процент с бронирований. Гости видят ваш номер и звонят вам напрямую.',
  },
  {
    icon: CalendarDays,
    title: 'Умный календарь',
    text: 'Отмечайте занятые даты, чтобы получать звонки только от целевых клиентов на свободные дни.',
  },
];

const RULES = [
  'Официально и в белую. Работаем с Самозанятыми, ИП и ООО. Поможем с чеками и отчётностью.',
  'Вы — законный владелец. Для размещения понадобится выписка из ЕГРН или договор субаренды.',
  'Уважение к соседям. Мы соблюдаем законы РФ: гости не нарушают режим тишины, а объекты в жилом фонде сдаются строго по закону.',
];

const STEPS = [
  { num: '01', text: 'Оставьте короткую заявку' },
  { num: '02', text: 'Наш менеджер поможет оформить профиль объекта' },
  { num: '03', text: 'Получайте звонки от гостей напрямую' },
];

const Hosts = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formType, setFormType] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSent(false);
        setFormName('');
        setFormPhone('');
        setFormCity('');
        setFormType('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen antialiased">
      <img src="/hero-bg.jpg" alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1f]/80 via-[#111114]/85 to-[#0a0a0c]/95 pointer-events-none" />

      <div className="relative z-10">
      <Header />

      <div className="pt-28 sm:pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">

          {/* ─── Hero ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16 sm:mb-24"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white leading-tight mb-6">
              Прямые клиенты.<br />Прозрачные тарифы. Без комиссий.
            </h1>
            <p className="text-white/60 font-body text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Платите только за&nbsp;размещение по&nbsp;честной тарификации, зависящей от&nbsp;масштаба вашего объекта. Все 100% прибыли с&nbsp;бронирований остаются у&nbsp;вас.
            </p>
            <button
              onClick={() => navigate('/add-property')}
              className="px-8 py-4 rounded-2xl bg-ocean-500 hover:bg-ocean-400 text-white text-base sm:text-lg font-body font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-ocean-400/40 transition-all duration-300 active:scale-[0.97]"
            >
              Добавить объект
            </button>
          </motion.div>

          {/* ─── Почему работать с нами ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 sm:mb-24"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-8 text-center">
              Почему размещать на moremest — это просто
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {WHY_CARDS.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-6 sm:p-8 shadow-lg shadow-black/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-ocean-500/15 flex items-center justify-center mb-5">
                    <card.icon size={24} className="text-ocean-400" />
                  </div>
                  <h3 className="text-white font-display font-semibold text-lg mb-3">{card.title}</h3>
                  <p className="text-white/50 font-body text-sm leading-relaxed">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── Прозрачные тарифы ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 sm:mb-24"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-8 text-center">
              Прозрачные тарифы
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  title: 'Квартира / Дом',
                  price: '3 000 ₽',
                  period: '/ год',
                  monthly: 'это всего 250 ₽ в месяц',
                  text: 'Для частных владельцев. Размещение 1 объекта (квартира или отдельный дом).',
                  accent: false,
                },
                {
                  title: 'Мини-гостиница',
                  price: '6 000 ₽',
                  period: '/ год',
                  monthly: 'это всего 500 ₽ в месяц',
                  text: 'Для небольших гостевых домов. Размещение от 2 до 5 номеров или домиков.',
                  accent: true,
                },
                {
                  title: 'Стандартный Отель',
                  price: '8 000 ₽',
                  period: '/ год',
                  monthly: 'это ~660 ₽ в месяц',
                  text: 'Для средних гостиниц и баз отдыха. Размещение от 6 до 15 номеров.',
                  accent: false,
                },
                {
                  title: 'Крупный Отель',
                  price: '12 000 ₽',
                  period: '/ год',
                  monthly: 'это 1 000 ₽ в месяц',
                  text: 'Для крупных отелей и резортов. Размещение от 16 номеров и более (безлимит).',
                  accent: false,
                },
              ].map((tariff, i) => (
                <motion.div
                  key={tariff.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`bg-white/5 border rounded-3xl backdrop-blur-md p-6 relative shadow-lg shadow-black/20 ${
                    tariff.accent ? 'border-ocean-500/40' : 'border-white/10'
                  }`}
                >
                  {tariff.accent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-ocean-500 text-white text-xs font-body font-semibold">
                      Популярный
                    </span>
                  )}
                  <h3 className="text-white font-display font-semibold text-lg mb-4">{tariff.title}</h3>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-white">{tariff.price}</span>
                    <span className="text-white/50 text-sm">{tariff.period}</span>
                  </div>
                  <p className="text-white/50 text-sm mb-4">{tariff.monthly}</p>
                  <p className="text-white/60 font-body text-sm leading-relaxed mb-5">{tariff.text}</p>
                  <button
                    onClick={() => navigate('/add-property')}
                    className="w-full mt-4 py-3 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-body font-semibold shadow-lg shadow-ocean-500/20 transition-all duration-300"
                  >
                    Выбрать
                  </button>
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-center text-white/40 text-sm font-body max-w-2xl mx-auto">
              * Указанная стоимость фиксируется за вами на весь оплаченный период (1 год). При продлении размещения на следующий сезон стоимость тарифов может быть изменена согласно актуальному прайс-листу.
            </p>
          </motion.div>

          {/* ─── Правила работы ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 sm:mb-24"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-8 text-center">
              Простые и понятные правила работы
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-6 sm:p-10 shadow-lg shadow-black/20">
              <div className="space-y-6">
                {RULES.map((rule, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <CheckCircle size={22} className="text-ocean-400 shrink-0 mt-0.5" />
                    <p className="text-white/70 font-body text-sm sm:text-base leading-relaxed">{rule}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── 3 шага ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 sm:mb-24"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-10 text-center">
              3 шага до первых денег
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch gap-5">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-6 sm:p-8 text-center shadow-lg shadow-black/20"
                >
                  <span className="text-4xl sm:text-5xl font-display font-bold text-ocean-400/30 mb-4 block">{step.num}</span>
                  <p className="text-white font-body text-sm sm:text-base leading-relaxed">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── CTA bottom ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-white/40 font-body text-sm mb-4">Готовы начать зарабатывать на своём жилье?</p>
            <button
              onClick={() => navigate('/add-property')}
              className="px-8 py-4 rounded-2xl bg-ocean-500 hover:bg-ocean-400 text-white text-base font-body font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-ocean-400/40 transition-all duration-300 active:scale-[0.97]"
            >
              Добавить объект
            </button>
          </motion.div>
        </div>
      </div>

      {/* ─── Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { if (!sending) setIsModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 p-6 sm:p-8"
            >
              {/* Close */}
              <button
                onClick={() => { if (!sending) setIsModalOpen(false); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
              >
                <X size={18} className="text-white/50" />
              </button>

              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">Заявка отправлена!</h3>
                  <p className="text-white/50 font-body text-sm">Мы свяжемся с вами в ближайшее время</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-white mb-6">
                    Оставьте заявку
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ваше имя"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+7 (___) ___-__-__"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
                      />
                    </div>

                    {/* City */}
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Город"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-ocean-500/50 transition-all duration-300"
                      />
                    </div>

                    {/* Property type */}
                    <div>
                      <label className="text-white/40 font-body text-xs mb-2 block">Что вы сдаёте?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PROPERTY_TYPES.map((pt) => (
                          <button
                            key={pt.value}
                            type="button"
                            onClick={() => setFormType(pt.value)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
                              formType === pt.value
                                ? 'bg-ocean-500/20 border border-ocean-500/40 text-white'
                                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <pt.icon size={16} className="shrink-0" />
                            <span>{pt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={sending || !formName || !formPhone || !formCity || !formType}
                      className={`w-full py-3.5 rounded-xl text-white text-sm font-body font-semibold shadow-lg transition-all duration-300 active:scale-[0.98] mt-2 ${
                        sending || !formName || !formPhone || !formCity || !formType
                          ? 'bg-ocean-500/40 shadow-none cursor-not-allowed'
                          : 'bg-ocean-500 hover:bg-ocean-400 shadow-ocean-500/25'
                      }`}
                    >
                      {sending ? 'Отправка...' : (
                        <span className="flex items-center justify-center gap-2">
                          <Send size={16} /> Отправить
                        </span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Hosts;
