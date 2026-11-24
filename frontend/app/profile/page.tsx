'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Job, ContactedJob, EmployerSession } from '@/types';
import JobCard from '@/components/JobCard';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const CONTACTED_KEY = 'sahayak_contacted_jobs';
const EMPLOYER_SESSION_KEY = 'sahayak_employer_session';

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'worker' | 'employer'>('worker');

  // Worker inquiries state
  const [contactedJobs, setContactedJobs] = useState<ContactedJob[]>([]);

  // Employer state
  const [employerName, setEmployerName] = useState('');
  const [pin, setPin] = useState('1234');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Load worker inquiries
    try {
      const stored = localStorage.getItem(CONTACTED_KEY);
      if (stored) {
        setContactedJobs(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Load active employer session if available
    try {
      const sessionStr = localStorage.getItem(EMPLOYER_SESSION_KEY);
      if (sessionStr) {
        const session: EmployerSession = JSON.parse(sessionStr);
        if (session.employer) {
          setEmployerName(session.employer);
          setPin(session.pin || '1234');
          // Auto-fetch for remembered employer
          loadEmployerJobs(session.employer, session.pin || '1234');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const loadEmployerJobs = async (name: string, employerPin: string) => {
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const data = await api.getEmployerJobs(name, employerPin);
      setJobs(data.jobs);
      setAuthenticated(Boolean(data.authenticated || data.jobs.length === 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employer listings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerName.trim()) {
      setError(language === 'hi' ? 'कृपया नियोक्ता का नाम दर्ज करें।' : 'Please enter employer name.');
      return;
    }
    if (!pin.trim()) {
      setError(language === 'hi' ? 'कृपया नियोक्ता पिन दर्ज करें।' : 'Please enter employer PIN.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const verifyRes = await api.verifyEmployer(employerName.trim(), pin.trim());
      if (verifyRes.authenticated) {
        setAuthenticated(true);
        // Persist session
        localStorage.setItem(
          EMPLOYER_SESSION_KEY,
          JSON.stringify({ employer: employerName.trim(), pin: pin.trim() })
        );
        await loadEmployerJobs(employerName.trim(), pin.trim());
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid employer credentials. Default demo PIN is 1234.'
      );
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerSignOut = () => {
    try {
      localStorage.removeItem(EMPLOYER_SESSION_KEY);
    } catch {
      // ignore
    }
    setAuthenticated(false);
    setJobs([]);
    setSearched(false);
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await api.deleteJob(jobId, pin.trim());
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete job. Please verify your employer PIN.'
      );
      console.error(err);
    }
  };

  const handleRemoveInquiry = (jobId: number) => {
    const updated = contactedJobs.filter((item) => item.jobId !== jobId);
    setContactedJobs(updated);
    try {
      localStorage.setItem(CONTACTED_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
          {t('portalTitle')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
          {t('portalSubtitle')}
        </p>
      </div>

      {/* Role / Persona Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1.5 bg-gray-200/80 rounded-2xl shadow-inner gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('worker')}
            className={`px-5 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
              activeTab === 'worker'
                ? 'bg-white text-blue-700 shadow-md scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('workerTab')}
            {contactedJobs.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {contactedJobs.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employer')}
            className={`px-5 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
              activeTab === 'employer'
                ? 'bg-white text-indigo-700 shadow-md scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('employerTab')}
            {authenticated && jobs.length > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
                {jobs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-2xl max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-900 font-bold">{t('errorTitle')}</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: WORKER INQUIRIES & CALL HISTORY                   */}
      {/* ======================================================== */}
      {activeTab === 'worker' && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span>📞</span>
                <span>{t('workerSectionTitle')}</span>
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{t('workerSectionSubtitle')}</p>
            </div>
            <Link
              href="/"
              className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
            >
              + {t('browseJobsCta')}
            </Link>
          </div>

          {contactedJobs.length > 0 ? (
            <div className="space-y-4">
              {contactedJobs.map((item) => (
                <div
                  key={item.jobId}
                  className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t('calledOn')} {item.contactedAt}
                      </span>
                    </div>
                    <Link
                      href={`/jobs/${item.jobId}`}
                      className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-600 flex items-center gap-3">
                      <span>👤 {item.employer}</span>
                      <span>📍 {item.location}</span>
                      <span className="font-extrabold text-emerald-700">💰 {item.salary}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${item.phone}`}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-xl text-sm hover:from-emerald-700 hover:to-green-800 shadow-sm flex items-center gap-1.5"
                    >
                      <span>📞</span>
                      <span>{item.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveInquiry(item.jobId)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors text-sm"
                      title="Remove from history"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noInquiriesTitle')}</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">{t('noInquiriesDesc')}</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                {t('browseJobsCta')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EMPLOYER AUTHENTICATION & LISTINGS MANAGEMENT     */}
      {/* ======================================================== */}
      {activeTab === 'employer' && (
        <div className="max-w-4xl mx-auto">
          {/* Sign In / Verification Box */}
          {!authenticated ? (
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200 max-w-xl mx-auto mb-10">
              <div className="text-center mb-6">
                <span className="text-4xl">🏢</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">
                  {t('employerSectionTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                  {t('employerSectionSubtitle')}
                </p>
              </div>

              <form onSubmit={handleEmployerLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    {t('employerNameInput')}
                  </label>
                  <input
                    type="text"
                    required
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    placeholder="e.g., Rajesh Kumar or Suresh Verma"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    {t('employerPinInput')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (default demo PIN: 1234)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Demo hint: all seeded sample listings use PIN <strong className="font-mono">1234</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-extrabold rounded-xl hover:from-indigo-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {loading ? t('authenticating') : t('accessListingsBtn')}
                </button>
              </form>
            </div>
          ) : (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-indigo-50 border border-indigo-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-indigo-950 text-lg">{employerName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      ✓ {t('authenticatedBadge')}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    PIN verification active. You can edit and delete your listings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/jobs/create"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                >
                  {t('postJob')}
                </Link>
                <button
                  type="button"
                  onClick={handleEmployerSignOut}
                  className="px-3.5 py-2 bg-white text-gray-600 hover:text-red-700 border border-gray-300 rounded-xl text-sm font-semibold transition-all"
                >
                  {t('signOutEmployer')}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          )}

          {/* Employer Job Listings */}
          {!loading && authenticated && jobs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>💼</span>
                <span>
                  {t('postedJobsHeading')} <span className="text-blue-700">{employerName}</span>
                </span>
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({jobs.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="relative flex flex-col">
                    <JobCard job={job} />
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        {t('editBtn')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 px-3 rounded-xl text-xs font-bold transition-all"
                      >
                        {t('deleteBtn')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Employer Listings Found */}
          {!loading && authenticated && searched && jobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noEmployerJobs')}</h3>
              <p className="text-gray-500 mb-6">{t('createJobPrompt')}</p>
              <Link
                href="/jobs/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl font-extrabold shadow-lg hover:shadow-xl transition-all"
              >
                {t('postJob')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
