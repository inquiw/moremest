import React from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-full md:rounded-full rounded-2xl px-2 sm:px-3 py-2 sm:py-3 flex items-center luxury-shadow-lg">
        {/* Куда */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer rounded-full bg-white hover:bg-gray-100 transition-colors duration-300">
          <MapPin size={18} className="text-ocean-600 shrink-0 sm:hidden" strokeWidth={1.5} />
          <MapPin size={22} className="text-ocean-600 shrink-0 hidden sm:block" strokeWidth={1.5} />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-ocean-900 font-body leading-none mb-0.5 sm:mb-1">Куда</p>
            <p className="text-sm sm:text-base text-gray-500 font-body leading-none">Куда вы хотите?</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 sm:h-10 bg-gray-200/80 shrink-0" />

        {/* Когда */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer rounded-full bg-white hover:bg-gray-100 transition-colors duration-300">
          <Calendar size={18} className="text-ocean-600 shrink-0 sm:hidden" strokeWidth={1.5} />
          <Calendar size={22} className="text-ocean-600 shrink-0 hidden sm:block" strokeWidth={1.5} />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-ocean-900 font-body leading-none mb-0.5 sm:mb-1">Когда</p>
            <p className="text-sm sm:text-base text-gray-500 font-body leading-none">Выберите даты</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 sm:h-10 bg-gray-200/80 shrink-0" />

        {/* Кто */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer rounded-full bg-white hover:bg-gray-100 transition-colors duration-300">
          <Users size={18} className="text-ocean-600 shrink-0 sm:hidden" strokeWidth={1.5} />
          <Users size={22} className="text-ocean-600 shrink-0 hidden sm:block" strokeWidth={1.5} />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-ocean-900 font-body leading-none mb-0.5 sm:mb-1">Кто</p>
            <p className="text-sm sm:text-base text-gray-500 font-body leading-none">2 гостя</p>
          </div>
        </div>

        {/* Search Button */}
        <button className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-ocean-700 hover:bg-ocean-600 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105 shadow-lg shadow-ocean-900/25 active:scale-95">
          <Search size={20} className="text-white sm:hidden" strokeWidth={2} />
          <Search size={30} className="text-white hidden sm:block" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
