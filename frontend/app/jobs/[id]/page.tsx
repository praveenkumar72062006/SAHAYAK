'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Job, ContactedJob } from '@/types';
import Link from 'next/link';
import { useLanguage, CATEGORIES } from '@/context/LanguageContext';

const CONTACTED_KEY = 'sahayak_contacted_jobs';

export default function JobDetailPage() {
  const params = useParams();
  const { t, getLocalizedJobText, getLocalizedCategory } = useLanguage();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContacted, setIsContacted] = useState(false);

  const jobId = Number(params.id);

  useEffect(() => {
    fetchJob();
    checkIfContacted();
  }, [params.id]);

  const checkIfContacted = () => {
    try {
      const stored = localStorage.getItem(CONTACTED_KEY);
      if (stored) {
        const list: ContactedJob[] = JSON.parse(stored);
        setIsContacted(list.some(item => item.jobId === jobId));
      }
    } catch {
      // ignore
    }
  };

  const recordContacted = (jobData: Job) => {
    try {
      const stored = localStorage.getItem(CONTACTED_KEY);
      const list: ContactedJob[] = stored ? JSON.parse(stored) : [];
      if (!list.some(item => item.jobId === jobData.id)) {
        const entry: ContactedJob = {
          jobId: jobData.id,
          title: jobData.title,
          employer: jobData.employer,
          phone: jobData.phone,
          location: jobData.location,
          salary: jobData.salary,
          category: jobData.category,
          contactedAt: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        list.unshift(entry);
        localStorage.setItem(CONTACTED_KEY, JSON.stringify(list));
      }
      setIsContacted(true);
    } catch {
      // ignore storage failure
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getJob(jobId);
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="text-gray-500 font-medium">{t('loading')}</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-red-900 font-bold text-lg">{t('errorTitle')}</p>
              <p className="text-red-700">{error || 'Job not found'}</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center mt-4 text-blue-700 font-semibold hover:underline"
          >
            {t('backToJobs')}
          </Link>
        </div>
      </div>
    );
  }

  const title = getLocalizedJobText(job, 'title');
  const employer = getLocalizedJobText(job, 'employer');
  const location = getLocalizedJobText(job, 'location');
  const salary = getLocalizedJobText(job, 'salary');
  const description = getLocalizedJobText(job, 'description');
  const categoryLabel = getLocalizedCategory(job.category);
  const icon = getCategoryIcon(job.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          {t('backToJobs')}
        </Link>
        <Link
          href={`/jobs/${job.id}/edit`}
          className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-300 px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
        >
          {t('editJobListing')}
        </Link>
      </div>

      {/* Main Job Card */}
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200">
        {/* Banner with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-10 py-8 sm:py-10 text-white">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <span>{icon}</span>
              <span>{categoryLabel}</span>
            </span>
            <span className="text-4xl sm:text-5xl drop-shadow">{icon}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2">
            {title}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base font-medium flex items-center gap-1.5">
            <span>📍</span>
            <span>{location}</span>
          </p>
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-3xl">👤</span>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('employer')}</p>
                <p className="text-lg font-extrabold text-gray-900">{employer}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-3xl">💰</span>
              <div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">{t('pay')}</p>
                <p className="text-xl font-black text-emerald-700">{salary}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-3xl">📍</span>
              <div>
                <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">{t('location')}</p>
                <p className="text-base font-extrabold text-gray-900">{location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-3xl">📞</span>
              <div>
                <p className="text-xs text-purple-800 font-bold uppercase tracking-wider">{t('contactEmployer')}</p>
                <a
                  href={`tel:${job.phone}`}
                  className="text-lg font-black text-purple-900 hover:underline"
                  onClick={() => recordContacted(job)}
                >
                  {job.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <span>📝</span>
              <span>{t('jobDescription')}</span>
            </h2>
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 text-gray-800 leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {description}
            </div>
          </div>

          {/* Direct Worker Action Block */}
          <div className="pt-2 space-y-3">
            <a
              href={`tel:${job.phone}`}
              onClick={() => recordContacted(job)}
              className="w-full text-center bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white py-4 px-6 rounded-2xl font-extrabold text-lg sm:text-xl hover:from-emerald-700 hover:to-green-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <span>{t('callNow')}</span>
              <span>({job.phone})</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
              <p className="text-xs text-gray-500 font-medium text-center sm:text-left">
                {t('callNotice')}
              </p>
              <button
                type="button"
                onClick={() => recordContacted(job)}
                className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  isContacted
                    ? 'bg-green-50 text-green-800 border-green-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isContacted ? t('markedContacted') : t('markContacted')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Location Map */}
      <div className="mt-8 bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <span>🗺️</span>
          <span>{t('locationOnMap')}</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Showing approximate location for: <strong className="text-gray-800">{location}</strong>
        </p>
        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200">
          <iframe
            width="100%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            title="Job Location Map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(job.location)}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const norm = category.toLowerCase().trim();
  const found = CATEGORIES.find(c => c.id === norm || norm.includes(c.id));
  return found ? found.icon : '💼';
}
