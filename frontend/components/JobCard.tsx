'use client';

import { Job } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage, CATEGORIES } from '@/context/LanguageContext';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [imageError, setImageError] = useState(false);
  const { t, getLocalizedJobText, getLocalizedCategory } = useLanguage();

  const title = getLocalizedJobText(job, 'title');
  const employer = getLocalizedJobText(job, 'employer');
  const location = getLocalizedJobText(job, 'location');
  const salary = getLocalizedJobText(job, 'salary');
  const description = getLocalizedJobText(job, 'description');
  const categoryLabel = getLocalizedCategory(job.category);
  const icon = getCategoryIcon(job.category);

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-1 flex flex-col justify-between">
      <Link href={`/jobs/${job.id}`} className="block flex-1 cursor-pointer">
        {/* Image / Graphic header */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
          {!imageError ? (
            <img
              src={`http://localhost:5000/static/images/${job.category}.jpg`}
              alt={job.category}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <span className="text-6xl drop-shadow">{icon}</span>
              <span className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wide">
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-900 shadow-md flex items-center gap-1 border border-indigo-100">
            <span>{icon}</span>
            <span>{categoryLabel}</span>
          </div>

          {/* Location Badge (Hyper-local tag) */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-lg text-xs font-medium flex items-center gap-1">
            <span>📍</span>
            <span className="truncate max-w-[180px]">{location}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>

          <div className="space-y-1.5 text-sm">
            <p className="text-gray-600 flex items-center gap-2">
              <span className="text-base text-gray-400">👤</span>
              <span className="font-medium text-gray-700">{employer}</span>
            </p>

            <p className="text-emerald-700 font-extrabold text-lg mt-2 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
              <span>💰</span>
              <span>{salary}</span>
            </p>
          </div>

          {/* Description Preview */}
          <p className="text-gray-500 text-sm mt-3 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </Link>

      {/* Card Actions (Accessible for workers) */}
      <div className="px-5 pb-5 pt-0 border-t border-gray-50 mt-2 flex items-center gap-2">
        <a
          href={`tel:${job.phone}`}
          className="flex-1 text-center bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold py-2.5 px-3 rounded-xl shadow-sm hover:shadow transition-all text-sm flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span>📞</span>
          <span>{t('call')} ({job.phone})</span>
        </a>
        <Link
          href={`/jobs/${job.id}`}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all"
        >
          {t('viewDetails')} →
        </Link>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const norm = category.toLowerCase().trim();
  const found = CATEGORIES.find(c => c.id === norm || norm.includes(c.id));
  return found ? found.icon : '💼';
}
