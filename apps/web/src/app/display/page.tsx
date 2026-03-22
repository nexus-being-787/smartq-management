'use client';

import { useState, useEffect } from 'react';

const MOCK_CALLED = [
  { token: 'GM042', counter: 'Room 1', dept: 'General Medicine' },
  { token: 'OR038', counter: 'Room 4', dept: 'Orthopaedics' },
  { token: 'CA011', counter: 'Room 6', dept: 'Cardiology' },
];

const MOCK_RECENT = [
  { token: 'GM041', counter: 'Room 1' },
  { token: 'PE021', counter: 'Room 8' },
  { token: 'GM040', counter: 'Room 2' },
  { token: 'OR037', counter: 'Room 4' },
];

export default function DisplayBoard() {
  const [time, setTime] = useState('');
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const b = setInterval(() => setBlink(v => !v), 800);
    return () => clearInterval(b);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
        .marquee { animation: marquee 20s linear infinite; }
      `}</style>

      <header className="flex items-center justify-between px-10 py-5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="18" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M10 17h12M16 11v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold leading-none">SmartQ</p>
            <p className="text-slate-400 text-sm">City General Hospital — OPD</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums">{time}</p>
          <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </header>

      <div className="px-10 py-8 flex-1">
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-6">Now calling</p>

        <div className="grid grid-cols-3 gap-6 mb-10">
          {MOCK_CALLED.map((c, i) => (
            <div key={c.token} className={`rounded-3xl p-8 flex flex-col items-center justify-center border-2 ${
              i === 0 ? 'bg-brand-500 border-brand-400 shadow-2xl shadow-brand-900' : 'bg-slate-800 border-slate-700'
            }`}>
              {i === 0 && (
                <span className={`text-xs font-bold uppercase tracking-widest mb-3 transition-opacity ${blink ? 'opacity-100' : 'opacity-0'} text-brand-100`}>
                  ● Please proceed
                </span>
              )}
              <p className="display-token">{c.token}</p>
              <p className={`text-lg font-semibold mt-2 ${i === 0 ? 'text-brand-100' : 'text-slate-300'}`}>{c.counter}</p>
              <p className={`text-sm mt-1 ${i === 0 ? 'text-brand-200' : 'text-slate-500'}`}>{c.dept}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
          <div className="px-6 py-4 border-b border-slate-800">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Recently called</p>
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-800">
            {MOCK_RECENT.map(r => (
              <div key={r.token} className="px-6 py-5 text-center">
                <p className="text-3xl font-bold text-slate-400 tabular-nums">{r.token}</p>
                <p className="text-slate-600 text-sm mt-1">{r.counter}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand-500 px-10 py-3 flex items-center gap-4 overflow-hidden">
        <span className="text-white text-sm font-bold shrink-0">📢 NOTICE</span>
        <p className="marquee text-brand-100 text-sm whitespace-nowrap">
          Please listen for your token number · Keep your token slip handy · Emergency tokens are called first · SmartQ — Making your wait smarter
        </p>
      </div>
    </div>
  );
}
