import type {
  Token, Patient, Department, Doctor, StaffUser,
  AuthSession, Consultation, DailyStats, ConsultationOutcome,
} from '@smartq/types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

let _authToken: string | null = null;
export function setAuthToken(token: string | null) { _authToken = token; }

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `API error ${res.status}`);
  }
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (employeeId: string, password: string) =>
    apiFetch<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    }),

  requestOTP: (mobile: string) =>
    apiFetch<{ success: boolean }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    }),

  verifyOTP: (mobile: string, otp: string) =>
    apiFetch<{ token: string; patient: Patient }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    }),
};

// ─── Tokens ───────────────────────────────────────────────────────────────────

export const tokens = {
  issue: (payload: { patientId: string; departmentId: string; doctorId?: string; isEmergency?: boolean; isSenior?: boolean }) =>
    apiFetch<Token>('/tokens', { method: 'POST', body: JSON.stringify(payload) }),

  getById: (id: string) => apiFetch<Token>(`/tokens/${id}`),

  getByPatient: (patientId: string) => apiFetch<Token[]>(`/tokens?patientId=${patientId}`),

  updateStatus: (id: string, status: Token['status'], outcome?: ConsultationOutcome) =>
    apiFetch<Token>(`/tokens/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, outcome }),
    }),

  callNext: (departmentId: string, doctorId: string) =>
    apiFetch<Token>(`/tokens/call-next`, {
      method: 'POST',
      body: JSON.stringify({ departmentId, doctorId }),
    }),
};

// ─── Queue ────────────────────────────────────────────────────────────────────

export const queue = {
  getState: (departmentId: string) =>
    apiFetch<{ tokens: Token[]; isPaused: boolean; isOverflowMode: boolean }>(`/queue/${departmentId}`),

  pause: (departmentId: string) =>
    apiFetch<void>(`/queue/${departmentId}/pause`, { method: 'POST' }),

  resume: (departmentId: string) =>
    apiFetch<void>(`/queue/${departmentId}/resume`, { method: 'POST' }),

  activateOverflow: (departmentId: string) =>
    apiFetch<void>(`/queue/${departmentId}/overflow`, { method: 'POST' }),

  broadcastSMS: (departmentId: string, message: string) =>
    apiFetch<{ sent: number }>(`/queue/${departmentId}/broadcast`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const departments = {
  list: () => apiFetch<Department[]>('/departments'),
  getById: (id: string) => apiFetch<Department>(`/departments/${id}`),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────

export const doctors = {
  list: () => apiFetch<Doctor[]>('/doctors'),
  getById: (id: string) => apiFetch<Doctor>(`/doctors/${id}`),
  setStatus: (id: string, status: Doctor['status']) =>
    apiFetch<Doctor>(`/doctors/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ─── Patients ─────────────────────────────────────────────────────────────────

export const patients = {
  getById: (id: string) => apiFetch<Patient>(`/patients/${id}`),
  getByMobile: (mobile: string) => apiFetch<Patient>(`/patients?mobile=${mobile}`),
  create: (data: Omit<Patient, 'id'>) =>
    apiFetch<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Consultations ────────────────────────────────────────────────────────────

export const consultations = {
  create: (data: Omit<Consultation, 'id' | 'startedAt'>) =>
    apiFetch<Consultation>('/consultations', { method: 'POST', body: JSON.stringify(data) }),
  complete: (id: string, data: Pick<Consultation, 'notes' | 'diagnosis' | 'prescription' | 'outcome' | 'referredTo'>) =>
    apiFetch<Consultation>(`/consultations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Staff / Users ────────────────────────────────────────────────────────────

export const staff = {
  list: () => apiFetch<StaffUser[]>('/staff'),
  create: (data: Omit<StaffUser, 'id'>) =>
    apiFetch<StaffUser>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<StaffUser>) =>
    apiFetch<StaffUser>(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivate: (id: string) =>
    apiFetch<StaffUser>(`/staff/${id}/deactivate`, { method: 'POST' }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analytics = {
  daily: (date: string) => apiFetch<DailyStats>(`/analytics/daily?date=${date}`),
  range: (from: string, to: string) => apiFetch<DailyStats[]>(`/analytics/range?from=${from}&to=${to}`),
  departmentSummary: (departmentId: string) => apiFetch<DailyStats>(`/analytics/department/${departmentId}`),
};

// ─── Named export ─────────────────────────────────────────────────────────────

const apiClient = { auth, tokens, queue, departments, doctors, patients, consultations, staff, analytics };
export default apiClient;
