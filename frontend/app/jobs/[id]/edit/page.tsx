'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Job } from '@/types';
import { useLanguage, CATEGORIES } from '@/context/LanguageContext';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [job, setJob] = useState<Job | null>(null);
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showHindi, setShowHindi] = useState(false);

  useEffect(() => {
    // Try to pre-fill PIN from saved employer session
    try {
      const sessionStr = localStorage.getItem('sahayak_employer_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.pin) setPin(session.pin);
      }
    } catch {
      // ignore
    }

    api
      .getJob(Number(id))
      .then(({ job }) => {
        setJob(job);
        if (job.title_hi || job.description_hi) {
          setShowHindi(true);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Could not load this listing.')
      );
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!job) return;
    if (!pin.trim()) {
      setError(
        language === 'hi'
          ? 'कृपया लिस्टिंग बदलने के लिए नियोक्ता पिन दर्ज करें।'
          : 'Please enter employer PIN to authorize changes.'
      );
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.updateJob(job.id, job, pin.trim());
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save changes. Please check your PIN.'
      );
      setSaving(false);
    }
  }

  if (!job) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        {error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
            <p className="text-red-700 font-bold mb-4">{error}</p>
            <Link href="/" className="text-blue-600 font-semibold underline">
              {t('backHome')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <p className="text-gray-500 font-medium">{t('loading')}</p>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          {t('backToJobs')}
        </Link>
        <button
          type="button"
          onClick={() => setShowHindi(!showHindi)}
          className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all"
        >
          {showHindi ? 'Hide Hindi Fields' : '+ Show Hindi Fields'}
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {t('editJobTitle')}
        </h1>
        <p className="text-gray-600 text-sm">
          {t('editJobSubtitle')} · <span className="font-semibold text-gray-800">Job #{job.id}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-900 font-bold">{t('errorTitle')}</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6 rounded-3xl bg-white p-6 sm:p-10 shadow-xl border border-gray-200">
        {/* Ownership PIN Check */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <label className="block text-sm font-extrabold text-amber-950 mb-1">
            🔒 {t('verifyPinLabel')}
          </label>
          <input
            type="text"
            required
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t('verifyPinPlaceholder')}
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-amber-300 font-mono font-bold text-amber-900 focus:outline-none focus:border-amber-500 bg-white"
          />
          <p className="text-xs text-amber-800 mt-1.5">
            Default demo PIN is <strong className="font-mono">1234</strong>. This ensures only the posting employer can modify this listing.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('jobTitleEn')}
            </label>
            <input
              required
              maxLength={160}
              value={job.title ?? ''}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          {showHindi && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('jobTitleHi')}
              </label>
              <input
                maxLength={160}
                value={job.title_hi ?? ''}
                onChange={(e) => setJob({ ...job, title_hi: e.target.value })}
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
            value={job.category}
            onChange={(e) => setJob({ ...job, category: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white font-medium text-gray-800 focus:border-blue-500 focus:outline-none"
          >
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
              required
              maxLength={160}
              value={job.employer ?? ''}
              onChange={(e) => setJob({ ...job, employer: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('phoneLabel')}
            </label>
            <input
              required
              maxLength={30}
              value={job.phone ?? ''}
              onChange={(e) => setJob({ ...job, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location & Pay */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('locationEn')}
            </label>
            <input
              required
              maxLength={160}
              value={job.location ?? ''}
              onChange={(e) => setJob({ ...job, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('salaryEn')}
            </label>
            <input
              required
              maxLength={160}
              value={job.salary ?? ''}
              onChange={(e) => setJob({ ...job, salary: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {showHindi && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('locationHi')}
              </label>
              <input
                maxLength={160}
                value={job.location_hi ?? ''}
                onChange={(e) => setJob({ ...job, location_hi: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('salaryHi')}
              </label>
              <input
                maxLength={160}
                value={job.salary_hi ?? ''}
                onChange={(e) => setJob({ ...job, salary_hi: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {t('descriptionEn')}
            </label>
            <textarea
              required
              maxLength={2000}
              rows={4}
              value={job.description ?? ''}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          {showHindi && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('descriptionHi')}
              </label>
              <textarea
                maxLength={2000}
                rows={3}
                value={job.description_hi ?? ''}
                onChange={(e) => setJob({ ...job, description_hi: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 px-6 font-extrabold text-white text-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-60"
          >
            {saving ? t('savingChanges') : t('saveChangesButton')}
          </button>
          <Link
            href={`/jobs/${job.id}`}
            className="rounded-2xl border border-gray-300 py-3.5 px-6 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
