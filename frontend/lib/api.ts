import type { ErrorResponse, Job, JobResponse, JobsResponse } from '@/types';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse;
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getJobs: (search?: string, category?: string, location?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (location?.trim()) params.set('location', location.trim());
    const query = params.toString();
    return request<JobsResponse>(`/jobs${query ? `?${query}` : ''}`);
  },
  getJob: (id: number) => request<JobResponse>(`/jobs/${id}`),
  createJob: (job: Omit<Job, 'id' | 'title_hi' | 'employer_hi' | 'location_hi' | 'salary_hi' | 'description_hi'>) =>
    request<JobResponse>('/jobs', { method: 'POST', body: JSON.stringify(job) }),
  updateJob: (id: number, job: Omit<Job, 'id' | 'title_hi' | 'employer_hi' | 'location_hi' | 'salary_hi' | 'description_hi'>) =>
    request<JobResponse>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(job) }),
  deleteJob: (id: number) => request<{ message: string }>(`/jobs/${id}`, { method: 'DELETE' }),
  getEmployerJobs: (name: string) =>
    request<{ jobs: Job[]; employer: string }>(`/profile/${encodeURIComponent(name)}`),
};
