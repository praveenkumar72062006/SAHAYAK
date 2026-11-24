'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Job } from '@/types';

const fields = [
  ['title', 'Job title'], ['category', 'Skill category'], ['employer', 'Employer'],
  ['location', 'City or locality'], ['salary', 'Pay'], ['phone', 'Contact phone'], ['description', 'Job details'],
] as const;

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getJob(Number(id)).then(({ job }) => setJob(job)).catch(() => setError('Could not load this listing.'));
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!job) return;
    setSaving(true);
    setError('');
    try {
      await api.updateJob(job.id, job);
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
      setSaving(false);
    }
  }

  if (!job) return <main className="mx-auto max-w-2xl px-4 py-12">{error || 'Loading listing…'}</main>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/jobs/${job.id}`} className="text-blue-700">← Back to listing</Link>
      <h1 className="my-6 text-3xl font-bold">Edit job listing</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow">
        {fields.map(([key, label]) => (
          <label key={key} className="block font-medium text-gray-800">{label}
            {key === 'description' ? (
              <textarea required maxLength={2000} value={job[key] ?? ''} onChange={(e) => setJob({ ...job, [key]: e.target.value })} className="mt-1 min-h-32 w-full rounded-lg border p-3" />
            ) : (
              <input required maxLength={160} value={job[key] ?? ''} onChange={(e) => setJob({ ...job, [key]: e.target.value })} className="mt-1 w-full rounded-lg border p-3" />
            )}
          </label>
        ))}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <button disabled={saving} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </main>
  );
}
