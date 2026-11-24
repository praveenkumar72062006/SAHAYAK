'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useLanguage, CATEGORIES } from '@/context/LanguageContext';

export default function CreateJobPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showHindiFields, setShowHindiFields] = useState(language === 'hi');

  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    category: '',
    employer: '',
    employer_hi: '',
    location: '',
    location_hi: '',
    salary: '',
    salary_hi: '',
    phone: '',
    pin: '1234',
    description: '',
    description_hi: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.employer.trim() ||
      !formData.location.trim() ||
      !formData.salary.trim() ||
      !formData.phone.trim() ||
      !formData.description.trim()
    ) {
      setError(
        language === 'hi'
          ? 'कृपया सभी आवश्यक फ़ील्ड भरें।'
          : 'Please fill in all required fields marked with *.'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.createJob(formData);

      // Save employer session for automatic profile access
      try {
        localStorage.setItem(
          'sahayak_employer_session',
          JSON.stringify({ employer: formData.employer.trim(), pin: formData.pin.trim() || '1234' })
        );
      } catch {
        // ignore storage errors
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/jobs/${response.job.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold transition-colors"
      >
        {t('backHome')}
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('createJobTitle')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
          {t('createJobSubtitle')}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 mb-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-emerald-900 font-bold text-lg">{t('jobCreatedSuccess')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-900 font-bold">{t('errorTitle')}</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200 space-y-6">
        {/* Toggle Optional Hindi Fields */}
        <div className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
          <div>
            <p className="text-sm font-bold text-blue-900">
              {language === 'hi' ? 'द्विभाषी फ़ील्ड्स (हिंदी व अंग्रेज़ी)' : 'Bilingual Job Fields (Hindi & English)'}
            </p>
            <p className="text-xs text-blue-700">
              {language === 'hi'
                ? 'हिंदी फ़ील्ड्स भरने से कामगारों को समझने में बहुत आसानी होगी।'
                : 'Adding Hindi helps local workers who prefer vernacular text.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHindiFields(!showHindiFields)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {showHindiFields ? (language === 'hi' ? 'छिपाएं' : 'Hide Hindi') : (language === 'hi' ? 'दिखाएं' : '+ Add Hindi')}
          </button>
        </div>

        {/* Job Title */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('jobTitleEn')}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('jobTitleEnPlaceholder')}
              maxLength={160}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {showHindiFields && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('jobTitleHi')}
              </label>
              <input
                type="text"
                name="title_hi"
                value={formData.title_hi}
                onChange={handleChange}
                placeholder={t('jobTitleHiPlaceholder')}
                maxLength={160}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            {t('categoryLabel')}
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white font-medium text-gray-800"
          >
            <option value="">{t('selectCategoryPlaceholder')}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.en} — {cat.hi}
              </option>
            ))}
          </select>
        </div>

        {/* Employer & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('employerNameEn')}
            </label>
            <input
              type="text"
              name="employer"
              value={formData.employer}
              onChange={handleChange}
              placeholder={t('employerNameEnPlaceholder')}
              maxLength={160}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('phoneLabel')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('phonePlaceholder')}
              maxLength={30}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
        </div>

        {showHindiFields && (
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {t('employerNameHi')}
            </label>
            <input
              type="text"
              name="employer_hi"
              value={formData.employer_hi}
              onChange={handleChange}
              placeholder={t('employerNameHiPlaceholder')}
              maxLength={160}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
            />
          </div>
        )}

        {/* Location & Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('locationEn')}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={t('locationEnPlaceholder')}
              maxLength={160}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('salaryEn')}
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder={t('salaryEnPlaceholder')}
              maxLength={160}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
        </div>

        {showHindiFields && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('locationHi')}
              </label>
              <input
                type="text"
                name="location_hi"
                value={formData.location_hi}
                onChange={handleChange}
                placeholder={t('locationHiPlaceholder')}
                maxLength={160}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('salaryHi')}
              </label>
              <input
                type="text"
                name="salary_hi"
                value={formData.salary_hi}
                onChange={handleChange}
                placeholder={t('salaryHiPlaceholder')}
                maxLength={160}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Employer Security PIN (Ownership protection) */}
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
          <label className="block text-sm font-extrabold text-indigo-950 mb-1">
            🔒 {t('pinLabel')}
          </label>
          <input
            type="text"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            maxLength={8}
            required
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:outline-none font-mono font-bold text-indigo-900 bg-white"
          />
          <p className="text-xs text-indigo-700 mt-1.5 leading-relaxed">
            {t('pinHint')}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('descriptionEn')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('descriptionEnPlaceholder')}
              rows={4}
              maxLength={2000}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none leading-relaxed"
            />
          </div>

          {showHindiFields && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('descriptionHi')}
              </label>
              <textarea
                name="description_hi"
                value={formData.description_hi}
                onChange={handleChange}
                placeholder={t('descriptionHiPlaceholder')}
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white font-extrabold text-lg rounded-2xl hover:from-emerald-700 hover:to-green-800 shadow-xl hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? t('publishingJob') : t('submitJobButton')}
        </button>
      </form>
    </div>
  );
}
