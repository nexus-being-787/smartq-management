// ─── Token ────────────────────────────────────────────────────────────────────

export type TokenStatus =
  | 'ISSUED'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'REFERRED'
  | 'ADMITTED';

export type TokenPriority = 'EMERGENCY' | 'PRIORITY' | 'REGULAR';

export interface Token {
  id: string;
  number: number;
  displayNumber: string; // e.g. "A042"
  patientId: string;
  departmentId: string;
  doctorId?: string;
  status: TokenStatus;
  priority: TokenPriority;
  issuedAt: string; // ISO
  calledAt?: string;
  consultedAt?: string;
  estimatedWaitMinutes: number;
  queuePosition: number;
  noShowCount: number;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  isReturning: boolean;
  medicalHistory?: string;
  allergies?: string;
  lastVisit?: string;
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  code: string;
  currentQueueLength: number;
  estimatedWaitMinutes: number;
  isActive: boolean;
  doctors: Doctor[];
}

// ─── Doctor ───────────────────────────────────────────────────────────────────

export type DoctorStatus = 'AVAILABLE' | 'ON_BREAK' | 'ABSENT' | 'IN_CONSULTATION';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  departmentId: string;
  status: DoctorStatus;
  currentTokenId?: string;
  todayServed: number;
  todayPending: number;
  averageConsultMinutes: number;
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export interface QueueState {
  departmentId: string;
  tokens: Token[];
  currentToken?: Token;
  emergencyCount: number;
  priorityCount: number;
  regularCount: number;
  isPaused: boolean;
  isOverflowMode: boolean;
}

// ─── Consultation ─────────────────────────────────────────────────────────────

export type ConsultationOutcome = 'CONSULTED' | 'REFERRED' | 'ADMITTED' | 'NO_SHOW';

export interface Consultation {
  id: string;
  tokenId: string;
  patientId: string;
  doctorId: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  outcome: ConsultationOutcome;
  referredTo?: string;
  startedAt: string;
  endedAt?: string;
}

// ─── Staff / Auth ─────────────────────────────────────────────────────────────

export type StaffRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

export interface StaffUser {
  id: string;
  name: string;
  employeeId: string;
  role: StaffRole;
  departmentId?: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface AuthSession {
  user: StaffUser;
  token: string;
  expiresAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string;
  totalTokens: number;
  totalServed: number;
  totalNoShows: number;
  totalCancelled: number;
  averageWaitMinutes: number;
  averageConsultMinutes: number;
  peakHour: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  patientId: string;
  tokenId: string;
  channel: 'SMS' | 'WHATSAPP' | 'PUSH';
  message: string;
  sentAt: string;
  delivered: boolean;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────

export type WSEventType =
  | 'TOKEN_CALLED'
  | 'TOKEN_STATUS_CHANGED'
  | 'QUEUE_UPDATED'
  | 'DOCTOR_STATUS_CHANGED'
  | 'QUEUE_PAUSED'
  | 'QUEUE_RESUMED'
  | 'OVERFLOW_MODE_ACTIVATED';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  departmentId: string;
  payload: T;
  timestamp: string;
}
