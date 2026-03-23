'use client';

import { useState, useEffect } from 'react';
import type { Department, Doctor } from '@smartq/types';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_DEPARTMENTS: Department[] = [
  { id: 'gm', name: 'General Medicine', code: 'GM', currentQueueLength: 14, estimatedWaitMinutes: 112, isActive: true, doctors: [] },
  { id: 'ortho', name: 'Orthopaedics', code: 'OR', currentQueueLength: 7, estimatedWaitMinutes: 56, isActive: true, doctors: [] },
  { id: 'cardio', name: 'Cardiology', code: 'CA', currentQueueLength: 3, estimatedWaitMinutes: 24, isActive: true, doctors: [] },
  { id: 'peds', name: 'Paediatrics', code: 'PE', currentQueueLength: 9, estimatedWaitMinutes: 72, isActive: true, doctors: [] },
  { id: 'derm', name: 'Dermatology', code: 'DE', currentQueueLength: 5, estimatedWaitMinutes: 40, isActive: false, doctors: [] },
];

const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Priya Nair', specialization: 'General Medicine', departmentId: 'gm', status: 'IN_CONSULTATION', todayServed: 18, todayPending: 7, averageConsultMinutes: 8 },
  { id: 'd2', name: 'Dr. Ravi Shankar', specialization: 'Orthopaedics', departmentId: 'ortho', status: 'AVAILABLE', todayServed: 12, todayPending: 3, averageConsultMinutes: 12 },
  { id: 'd3', name: 'Dr. Seetha Lakshmanan', specialization: 'Cardiology', departmentId: 'cardio', status: 'ON_BREAK', todayServed: 8, todayPending: 3, averageConsultMinutes: 15 },
  { id: 'd4', name: 'Dr. Aruna Pillai', specialization: 'Paediatrics', departmentId: 'peds', status: 'AVAILABLE', todayServed: 22, todayPending: 9, averageConsultMinutes: 7 },
];

const INITIAL_ACTIVITY_LOG = [
  { id: 5, time: '14:33', action: 'Emergency token issued — Cardiology', actor: 'Receptionist', type: 'error' },
  { id: 1, time: '14:32', action: 'Token GM042 marked CONSULTED', actor: 'Dr. Priya Nair', type: 'success' },
  { id: 2, time: '14:29', action: 'Overflow mode activated — Paediatrics', actor: 'Admin', type: 'warning' },
  { id: 3, time: '14:21', action: 'Token OR038 — NO SHOW (2nd)', actor: 'System', type: 'error' },
  { id: 4, time: '14:15', action: 'Dr. Seetha started break', actor: 'Dr. Seetha', type: 'info' },
  { id: 6, time: '13:55', action: 'SMS broadcast sent to 9 patients', actor: 'System', type: 'info' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </a>
  );
}

function StatusBadge({ status }: { status: Doctor['status'] }) {
  const map: Record<Doctor['status'], { label: string; cls: string }> = {
    AVAILABLE: { label: 'Available', cls: 'bg-green-50 text-green-700 border-green-200' },
    IN_CONSULTATION: { label: 'In consult', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    ON_BREAK: { label: 'On break', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ABSENT: { label: 'Absent', cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

function QueueBar({ length, max }: { length: number; max: number }) {
  const pct = Math.min((length / max) * 100, 100);
  const color = pct > 75 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-brand-400';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [depts, setDepts] = useState(MOCK_DEPARTMENTS);
  const [pausedDepts, setPausedDepts] = useState<Set<string>>(new Set());

  const totalInQueue = depts.reduce((s, d) => s + d.currentQueueLength, 0);
  const activeDoctors = MOCK_DOCTORS.filter(d => d.status !== 'ABSENT').length;
  const servedToday = MOCK_DOCTORS.reduce((s, d) => s + d.todayServed, 0);

  function togglePause(deptId: string) {
    setPausedDepts(prev => {
      const next = new Set(prev);
      next.has(deptId) ? next.delete(deptId) : next.add(deptId);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="8" width="24" height="18" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M10 17h12M16 11v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-none">SmartQ</p>
              <p className="text-xs text-slate-400 mt-0.5">Admin panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/admin/dashboard" active>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </NavLink>
          <NavLink href="/admin/users">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            Users
          </NavLink>
          <NavLink href="/admin/analytics">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Analytics
          </NavLink>
          <NavLink href="/display">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Display board
          </NavLink>
        </nav>

        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">A</div>
            <div>
              <p className="text-sm font-medium text-slate-800 leading-none">Admin</p>
              <p className="text-xs text-slate-400">System admin</p>
            </div>
          </div>
          <a href="/login" className="btn-ghost w-full text-left text-sm mt-1 block">Sign out</a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 min-h-screen">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">All departments · Real-time</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-ghost text-sm border border-slate-200">
              📤 Export report
            </button>
            <button className="btn-primary text-sm">
              📢 Broadcast SMS
            </button>
          </div>
        </div>

        {/* System stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total in queue', value: totalInQueue, sub: 'all departments' },
            { label: 'Active doctors', value: `${activeDoctors}/${MOCK_DOCTORS.length}`, sub: 'on duty' },
            { label: 'Served today', value: servedToday, sub: 'consultations' },
            { label: 'System health', value: '✓ OK', sub: 'all services running' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Departments */}
          <div className="col-span-2 card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Departments</h2>
              <span className="text-xs text-slate-400">{depts.filter(d => d.isActive).length} active</span>
            </div>
            <div className="divide-y divide-slate-50">
              {depts.map(dept => {
                const isPaused = pausedDepts.has(dept.id);
                return (
                  <div key={dept.id} className="px-5 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      dept.isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {dept.code}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 text-sm">{dept.name}</p>
                        {isPaused && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Paused</span>}
                        {!dept.isActive && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{dept.currentQueueLength} waiting</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">~{dept.estimatedWaitMinutes}m</span>
                      </div>
                      <QueueBar length={dept.currentQueueLength} max={20} />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePause(dept.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                          isPaused
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded-lg font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                        Override
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: doctors + activity */}
          <div className="space-y-4">

            {/* Doctors on duty */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-sm">Doctors on duty</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_DOCTORS.map(doc => (
                  <div key={doc.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-800 truncate pr-2">{doc.name}</p>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-xs text-slate-400">{doc.todayServed} served · {doc.todayPending} pending</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity log */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-sm">Activity log</h2>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {activityLog.map(log => (
                  <div key={log.id} className="px-4 py-2.5">
                    <div className="flex items-start gap-2">
                      <span className={`text-xs mt-0.5 ${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'warning' ? 'text-amber-500' :
                        log.type === 'success' ? 'text-green-500' : 'text-slate-400'
                      }`}>●</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-snug">{log.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{log.time} · {log.actor}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
