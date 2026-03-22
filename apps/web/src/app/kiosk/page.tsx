'use client';

import { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type KioskStep = 'welcome' | 'patient-type' | 'mobile' | 'otp' | 'department' | 'doctor' | 'confirm' | 'token';
type PatientType = 'NEW' | 'RETURNING' | 'APPOINTMENT';
type Language = 'EN' | 'TA' | 'HI';

interface Dept { id: string; name: string; code: string; wait: number; queue: number; }
interface Doc  { id: string; name: string; wait: number; }

// ─── Mock data ─────────────────────────────────────────────────────────────────

const DEPARTMENTS: Dept[] = [
  { id: 'gm', name: 'General Medicine', code: 'GM', wait: 35, queue: 5 },
  { id: 'ortho', name: 'Orthopaedics', code: 'OR', wait: 52, queue: 7 },
  { id: 'cardio', name: 'Cardiology', code: 'CA', wait: 20, queue: 3 },
  { id: 'peds', name: 'Paediatrics', code: 'PE', wait: 15, queue: 2 },
  { id: 'derm', name: 'Dermatology', code: 'DE', wait: 40, queue: 5 },
  { id: 'ent', name: 'ENT', code: 'EN', wait: 28, queue: 4 },
];

const DOCTORS: Doc[] = [
  { id: 'd1', name: 'Dr. Priya Nair', wait: 35 },
  { id: 'd2', name: 'Dr. Arun Verma', wait: 60 },
];

const LABELS: Record<Language, Record<string, string>> = {
  EN: { welcome: 'Welcome to SmartQ', selectLang: 'Select language', start: 'Get started', new: 'New patient', returning: 'Returning patient', appointment: 'I have an appointment', selectDept: 'Select department', waiting: 'waiting', mins: 'min wait', your_token: 'Your token', print: 'Print token', done: 'Done', enterMobile: 'Enter mobile number', continue: 'Continue', enterOTP: 'Enter OTP', back: 'Back' },
  TA: { welcome: 'SmartQ-க்கு வரவேற்கிறோம்', selectLang: 'மொழியை தேர்வு செய்யவும்', start: 'தொடங்கவும்', new: 'புதிய நோயாளி', returning: 'திரும்பி வந்த நோயாளி', appointment: 'எனக்கு appointment உள்ளது', selectDept: 'பிரிவை தேர்ந்தெடுக்கவும்', waiting: 'காத்திருக்கின்றனர்', mins: 'நிமிட காத்திருப்பு', your_token: 'உங்கள் token', print: 'Print பெறுக', done: 'முடிந்தது', enterMobile: 'Mobile எண் உள்ளிடவும்', continue: 'தொடர்க', enterOTP: 'OTP உள்ளிடவும்', back: 'பின் செல்' },
  HI: { welcome: 'SmartQ में आपका स्वागत है', selectLang: 'भाषा चुनें', start: 'शुरू करें', new: 'नया मरीज़', returning: 'पुराना मरीज़', appointment: 'मेरी अपॉइंटमेंट है', selectDept: 'विभाग चुनें', waiting: 'प्रतीक्षारत', mins: 'मिनट प्रतीक्षा', your_token: 'आपका टोकन', print: 'प्रिंट करें', done: 'हो गया', enterMobile: 'मोबाइल नंबर डालें', continue: 'जारी रखें', enterOTP: 'OTP डालें', back: 'वापस' },
};

// ─── Step indicator ────────────────────────────────────────────────────────────

const STEPS: KioskStep[] = ['welcome', 'patient-type', 'mobile', 'otp', 'department', 'doctor', 'confirm', 'token'];

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
      done ? 'bg-brand-500' : active ? 'bg-brand-400 ring-4 ring-brand-100' : 'bg-slate-200'
    }`} />
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function KioskPage() {
  const [step, setStep] = useState<KioskStep>('welcome');
  const [lang, setLang] = useState<Language>('EN');
  const [patientType, setPatientType] = useState<PatientType | null>(null);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedDept, setSelectedDept] = useState<Dept | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [tokenNumber] = useState('GM043');

  const t = LABELS[lang];
  const stepIdx = STEPS.indexOf(step);

  const go = (s: KioskStep) => setStep(s);
  const back = () => setStep(STEPS[Math.max(0, stepIdx - 1)]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 select-none">

      {/* Progress dots */}
      {step !== 'welcome' && step !== 'token' && (
        <div className="flex gap-2 mb-8">
          {STEPS.filter(s => s !== 'welcome' && s !== 'token').map((s, i) => (
            <StepDot
              key={s}
              active={s === step}
              done={STEPS.indexOf(s) < stepIdx}
            />
          ))}
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-2xl">

        {/* ── WELCOME ───────────────────────────────────────────── */}
        {step === 'welcome' && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-brand-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-900">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="8" width="24" height="18" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M10 17h12M16 11v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{t.welcome}</h1>
            <p className="text-slate-400 text-lg mb-10">City General Hospital</p>

            {/* Language selection */}
            <p className="text-slate-500 text-sm mb-4">{t.selectLang}</p>
            <div className="flex gap-3 justify-center mb-10">
              {(['EN', 'TA', 'HI'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all kiosk-btn ${
                    lang === l
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {l === 'EN' ? 'English' : l === 'TA' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>

            <button
              onClick={() => go('patient-type')}
              className="bg-brand-500 hover:bg-brand-400 text-white text-xl font-semibold px-16 py-5 rounded-2xl
                         transition-all active:scale-95 shadow-xl shadow-brand-900 kiosk-btn"
            >
              {t.start} →
            </button>
          </div>
        )}

        {/* ── PATIENT TYPE ──────────────────────────────────────── */}
        {step === 'patient-type' && (
          <div className="animate-fade-in">
            <button onClick={back} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← {t.back}
            </button>
            <div className="space-y-4">
              {[
                { type: 'NEW' as PatientType, label: t.new, icon: '👤', sub: 'Create new profile' },
                { type: 'RETURNING' as PatientType, label: t.returning, icon: '↩', sub: 'Load existing profile' },
                { type: 'APPOINTMENT' as PatientType, label: t.appointment, icon: '📅', sub: 'Scan QR or enter booking ID' },
              ].map(o => (
                <button
                  key={o.type}
                  onClick={() => { setPatientType(o.type); go('mobile'); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-left px-8 py-6 rounded-2xl
                             border border-slate-700 hover:border-brand-500 transition-all kiosk-btn
                             flex items-center gap-6 group"
                >
                  <span className="text-4xl">{o.icon}</span>
                  <div>
                    <p className="text-white text-xl font-semibold">{o.label}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{o.sub}</p>
                  </div>
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-brand-400 ml-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MOBILE ────────────────────────────────────────────── */}
        {step === 'mobile' && (
          <div className="animate-fade-in">
            <button onClick={back} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← {t.back}
            </button>
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
              <p className="text-white text-2xl font-bold mb-2">{t.enterMobile}</p>
              <p className="text-slate-400 mb-6">An OTP will be sent to verify your number</p>
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="w-full bg-slate-900 text-white text-3xl font-bold text-center py-6 px-4 rounded-2xl
                           border border-slate-600 focus:outline-none focus:border-brand-400
                           tracking-widest placeholder:text-slate-600"
              />
              <button
                onClick={() => go('otp')}
                disabled={mobile.length < 10}
                className="btn-primary w-full mt-6 text-xl py-5 disabled:opacity-40"
              >
                {t.continue}
              </button>
            </div>
          </div>
        )}

        {/* ── OTP ───────────────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="animate-fade-in">
            <button onClick={back} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← {t.back}
            </button>
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center">
              <p className="text-white text-2xl font-bold mb-2">{t.enterOTP}</p>
              <p className="text-slate-400 mb-6">Sent to +91 {mobile}</p>
              <div className="flex gap-3 justify-center mb-6">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className={`w-12 h-14 rounded-xl border flex items-center justify-center text-2xl font-bold text-white
                    ${otp[i] ? 'bg-slate-900 border-brand-400' : 'bg-slate-900 border-slate-600'}`}>
                    {otp[i] ?? ''}
                  </div>
                ))}
              </div>
              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (n === '⌫') setOtp(o => o.slice(0,-1));
                      else if (n !== '') setOtp(o => o.length < 6 ? o + n : o);
                    }}
                    className={`py-4 rounded-2xl text-xl font-semibold transition-all active:scale-95 ${
                      n === '' ? '' : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >{n}</button>
                ))}
              </div>
              <button
                onClick={() => go('department')}
                disabled={otp.length < 6}
                className="btn-primary w-full mt-6 text-xl py-5 disabled:opacity-40"
              >
                Verify →
              </button>
            </div>
          </div>
        )}

        {/* ── DEPARTMENT ────────────────────────────────────────── */}
        {step === 'department' && (
          <div className="animate-fade-in">
            <button onClick={back} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← {t.back}
            </button>
            <h2 className="text-2xl font-bold text-white mb-5">{t.selectDept}</h2>
            <div className="grid grid-cols-2 gap-3">
              {DEPARTMENTS.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDept(d); go('doctor'); }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500
                             rounded-2xl p-5 text-left transition-all kiosk-btn group"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-brand-400 text-xs font-bold bg-brand-950 px-2 py-0.5 rounded">{d.code}</span>
                    <span className={`text-xs font-medium ${d.wait > 45 ? 'text-red-400' : d.wait > 25 ? 'text-amber-400' : 'text-green-400'}`}>
                      ~{d.wait}{t.mins.split(' ')[0]}m
                    </span>
                  </div>
                  <p className="text-white font-semibold mt-3">{d.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{d.queue} {t.waiting}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCTOR ────────────────────────────────────────────── */}
        {step === 'doctor' && (
          <div className="animate-fade-in">
            <button onClick={back} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← {t.back}
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Select doctor <span className="text-slate-500 font-normal text-lg">(optional)</span></h2>
            <p className="text-slate-400 mb-5">in {selectedDept?.name}</p>
            <div className="space-y-3 mb-6">
              {DOCTORS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc); go('confirm'); }}
                  className={`w-full bg-slate-800 hover:bg-slate-700 border transition-all rounded-2xl p-5 text-left kiosk-btn flex items-center justify-between ${
                    selectedDoc?.id === doc.id ? 'border-brand-500' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <p className="text-white text-lg font-semibold">{doc.name}</p>
                    <p className="text-slate-400 text-sm mt-0.5">~{doc.wait} min wait</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}
              <button
                onClick={() => { setSelectedDoc(null); go('confirm'); }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500
                           rounded-2xl p-5 text-left kiosk-btn text-slate-400 hover:text-white transition-all"
              >
                No preference — next available doctor
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIRM ───────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="animate-fade-in">
            <button onClick={back} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← {t.back}
            </button>
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Confirm details</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Mobile</span>
                  <span className="text-white font-medium">+91 {mobile}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Department</span>
                  <span className="text-white font-medium">{selectedDept?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Doctor</span>
                  <span className="text-white font-medium">{selectedDoc?.name ?? 'Next available'}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Est. wait</span>
                  <span className="text-green-400 font-semibold">~{selectedDoc?.wait ?? selectedDept?.wait} min</span>
                </div>
              </div>
              <button
                onClick={() => go('token')}
                className="btn-primary w-full text-xl py-5"
              >
                Get token →
              </button>
            </div>
          </div>
        )}

        {/* ── TOKEN ─────────────────────────────────────────────── */}
        {step === 'token' && (
          <div className="animate-fade-in text-center">
            <div className="bg-slate-800 rounded-3xl p-10 border border-brand-500 shadow-xl shadow-brand-900/30">
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">{t.your_token}</p>
              <div className="display-token text-white my-4">{tokenNumber}</div>
              <p className="text-slate-400 text-lg mb-1">{selectedDept?.name}</p>
              {selectedDoc && <p className="text-slate-500 text-sm">{selectedDoc.name}</p>}

              <div className="flex gap-4 mt-3 justify-center text-sm text-slate-500">
                <span>Queue position: <b className="text-white">5</b></span>
                <span>·</span>
                <span>Est. wait: <b className="text-green-400">~{selectedDept?.wait}m</b></span>
              </div>

              <div className="mt-8 p-4 bg-slate-900 rounded-2xl">
                <p className="text-slate-400 text-sm mb-3">Track from your phone — SMS sent to +91 {mobile}</p>
                {/* QR placeholder */}
                <div className="w-24 h-24 bg-white rounded-xl mx-auto flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <rect x="4" y="4" width="22" height="22" rx="2" fill="#1a1a1a"/>
                    <rect x="9" y="9" width="12" height="12" rx="1" fill="white"/>
                    <rect x="34" y="4" width="22" height="22" rx="2" fill="#1a1a1a"/>
                    <rect x="39" y="9" width="12" height="12" rx="1" fill="white"/>
                    <rect x="4" y="34" width="22" height="22" rx="2" fill="#1a1a1a"/>
                    <rect x="9" y="39" width="12" height="12" rx="1" fill="white"/>
                    <rect x="34" y="34" width="8" height="8" rx="1" fill="#1a1a1a"/>
                    <rect x="48" y="34" width="8" height="8" rx="1" fill="#1a1a1a"/>
                    <rect x="34" y="48" width="8" height="8" rx="1" fill="#1a1a1a"/>
                    <rect x="48" y="48" width="8" height="8" rx="1" fill="#1a1a1a"/>
                  </svg>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-semibold transition-all text-lg kiosk-btn">
                  🖨 {t.print}
                </button>
                <button
                  onClick={() => { setStep('welcome'); setMobile(''); setOtp(''); setSelectedDept(null); setSelectedDoc(null); }}
                  className="flex-1 bg-brand-500 hover:bg-brand-400 text-white py-4 rounded-2xl font-semibold transition-all text-lg kiosk-btn"
                >
                  {t.done}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
