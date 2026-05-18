import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year, month) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday=0
};

const formatDate = (d) => {
  if (!d) return '';
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3).toLowerCase()}`;
};

const GuestRow = ({ label, sub, value, onMinus, onPlus, last }) => (
  <div className={`flex items-center justify-between min-h-[44px] ${last ? '' : 'mb-3'}`}>
    <div className="min-w-0 flex-1 mr-4">
      <p className="text-sm font-body font-medium text-white truncate">{label}</p>
      <p className="text-xs font-body text-white/40 truncate">{sub}</p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <button
        onClick={onMinus}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
          value > 0 ? 'border-white/30 text-white/70 hover:border-white/60 hover:text-white' : 'border-white/10 text-white/20 cursor-not-allowed'
        }`}
      >
        <span className="text-lg leading-none">−</span>
      </button>
      <span className="text-sm font-body font-medium text-white w-4 text-center">{value}</span>
      <button
        onClick={onPlus}
        className="w-8 h-8 rounded-full border border-white/30 text-white/70 hover:border-white/60 hover:text-white flex items-center justify-center transition-all duration-200"
      >
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  </div>
);

const russianCities = [
  { name: 'Геленджик', region: 'Краснодарский край', popular: true },
  { name: 'Сочи', region: 'Краснодарский край', popular: true },
  { name: 'Кабардинка', region: 'Краснодарский край', popular: true },
  { name: 'Москва', region: 'Московская область', popular: false },
  { name: 'Санкт-Петербург', region: 'Ленинградская область', popular: false },
  { name: 'Анапа', region: 'Краснодарский край', popular: false },
  { name: 'Казань', region: 'Республика Татарстан', popular: false },
  { name: 'Екатеринбург', region: 'Свердловская область', popular: false },
  { name: 'Новосибирск', region: 'Новосибирская область', popular: false },
  { name: 'Владивосток', region: 'Приморский край', popular: false },
  { name: 'Калининград', region: 'Калининградская область', popular: false },
  { name: 'Мурманск', region: 'Мурманская область', popular: false },
  { name: 'Ростов-на-Дону', region: 'Ростовская область', popular: false },
  { name: 'Нижний Новгород', region: 'Нижегородская область', popular: false },
  { name: 'Самара', region: 'Самарская область', popular: false },
  { name: 'Адлер', region: 'Краснодарский край', popular: false },
  { name: 'Туапсе', region: 'Краснодарский край', popular: false },
  { name: 'Ялта', region: 'Республика Крым', popular: false },
  { name: 'Севастополь', region: 'Республика Крым', popular: false },
  { name: 'Байкал', region: 'Иркутская область', popular: false },
  { name: 'Дивноморское', region: 'Краснодарский край', popular: false },
  { name: 'Джубга', region: 'Краснодарский край', popular: false },
  { name: 'Лазаревское', region: 'Краснодарский край', popular: false },
  { name: 'Новороссийск', region: 'Краснодарский край', popular: false },
  { name: 'Минеральные Воды', region: 'Ставропольский край', popular: false },
  { name: 'Пятигорск', region: 'Ставропольский край', popular: false },
  { name: 'Кисловодск', region: 'Ставропольский край', popular: false },
  { name: 'Волгоград', region: 'Волгоградская область', popular: false },
  { name: 'Челябинск', region: 'Челябинская область', popular: false },
  { name: 'Омск', region: 'Омская область', popular: false },
];

const SearchBar = ({
  initialCity = '',
  initialStartDate = null,
  initialEndDate = null,
  initialAdults = 0,
  initialChildren = 0,
  initialInfants = 0,
  initialPets = 0,
}) => {
  const navigate = useNavigate();
  const [cityFocused, setCityFocused] = useState(false);
  const [cityQuery, setCityQuery] = useState(initialCity);
  const [citySelected, setCitySelected] = useState(initialCity);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Calendar state
  const [calOpen, setCalOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [pendingStart, setPendingStart] = useState(null);
  const [pendingEnd, setPendingEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [calBase, setCalBase] = useState(() => new Date());
  const calRef = useRef(null);
  const selectingRef = useRef('start'); // 'start' or 'end'

  // Guests state
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [infants, setInfants] = useState(initialInfants);
  const [pets, setPets] = useState(initialPets);
  const guestsRef = useRef(null);

  const guestsLabel = useMemo(() => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} взрослы${adults === 1 ? 'й' : 'х'}`);
    if (children > 0) parts.push(`${children} дет${children === 1 ? 'ь' : 'ей'}`);
    if (infants > 0) parts.push(`${infants} младен${infants === 1 ? 'ец' : 'цев'}`);
    if (pets > 0) parts.push(`${pets} животны${pets === 1 ? 'е' : 'х'}`);
    return parts.length > 0 ? parts.join(', ') : 'Добавьте гостей';
  }, [adults, children, infants, pets]);

  const filteredCities = cityQuery.trim()
    ? russianCities.filter(c =>
        c.name.toLowerCase().startsWith(cityQuery.toLowerCase()) ||
        c.region.toLowerCase().startsWith(cityQuery.toLowerCase())
      )
    : russianCities.filter(c => c.popular);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const outsideCity = wrapperRef.current && !wrapperRef.current.contains(e.target);
      const outsideCal = calRef.current && !calRef.current.contains(e.target);
      const outsideGuests = guestsRef.current && !guestsRef.current.contains(e.target);
      if (outsideCity && outsideCal && outsideGuests) {
        setCityFocused(false);
        setCalOpen(false);
        setGuestsOpen(false);
        if (cityQuery && !citySelected) {
          const match = russianCities.find(c => c.name.toLowerCase() === cityQuery.toLowerCase());
          if (!match) setError('Город не найден');
        }
      }
    };
    const handleScroll = () => { setCityFocused(false); setCalOpen(false); setGuestsOpen(false); };
    const handleEsc = (e) => { if (e.key === 'Escape') { setCityFocused(false); setCalOpen(false); setGuestsOpen(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [cityQuery, citySelected]);

  const handleCitySelect = (city) => {
    setCityQuery(city.name);
    setCitySelected(city.name);
    setError('');
    setTimeout(() => setCityFocused(false), 1200);
  };

  const handleCityChange = (val) => {
    setCityQuery(val);
    setCitySelected('');
    setError('');
  };

  const clearCity = () => {
    setCityQuery('');
    setCitySelected('');
    setError('');
    inputRef.current?.focus();
  };

  const handleDateClick = (year, month, day) => {
    const clicked = new Date(year, month, day);
    clicked.setHours(0,0,0,0);
    if (selectingRef.current === 'start') {
      setPendingStart(clicked);
      setPendingEnd(null);
      selectingRef.current = 'end';
    } else {
      if (pendingStart && clicked < pendingStart) {
        setPendingStart(clicked);
        setPendingEnd(pendingStart);
      } else {
        setPendingEnd(clicked);
      }
      selectingRef.current = 'start';
    }
  };

  const applyDates = () => {
    const s = pendingStart || startDate;
    const e = pendingEnd || endDate;
    if (s) {
      setStartDate(s);
      setEndDate(e);
    }
    setCalOpen(false);
    selectingRef.current = 'start';
  };

  const clearDates = () => {
    setPendingStart(null);
    setPendingEnd(null);
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
    selectingRef.current = 'start';
  };

  const sameDay = (a, b) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const getCellState = (year, month, day) => {
    const d = new Date(year, month, day);
    d.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    const s = pendingStart || startDate;
    const e = pendingEnd || endDate;

    // Effective range (include hover when selecting end)
    let effectiveEnd = e;
    if (!e && s && hoverDate && selectingRef.current === 'end') {
      effectiveEnd = hoverDate < s ? s : hoverDate;
    }
    let effectiveStart = s;
    if (!e && s && hoverDate && selectingRef.current === 'end' && hoverDate < s) {
      effectiveStart = hoverDate;
    }

    const isPast = d < today;
    const isStart = s && sameDay(d, s);
    const isEnd = e && sameDay(d, e);
    const isHoverEnd = !e && s && hoverDate && sameDay(d, hoverDate) && selectingRef.current === 'end';
    const inRange = effectiveStart && effectiveEnd && d > effectiveStart && d < effectiveEnd && !isStart && !isEnd;

    return { isPast, isStart, isEnd, isHoverEnd, inRange };
  };

  const dateLabel = useMemo(() => {
    const s = startDate;
    const e = endDate;
    if (s && e) return `${formatDate(s)} — ${formatDate(e)}`;
    if (s) return `${formatDate(s)} — ...`;
    return 'Выберите даты';
  }, [startDate, endDate]);

  const get3Months = () => {
    const base = new Date(calBase);
    const months = [];
    for (let i = 0; i < 3; i++) {
      const m = new Date(base.getFullYear(), base.getMonth() + i, 1);
      months.push({ year: m.getFullYear(), month: m.getMonth() });
    }
    return months;
  };

  const prevMonth = () => {
    const now = new Date();
    const base = new Date(calBase);
    if (base.getFullYear() === now.getFullYear() && base.getMonth() === now.getMonth()) return;
    setCalBase(new Date(base.getFullYear(), base.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    const base = new Date(calBase);
    setCalBase(new Date(base.getFullYear(), base.getMonth() + 1, 1));
  };

  const renderMonthGrid = (year, month) => {
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const state = getCellState(year, month, d);
      const isHighlighted = state.isStart || state.isEnd || state.isHoverEnd;
      cells.push(
        <button
          key={d}
          disabled={state.isPast}
          onClick={() => handleDateClick(year, month, d)}
          onMouseEnter={() => {
            const h = new Date(year, month, d); h.setHours(0,0,0,0);
            setHoverDate(h);
          }}
          onMouseLeave={() => setHoverDate(null)}
          className={`w-full aspect-square text-sm sm:text-[15px] font-body font-medium transition-all duration-150 flex items-center justify-center ${
            state.isPast ? 'text-white/15 cursor-not-allowed rounded-lg' :
            isHighlighted ? 'bg-ocean-500 text-white shadow-md shadow-ocean-500/30 rounded-lg scale-105' :
            state.inRange ? 'bg-ocean-500/20 text-white/90 rounded-none' :
            'text-white/70 hover:bg-white/10 rounded-lg'
          }`}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-2xl px-3 sm:px-4 py-3 sm:py-4 flex items-center luxury-shadow-lg relative">
        {/* Куда */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition-colors duration-300 cursor-text relative"
          ref={wrapperRef}
        >
          <MapPin size={18} className="text-ocean-600 shrink-0 sm:hidden" strokeWidth={1.5} />
          <MapPin size={22} className="text-ocean-600 shrink-0 hidden sm:block" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-ocean-900 font-body leading-none mb-0.5 sm:mb-1">Куда</p>
            <input
              ref={inputRef}
              type="text"
              value={cityQuery}
              onChange={(e) => handleCityChange(e.target.value)}
              onFocus={() => { setCityFocused(true); setError(''); setCalOpen(false); setGuestsOpen(false); }}
              placeholder="Куда вы хотите?"
              className={`w-full text-sm sm:text-base font-body leading-none bg-transparent outline-none placeholder:text-gray-400 ${
                error ? 'text-red-500' : citySelected ? 'text-ocean-900' : 'text-gray-700'
              }`}
            />
            {error && <p className="text-[10px] sm:text-xs text-red-400 font-body mt-0.5">{error}</p>}
          </div>
          {cityQuery && (
            <button onClick={(e) => { e.stopPropagation(); clearCity(); }} className="shrink-0 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
              <X size={12} className="text-gray-500" />
            </button>
          )}

          {/* City Suggestions Dropdown */}
          <AnimatePresence>
            {cityFocused && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 1.05 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-full mt-3 w-[340px] rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 overflow-hidden z-50 max-h-[320px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ scrollbarWidth: 'none' }}
              >
                {!cityQuery.trim() && (
                  <p className="px-4 pt-3 pb-1 text-xs font-body font-semibold text-white/40 uppercase tracking-wider">Популярные направления</p>
                )}
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleCitySelect(city)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <MapPin size={16} className="text-ocean-400 shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 text-left">
                        <span className="font-medium">{city.name}</span>
                        <span className="text-white/40 ml-2 text-xs">{city.region}</span>
                      </div>
                      {citySelected === city.name && (
                        <span className="text-ocean-400 text-xs">✓</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-white/40 text-sm font-body">Город не найден</p>
                    <p className="text-white/25 text-xs font-body mt-1">Попробуйте другой город России</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-8 sm:h-10 bg-gray-200/80 shrink-0" />

        {/* Когда */}
        <div
          ref={calRef}
          onClick={() => { setCalOpen(!calOpen); setCityFocused(false); setGuestsOpen(false); }}
          className="flex-1 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer rounded-xl hover:bg-gray-100 transition-colors duration-300 relative"
        >
          <Calendar size={18} className="text-ocean-600 shrink-0 sm:hidden" strokeWidth={1.5} />
          <Calendar size={22} className="text-ocean-600 shrink-0 hidden sm:block" strokeWidth={1.5} />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-ocean-900 font-body leading-none mb-0.5 sm:mb-1">Когда</p>
            <p className={`text-sm sm:text-base font-body leading-none ${startDate ? 'text-ocean-900 font-medium' : 'text-gray-500'}`}>{dateLabel}</p>
          </div>

          {/* Calendar Dropdown */}
          <AnimatePresence>
            {calOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 1.05 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-3 w-[680px] sm:w-[760px] rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 overflow-hidden z-50 p-5 sm:p-6"
              >
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ChevronLeft size={18} className="text-white/70" />
                  </button>
                  <div className="text-center">
                    <span className="text-sm font-body font-semibold text-white">
                      {MONTH_NAMES[calBase.getMonth()]} {calBase.getFullYear()} — {MONTH_NAMES[new Date(calBase.getFullYear(), calBase.getMonth() + 2, 1).getMonth()]} {new Date(calBase.getFullYear(), calBase.getMonth() + 2, 1).getFullYear()}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ChevronRight size={18} className="text-white/70" />
                  </button>
                </div>

                {/* 3 months grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-5">
                  {get3Months().map(({ year, month }) => (
                    <div key={`${year}-${month}`}>
                      <p className="text-base font-body font-semibold text-white/60 mb-3 text-center">{MONTH_NAMES[month]}</p>
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAYS.map(w => <span key={w} className="text-sm font-body text-white/40 text-center leading-8">{w}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
                        {renderMonthGrid(year, month)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); clearDates(); }}
                    className="px-4 py-2 rounded-xl text-sm font-body font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Очистить
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); applyDates(); }}
                    disabled={!pendingStart}
                    className={`px-5 py-2 rounded-xl text-sm font-body font-medium transition-all duration-300 ${
                      pendingStart && (pendingEnd || startDate)
                        ? 'bg-ocean-500 text-white hover:bg-ocean-400 shadow-md shadow-ocean-500/30'
                        : pendingStart
                        ? 'bg-ocean-500/50 text-white/70 hover:bg-ocean-500/70'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    Применить
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-8 sm:h-10 bg-gray-200/80 shrink-0" />

        {/* Кто */}
        <div
          ref={guestsRef}
          onClick={() => { setGuestsOpen(!guestsOpen); setCityFocused(false); setCalOpen(false); }}
          className="flex-1 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer rounded-xl hover:bg-gray-100 transition-colors duration-300 relative"
        >
          <Users size={18} className="text-ocean-600 shrink-0 sm:hidden" strokeWidth={1.5} />
          <Users size={22} className="text-ocean-600 shrink-0 hidden sm:block" strokeWidth={1.5} />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-ocean-900 font-body leading-none mb-0.5 sm:mb-1">Кто</p>
            <p className={`text-sm sm:text-base font-body leading-none ${adults + children + infants + pets > 0 ? 'text-ocean-900 font-medium' : 'text-gray-500'}`}>{guestsLabel}</p>
          </div>

          {/* Guests Dropdown */}
          <AnimatePresence>
            {guestsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 1.05 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-3 w-[340px] rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 overflow-hidden z-50 p-5"
              >
                {/* Adults */}
                <GuestRow label="Взрослые" sub="От 13 лет" value={adults} onMinus={() => setAdults(Math.max(0, adults - 1))} onPlus={() => setAdults(adults + 1)} />
                {/* Children */}
                <GuestRow label="Дети" sub="Возраст от 2 до 12" value={children} onMinus={() => setChildren(Math.max(0, children - 1))} onPlus={() => setChildren(children + 1)} />
                {/* Infants */}
                <GuestRow label="Младенцы" sub="Младше 2" value={infants} onMinus={() => setInfants(Math.max(0, infants - 1))} onPlus={() => setInfants(infants + 1)} />
                {/* Pets */}
                <GuestRow label="Домашние животные" sub="Путешествуете с животным-помощником?" value={pets} onMinus={() => setPets(Math.max(0, pets - 1))} onPlus={() => setPets(pets + 1)} last />

                {/* Apply */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); setGuestsOpen(false); }}
                    className="px-5 py-2 rounded-xl text-sm font-body font-medium bg-ocean-500 text-white hover:bg-ocean-400 shadow-md shadow-ocean-500/30 transition-all duration-300"
                  >
                    Применить
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Button */}
        <button
          onClick={() => {
            // Apply pending dates if not yet applied
            const s = pendingStart || startDate;
            const e = pendingEnd || endDate;
            if (pendingStart) { setStartDate(pendingStart); setPendingStart(null); }
            if (pendingEnd) { setEndDate(pendingEnd); setPendingEnd(null); }
            selectingRef.current = 'start';

            const params = new URLSearchParams();
            if (citySelected) params.set('city', citySelected);
            if (s) {
              const y = s.getFullYear();
              const m = String(s.getMonth() + 1).padStart(2, '0');
              const d = String(s.getDate()).padStart(2, '0');
              params.set('checkIn', `${y}-${m}-${d}`);
            }
            if (e) {
              const y = e.getFullYear();
              const m = String(e.getMonth() + 1).padStart(2, '0');
              const d = String(e.getDate()).padStart(2, '0');
              params.set('checkOut', `${y}-${m}-${d}`);
            }
            if (adults + children + infants + pets > 0) params.set('guests', `${adults + children}`);
            if (pets > 0) params.set('pets', `${pets}`);
            navigate(`/search?${params.toString()}`);
          }}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105 shadow-lg shadow-ocean-900/25 active:scale-95"
        >
          <Search size={20} className="text-white sm:hidden" strokeWidth={2} />
          <Search size={30} className="text-white hidden sm:block" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
