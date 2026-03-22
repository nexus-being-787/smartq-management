'use client';

import { useState } from 'react';

const HOURLY_DATA = [
  { hour: '8am',  tokens: 12, served: 10, noshow: 1, wait: 18 },
  { hour: '9am',  tokens: 28, served: 25, noshow: 2, wait: 32 },
  { hour: '10am', tokens: 45, served: 41, noshow: 3, wait: 54 },
  { hour: '11am', tokens: 52, served: 48, noshow: 2, wait: 61 },
  { hour: '12pm', tokens: 38, served: 35, noshow: 1, wait: 44 },
  { hour: '1pm',  tokens: 19, served: 17, noshow: 0, wait: 22 },
  { hour: '2pm',  tokens: 34, served: 30, noshow: 2, wait: 40 },
  { hour: '3pm',  tokens: 41, served: 37, noshow: 3, wait: 48 },
];

const DEPT_STATS = [
  { name: 'General Medicine', served: 87, noshow: 8,  avgWait: 42, avgConsult: 8  },
  { name: 'Paediatrics',      served: 64, noshow: 3,  avgWait: 28, avgConsult: 7  },
  { name: 'Orthopaedics',     served: 41, noshow: 5,  avgWait: 55, avgConsult: 12 },
  { name: 'Cardiology',       served: 29, noshow: 2,  avgWait: 38, avgConsult: 15 },
  { name: 'Dermatology',      served: 35, noshow: 6,  avgWait: 31, avgConsult: 9  },
];

const maxTokens = Math.max(...HOURLY_DATA.map(d => d.tokens));
const maxWait   = Math.max(...HOURLY_DATA.map(d => d.wait));
const W = 80; // px per bar column

export default function AnalyticsPage() {
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');

  const totalServed = HOURLY_DATA.reduce((s, d) => s + d.served, 0);
  const totalNoShow = HOURLY_DATA.reduce((s, d) => s + d.noshow, 0);
  const totalTokens = HOURLY_DATA.reduce((s, d) => s + d.tokens, 0);
  const peakHour    = HOURLY_DATA.reduce((a, b) => (a.tokens > b.tokens ? a : b)).hour;
  const avgWait     = Math.round(HOURLY_DATA.reduce((s, d) => s + d.wait, 0) / HOURLY_DATA.length);

  // Build SVG polyline for wait trend
  const svgW = HOURLY_DATA.length * W;
  const svgH = 80;
  const waitPts = HOURLY_DATA
    .map((d, i) => `${i * W + W / 2},${svgH - (d.wait / maxWait) * (svgH - 8)}`)
    .join(' ');
  const areaPath =
    `M${W / 2},${svgH} ` +
    HOURLY_DATA.map((d, i) => `L${i * W + W / 2},${svgH - (d.wait / maxWait) * (svgH - 8)}`).join(' ') +
    ` L${(HOURLY_DATA.length - 1) * W + W / 2},${svgH} Z`;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <a href="/admin/dashboard" className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1">
          ← Dashboard
        </a>
        <span className="text-slate-200">/</span>
        <h1 className="font-semibold text-slate-800">Analytics &amp; Reports</h1>

        <div className="ml-auto flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(['today', 'week', 'month'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                range === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm ml-2">Export CSV</button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total tokens',  value: totalTokens,   color: '' },
            { label: 'Served',        value: totalServed,   color: 'text-green-600' },
            { label: 'No-shows',      value: totalNoShow,   color: 'text-red-500' },
            { label: 'Avg wait',      value: `${avgWait}m`, color: '' },
            { label: 'Peak hour',     value: peakHour,      color: '' },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 tracking-tight ${k.color || 'text-slate-900'}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Hourly bar chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Hourly throughput</h2>
            <div className="flex gap-5">
              {[
                { color: 'bg-brand-600', label: 'Served' },
                { color: 'bg-brand-200', label: 'Pending' },
                { color: 'bg-red-300',   label: 'No-show' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2" style={{ height: 128 }}>
            {HOURLY_DATA.map(d => {
              const barH = Math.round((d.tokens / maxTokens) * 100);
              const servedPct = Math.round((d.served / d.tokens) * 100);
              const noshowPct = Math.round((d.noshow / d.tokens) * 100);
              return (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-400 tabular-nums">{d.tokens}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-brand-100" style={{ height: barH }}>
                    {/* served */}
                    <div className="absolute bottom-0 left-0 right-0 bg-brand-500" style={{ height: `${servedPct}%` }} />
                    {/* no-show on top */}
                    {d.noshow > 0 && (
                      <div className="absolute top-0 left-0 right-0 bg-red-300" style={{ height: `${noshowPct}%` }} />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{d.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wait time trend */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Average wait time (minutes)</h2>
          <div className="overflow-x-auto">
            <svg width={svgW} height={svgH + 24} style={{ display: 'block', minWidth: '100%' }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A9E72" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1A9E72" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#wg)" />
              <polyline points={waitPts} fill="none" stroke="#1A9E72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {HOURLY_DATA.map((d, i) => (
                <g key={i}>
                  <circle cx={i * W + W / 2} cy={svgH - (d.wait / maxWait) * (svgH - 8)} r="4" fill="#1A9E72" />
                  <text x={i * W + W / 2} y={svgH + 18} textAnchor="middle" fontSize="11" fill="#94A3B8">{d.hour}</text>
                  <text x={i * W + W / 2} y={svgH - (d.wait / maxWait) * (svgH - 8) - 8} textAnchor="middle" fontSize="10" fill="#475569">{d.wait}m</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Dept breakdown table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Department breakdown</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Department', 'Served', 'No-shows', 'No-show %', 'Avg wait', 'Avg consult'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DEPT_STATS.map(d => {
                const nsPct = ((d.noshow / (d.served + d.noshow)) * 100).toFixed(1);
                return (
                  <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{d.name}</td>
                    <td className="px-6 py-4 text-slate-700 tabular-nums">{d.served}</td>
                    <td className="px-6 py-4 text-red-500 tabular-nums">{d.noshow}</td>
                    <td className="px-6 py-4 tabular-nums">
                      <span className={`font-semibold ${parseFloat(nsPct) > 10 ? 'text-red-500' : 'text-slate-600'}`}>
                        {nsPct}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 tabular-nums">{d.avgWait}m</td>
                    <td className="px-6 py-4 text-slate-600 tabular-nums">{d.avgConsult}m</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
