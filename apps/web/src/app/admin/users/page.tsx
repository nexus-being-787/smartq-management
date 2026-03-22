'use client';

import { useState } from 'react';
import type { StaffUser, StaffRole } from '@smartq/types';

const MOCK_USERS: StaffUser[] = [
  { id: 'u1', name: 'Dr. Priya Nair',       employeeId: 'DR-001', role: 'DOCTOR',        departmentId: 'gm',    isActive: true,  lastLogin: '2024-12-15T09:12:00Z' },
  { id: 'u2', name: 'Dr. Ravi Shankar',     employeeId: 'DR-002', role: 'DOCTOR',        departmentId: 'ortho', isActive: true,  lastLogin: '2024-12-15T08:45:00Z' },
  { id: 'u3', name: 'Dr. Seetha Lakshmanan',employeeId: 'DR-003', role: 'DOCTOR',        departmentId: 'cardio',isActive: true,  lastLogin: '2024-12-14T17:30:00Z' },
  { id: 'u4', name: 'Kavitha R.',            employeeId: 'RC-001', role: 'RECEPTIONIST',  departmentId: 'gm',    isActive: true,  lastLogin: '2024-12-15T08:00:00Z' },
  { id: 'u5', name: 'Murugan S.',            employeeId: 'RC-002', role: 'RECEPTIONIST',  departmentId: 'ortho', isActive: false, lastLogin: '2024-12-10T12:00:00Z' },
  { id: 'u6', name: 'System Admin',          employeeId: 'AD-001', role: 'ADMIN',         isActive: true,        lastLogin: '2024-12-15T07:00:00Z' },
];

const ROLE_COLORS: Record<StaffRole, string> = {
  ADMIN:        'bg-purple-50 text-purple-700 border-purple-200',
  DOCTOR:       'bg-blue-50 text-blue-700 border-blue-200',
  RECEPTIONIST: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'ALL'>('ALL');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function toggleActive(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  }

  function fmtDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <a href="/admin/dashboard" className="text-slate-400 hover:text-slate-700 text-sm">← Dashboard</a>
        <span className="text-slate-200">/</span>
        <h1 className="font-semibold text-slate-800">User Management</h1>
        <button className="btn-primary text-sm ml-auto">+ Add user</button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Employee ID', 'Role', 'Department', 'Last login', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">{u.employeeId}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role]}`}>
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{u.departmentId ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{fmtDate(u.lastLogin)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      u.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="text-xs text-brand-600 hover:text-brand-800 font-medium">Edit</button>
                      <button
                        onClick={() => toggleActive(u.id)}
                        className={`text-xs font-medium ${u.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} of {users.length} users
          </div>
        </div>
      </div>
    </div>
  );
}
