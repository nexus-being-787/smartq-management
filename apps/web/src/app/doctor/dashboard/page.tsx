'use client';

import { useState, useEffect } from 'react';
import type { Token, Doctor, Patient } from '@smartq/types';

// ─── Mock data (replace with @smartq/api-client calls) ───────────────────────

const MOCK_DOCTOR: Doctor = {
  id: 'd1',
  name: 'Dr. Priya Nair',
  specialization: 'General Medicine',
  departmentId: 'dept-gm',
  status: 'AVAILABLE',
  todayServed: 18,
  todayPending: 7,
  averageConsultMinutes: 8,
};

const MOCK_QUEUE: Array<Token & { patient: Patient }> = [
  {
    id: 't1', number: 42, displayNumber: 'GM042', patientId: 'p1',
    departmentId: 'dept-gm', status: 'CALLED', priority: 'REGULAR',
    issuedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
    estimatedWaitMinutes: 0, queuePosition: 1, noShowCount: 0,
    patient: { id: 'p1', name: 'Rajan Kumar', mobile: '9876543210', age: 54, gender: 'M', isReturning: true, lastVisit: '2024-11-12' },
  },
  {
    id: 't2', number: 43, displayNumber: 'GM043', patientId: 'p2',
    departmentId: 'dept-gm', status: 'ISSUED', priority: 'PRIORITY',
    issuedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    estimatedWaitMinutes: 8, queuePosition: 2, noShowCount: 0,
    patient: { id: 'p2', name: 'Meena Subramanian', mobile: '9123456780', age: 68, gender: 'F', isReturning: false },
  },
  {
    id: 't3', number: 44, displayNumber: 'GM044', patientId: 'p3',
    departmentId: 'dept-gm', status: 'ISSUED', priority: 'REGULAR',
    issuedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedWaitMinutes: 16, queuePosition: 3, noShowCount: 0,
    patient: { id: 'p3', name: 'Arjun Pillai', mobile: '9988776655', age: 32, gender: 'M', isReturning: true },
  },
  {
    id: 't4', number: 45, displayNumber: 'GM045', patientId: 'p4',
    departmentId: 'dept-gm', status: 'ISSUED', priority: 'EMERGENCY',
    issuedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedWaitMinutes: 0, queuePosition: 4, noShowCount: 0,
    patient: { id: 'p4', name: 'Kavitha Mohan', mobile: '9001234567', age: 45, gender: 'F', isReturning: false },
  },
];

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'EMERGENCY') return <span className="badge-emergency">Emergency</span>;
  if (priority === 'PRIORITY') return <span className="badge-priority">Priority</span>;
  return <span className="badge-regular">Regular</span>;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-500',
    ON_BREAK: 'bg-amber-500',
    ABSENT: 'bg-red-500',
    IN_CONSULTATION: 'bg-blue-500',
  };
  return <span className={`status-dot ${colors[status] ?? 'bg-slate-400'} animate-pulse-slow`} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(MOCK_DOCTOR);
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [selectedToken, setSelectedToken] = useState<typeof MOCK_QUEUE[0] | null>(MOCK_QUEUE[0]);
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);

  // Tick consultation timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentToken = queue.find(t => t.status === 'CALLED');
  const upcomingTokens = queue.filter(t => t.status === 'ISSUED');

  function callNext() {
    setQueue(prev => {
      const sorted = [...prev];
      const nextIdx = sorted.findIndex(t => t.status === 'ISSUED');
      if (nextIdx === -1) return prev;
      sorted[nextIdx] = { ...sorted[nextIdx], status: 'CALLED' };
      return sorted;
    });
  }

  function completeConsultation(outcome: string) {
    setQueue(prev =>
      prev.map(t => t.status === 'CALLED'
        ? { ...t, status: outcome as any }
        : t
      )
    );
    setNotes('');
    setElapsed(0);
  }

  const toggleStatus = () => {
    setDoctor(d => ({
      ...d,
      status: d.status === 'AVAILABLE' ? 'ON_BREAK' : 'AVAILABLE',
    }));
  };

  const fmtElapsed = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="18" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M10 17h12M16 11v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">SmartQ</h1>
            <p className="text-xs text-slate-500 mt-0.5">{doctor.specialization}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusDot status={doctor.status} />
            <span className="text-sm text-slate-600 font-medium">{doctor.name}</span>
          </div>
          <button
            onClick={toggleStatus}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              doctor.status === 'AVAILABLE'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {doctor.status === 'AVAILABLE' ? 'Take break' : 'Resume'}
          </button>
          <a href="/login" className="btn-ghost text-sm">Sign out</a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Served today" value={doctor.todayServed} sub="consultations" />
          <StatCard label="In queue" value={upcomingTokens.length} sub="waiting" />
          <StatCard label="Avg. consult" value={`${doctor.averageConsultMinutes}m`} sub="per patient" />
          <StatCard label="Session time" value={fmtElapsed} sub="current patient" />
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left: Queue list */}
          <div className="col-span-1">
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Queue</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {upcomingTokens.length} waiting
                </span>
              </div>

              {/* Current token */}
              {currentToken && (
                <div className="px-5 py-4 bg-brand-50 border-b border-brand-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Now calling</span>
                    <PriorityBadge priority={currentToken.priority} />
                  </div>
                  <p className="text-2xl font-bold text-brand-700 token-number">{currentToken.displayNumber}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{currentToken.patient.name}</p>
                  <p className="text-xs text-slate-500">{currentToken.patient.age}y · {currentToken.patient.gender} · {currentToken.patient.isReturning ? 'Returning' : 'New'}</p>
                </div>
              )}

              {/* Upcoming */}
              <div className="divide-y divide-slate-50">
                {upcomingTokens.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedToken(t)}
                    className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                      selectedToken?.id === t.id ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 w-4">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm token-number">{t.displayNumber}</p>
                          <p className="text-xs text-slate-500">{t.patient.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <PriorityBadge priority={t.priority} />
                        <p className="text-xs text-slate-400 mt-1">~{t.estimatedWaitMinutes}m</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Call next button */}
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={callNext}
                  disabled={!currentToken || doctor.status !== 'AVAILABLE'}
                  className="btn-primary w-full"
                >
                  Call next patient
                </button>
              </div>
            </div>
          </div>

          {/* Right: Patient card + consultation */}
          <div className="col-span-2 space-y-4">

            {/* Patient info card */}
            {(selectedToken || currentToken) && (() => {
              const t = currentToken ?? selectedToken!;
              return (
                <div className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900">{t.patient.name}</h2>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-slate-500 text-sm">
                        {t.patient.age} years · {t.patient.gender === 'M' ? 'Male' : t.patient.gender === 'F' ? 'Female' : 'Other'} ·{' '}
                        Token <span className="font-semibold text-brand-600">{t.displayNumber}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Mobile</p>
                      <p className="text-sm font-medium text-slate-700">{t.patient.mobile}</p>
                      {t.patient.lastVisit && (
                        <>
                          <p className="text-xs text-slate-400 mt-1">Last visit</p>
                          <p className="text-xs text-slate-600">{t.patient.lastVisit}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Medical history</p>
                      <p className="text-sm text-slate-700">{t.patient.medicalHistory ?? 'No recorded history'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Allergies</p>
                      <p className="text-sm text-slate-700">{t.patient.allergies ?? 'None known'}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Consultation notes */}
            <div className="card p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Consultation notes</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Diagnosis, prescription, observations..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-transparent transition-all resize-none text-sm"
              />

              {/* Outcome buttons */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <button
                  onClick={() => completeConsultation('COMPLETED')}
                  className="py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm
                             border border-green-200 hover:bg-green-100 transition-colors"
                >
                  ✓ Consulted
                </button>
                <button
                  onClick={() => completeConsultation('REFERRED')}
                  className="py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm
                             border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  → Referred
                </button>
                <button
                  onClick={() => completeConsultation('ADMITTED')}
                  className="py-3 rounded-xl bg-purple-50 text-purple-700 font-semibold text-sm
                             border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  + Admitted
                </button>
                <button
                  onClick={() => completeConsultation('NO_SHOW')}
                  className="py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm
                             border border-red-200 hover:bg-red-100 transition-colors"
                >
                  ✕ No-show
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
