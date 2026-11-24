'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Job } from '@/types';
import JobCard from '@/components/JobCard';
import { useLanguage, CATEGORIES } from '@/context/LanguageContext';

type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export default function Home() {
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (searchQuery?: string, categoryFilter?: string, locationFilter?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getJobs(searchQuery, categoryFilter, locationFilter);
      setJobs(data.jobs);
    } catch (err) {
      setError(
        language === 'hi'
          ? 'नौकरियां लोड नहीं हो सकीं। कृपया जांचें कि बैकएंड सर्वर चल रहा है।'
          : 'Failed to fetch jobs. Please make sure the backend server is running.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(search, category, location);
  };

  const handleCategorySelect = (catId: string) => {
    const nextCat = catId === category ? '' : catId;
    setCategory(nextCat);
    fetchJobs(search, nextCat, location);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    fetchJobs('', '', '');
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as SpeechWindow).SpeechRecognition ??
      (window as SpeechWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t('voiceUnsupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenSearch = event.results[0]?.[0]?.transcript?.trim();
      if (!spokenSearch) return;
      setSearch(spokenSearch);
      fetchJobs(spokenSearch, category, location);
    };

    recognition.onerror = () => {
      setError(t('voiceSearchError'));
    };

    recognition.onend = () => {
      setListening(false);
    };

    setError(null);
    setListening(true);
    recognition.start();
  };

  const hasActiveFilters = Boolean(search.trim() || category || location.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-blue-800 mb-4">
          <span>📍</span>
          <span>Delhi NCR · Hyper-Local Job Matching</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Search & Filter Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 bg-white rounded-2xl shadow-xl p-2.5 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full px-5 py-3.5 rounded-xl border-none focus:outline-none text-base sm:text-lg text-gray-900 placeholder:text-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base"
              >
                <span>🔍</span>
                <span>{t('searchButton')}</span>
              </button>
            </div>

            {/* Locality & Category Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  fetchJobs(search, e.target.value, location);
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                aria-label="Filter by job category"
              >
                <option value="">{t('allCategories')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {language === 'hi' ? `${cat.hi} (${cat.en})` : `${cat.en} (${cat.hi})`}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchJobs(search, category, location);
                    }
                  }}
                  placeholder={t('locationFilterPlaceholder')}
                  aria-label="Filter by location"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
                />
                {location && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocation('');
                      fetchJobs(search, category, '');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Voice Search & Clear Filter Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={listening}
              className={`rounded-full border px-5 py-2 text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${
                listening
                  ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                  : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:shadow'
              }`}
              title="Search by speaking in Hindi or English"
            >
              <span>{listening ? '🎙' : '🗣'}</span>
              <span>{listening ? t('voiceSearchActive') : t('voiceSearchIdle')}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>↺</span>
                <span>{t('clearFilters')}</span>
              </button>
            )}
          </div>

          {/* Quick Category Chips for Touch Accessibility */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(0, 6).map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{language === 'hi' ? cat.hi.split('/')[0].trim() : cat.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-xl max-w-3xl mx-auto shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-900 font-bold">{t('errorTitle')}</p>
              <p className="text-amber-800 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-500 font-medium text-sm">{t('loading')}</p>
        </div>
      )}

      {/* Job Listings Grid */}
      {!loading && jobs.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>💼</span>
              <span>
                {search ? `${t('searchResultsHeading')} "${search}"` : t('allJobsHeading')}
              </span>
            </h2>
            <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full w-fit">
              {jobs.length} {t('jobsFound')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noJobsFound')}</h3>
          <p className="text-gray-600 mb-6">{t('noJobsFoundDesc')}</p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow transition-all"
          >
            {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Value Proposition Strip (Track 6 Impact) */}
      <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('feature1Title')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{t('feature1Desc')}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
          <div className="text-4xl mb-3">🗣️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('feature2Title')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{t('feature2Desc')}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
          <div className="text-4xl mb-3">📞</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('feature3Title')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{t('feature3Desc')}</p>
        </div>
      </div>
    </div>
  );
}
