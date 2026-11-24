'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl">🤝</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {t('brandName')}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 tracking-tight -mt-1 hidden xs:block">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Toggle with Indicator */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-xl hover:bg-amber-100 shadow-sm hover:shadow transition-all"
            title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <span>🌐</span>
            <span>{t('toggleToLang')}</span>
          </button>

          {/* Create Job Button */}
          <Link
            href="/jobs/create"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 shadow-sm hover:shadow-md transition-all flex items-center gap-1"
          >
            <span>{t('postJob')}</span>
          </Link>

          {/* My Profile / Portal Button */}
          <Link
            href="/profile"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all flex items-center gap-1"
          >
            <span>👤</span>
            <span className="hidden sm:inline">{t('myProfile')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
