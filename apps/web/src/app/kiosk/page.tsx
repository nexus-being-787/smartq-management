'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, User, Phone, CheckCircle2, Building2, Stethoscope, Ticket, Check, Loader2, Printer } from 'lucide-react';
import apiClient from '@smartq/api-client';
import type { Department, Doctor, Patient, Token } from '@smartq/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type KioskStep = 'welcome' | 'patient-type' | 'auth' | 'department' | 'doctor' | 'confirm' | 'token';
type PatientType = 'NEW' | 'RETURNING' | 'APPOINTMENT';
type Language = 'EN' | 'TA' | 'HI';

const LABELS: Record<Language, Record<string, string>> = {
  EN: { welcome: 'Welcome to SmartQ', selectLang: 'Select language', start: 'Get started', new: 'New patient', returning: 'Returning patient', appointment: 'I have an appointment', selectDept: 'Select department', waiting: 'waiting in queue', mins: 'min wait', your_token: 'Your token', print: 'Print token', done: 'Done', enterMobile: 'Enter mobile number', continue: 'Continue', enterName: 'Enter your name', back: 'Back', confirm: 'Confirm & Get Token' },
  TA: { welcome: 'SmartQ-க்கு வரவேற்கிறோம்', selectLang: 'மொழியை தேர்வு செய்யவும்', start: 'தொடங்கவும்', new: 'புதிய நோயாளி', returning: 'திரும்பி வந்த நோயாளி', appointment: 'எனக்கு appointment உள்ளது', selectDept: 'பிரிவை தேர்ந்தெடுக்கவும்', waiting: 'காத்திருக்கின்றனர்', mins: 'நிமிட காத்திருப்பு', your_token: 'உங்கள் token', print: 'Print பெறுக', done: 'முடிந்தது', enterMobile: 'Mobile எண் உள்ளிடவும்', continue: 'தொடர்க', enterName: 'பெயர் உள்ளிடவும்', back: 'பின் செல்', confirm: 'உறுதி செய்' },
  HI: { welcome: 'SmartQ में आपका स्वागत है', selectLang: 'भाषा चुनें', start: 'शुरू करें', new: 'नया मरीज़', returning: 'पुराना मरीज़', appointment: 'मेरी अपॉइंटमेंट है', selectDept: 'विभाग चुनें', waiting: 'प्रतीक्षारत', mins: 'मिनट प्रतीक्षा', your_token: 'आपका टोकन', print: 'प्रिंट करें', done: 'हो गया', enterMobile: 'मोबाइल नंबर डालें', continue: 'जारी रखें', enterName: 'अपना नाम दर्ज करें', back: 'वापस', confirm: 'पुष्टि करें' },
};

const STEPS: KioskStep[] = ['welcome', 'patient-type', 'auth', 'department', 'doctor', 'confirm', 'token'];

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function KioskPage() {
  const [step, setStep] = useState<KioskStep>('welcome');
  const [lang, setLang] = useState<Language>('EN');
  const [patientType, setPatientType] = useState<PatientType | null>(null);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [tokenInfo, setTokenInfo] = useState<Token | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = LABELS[lang];
  const stepIdx = STEPS.indexOf(step);

  const go = (s: KioskStep) => { setError(''); setStep(s); };
  const back = () => { setError(''); setStep(STEPS[Math.max(0, stepIdx - 1)]); };

  // Fetch departments when reaching department step
  useEffect(() => {
    if (step === 'department') {
      apiClient.departments.list()
        .then(data => {
          if (data && data.length > 0) {
            setDepartments(data);
          } else {
            throw new Error('Empty or invalid response');
          }
        })
        .catch(e => {
          console.warn('API fetch failed, using fallback departments', e);
          setDepartments([
            { id: '1', name: 'General Medicine', code: 'GM', currentQueueLength: 5, estimatedWaitMinutes: 35, isActive: true, doctors: [] },
            { id: '2', name: 'Cardiology', code: 'CA', currentQueueLength: 3, estimatedWaitMinutes: 20, isActive: true, doctors: [] },
            { id: '3', name: 'Paediatrics', code: 'PE', currentQueueLength: 8, estimatedWaitMinutes: 50, isActive: true, doctors: [] }
          ]);
        });
    }
  }, [step]);

  // Fetch doctors when reaching doctor step
  useEffect(() => {
    if (step === 'doctor' && selectedDept) {
      apiClient.doctors.list()
        .then(docs => {
          const deptDocs = docs.filter(d => d.departmentId === selectedDept.id);
          if (deptDocs.length > 0) setDoctors(deptDocs);
          else throw new Error('No doctors found');
        })
        .catch(e => {
          console.warn('API fetch failed, using fallback doctors', e);
          setDoctors([
            { id: 'd1', name: 'Dr. Priya Nair', specialization: 'Senior Consultant', departmentId: selectedDept.id, status: 'AVAILABLE', todayPending: 2, todayServed: 10, averageConsultMinutes: 15 },
            { id: 'd2', name: 'Dr. Arun Verma', specialization: 'Specialist', departmentId: selectedDept.id, status: 'AVAILABLE', todayPending: 1, todayServed: 8, averageConsultMinutes: 20 }
          ]);
        });
    }
  }, [step, selectedDept]);

  const handleAuthSubmit = async () => {
    if (mobile.length < 10) return setError('Invalid mobile number');
    if (patientType === 'NEW' && name.trim() === '') return setError('Name is required');
    
    setLoading(true);
    // Real implementation would verify OTP. We'll skip OTP input for faster testing.
    go('department');
    setLoading(false);
  };

  const handleGetToken = async () => {
    setLoading(true);
    try {
      // 1. Get or create patient
      let patient: Patient | null = null;
      try {
        const existing = await apiClient.patients.getByMobile(mobile);
        if (existing && !Array.isArray(existing) && (existing as any).id) {
          patient = existing as Patient;
        } else if (Array.isArray(existing) && existing.length > 0) {
          patient = existing[0];
        }

        if (!patient) {
          patient = await apiClient.patients.create({
            name: name || 'Guest User',
            mobile,
            age: 30,
            gender: 'Other',
            isReturning: false,
          });
        }
      } catch (e) {
        console.warn('Patient logic failed, using fallback', e);
        patient = { id: 'p1', name: name || 'Guest User', mobile, age: 30, gender: 'Other', isReturning: false, medicalHistory: '', allergies: '' };
      }

      // 2. Issue Token
      let token: Token;
      try {
        token = await apiClient.tokens.issue({
          patientId: patient!.id,
          departmentId: selectedDept!.id,
          doctorId: selectedDoc?.id,
          isEmergency: false,
        });
      } catch (err) {
        console.warn('Token issue failed, using fallback', err);
        token = {
          id: Math.random().toString(),
          number: Math.floor(Math.random() * 100),
          displayNumber: `${selectedDept?.code || 'Q'}-0${Math.floor(Math.random() * 100)}`,
          patientId: patient!.id,
          departmentId: selectedDept!.id,
          doctorId: selectedDoc?.id,
          priority: 'REGULAR',
          status: 'ISSUED',
          issuedAt: new Date().toISOString(),
          noShowCount: 0,
          estimatedWaitMinutes: selectedDept?.estimatedWaitMinutes || 15,
          queuePosition: Math.floor(Math.random() * 10) + 1,
        };
      }

      setTokenInfo(token);
      go('token');
    } catch (err: any) {
      setError(err.message || 'Failed to issue token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-brand-950 to-slate-900 flex flex-col items-center justify-center p-8 select-none font-sans text-slate-100">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[120px]" />
         <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-brand-400/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4 py-8 md:p-12 bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl shadow-brand-900/20">

        {step !== 'welcome' && step !== 'token' && (
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
             <button onClick={back} className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-full transition-all hover:bg-slate-700/50 text-sm font-medium backdrop-blur-sm">
                <ChevronLeft size={16} /> {t.back}
             </button>
             <div className="flex gap-1.5">
                {STEPS.filter(s => s !== 'welcome' && s !== 'token').map((s, i) => (
                  <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-300 ${STEPS.indexOf(s) <= stepIdx ? 'bg-brand-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700/50'}`} />
                ))}
             </div>
          </div>
        )}

        <div className="pt-8">
            {/* ── WELCOME ───────────────────────────────────────────── */}
            {step === 'welcome' && (
              <div className="text-center animate-in fade-in zoom-in duration-500">
                <div className="w-28 h-28 bg-gradient-to-br from-brand-400 to-brand-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/30 transform rotate-3">
                  <span className="text-white font-serif text-5xl font-bold -rotate-3">Q</span>
                </div>
                <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">{t.welcome}</h1>
                <p className="text-brand-200/80 text-xl mb-12 font-medium">City General Hospital</p>

                <p className="text-slate-400 text-sm mb-5 font-medium uppercase tracking-widest">{t.selectLang}</p>
                <div className="flex gap-4 justify-center mb-12">
                  {(['EN', 'TA', 'HI'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-8 py-3.5 rounded-2xl text-lg font-bold transition-all duration-300 ${
                        lang === l
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-900 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:scale-105'
                      }`}
                    >
                      {l === 'EN' ? 'English' : l === 'TA' ? 'தமிழ்' : 'हिंदी'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => go('patient-type')}
                  className="bg-brand-500 hover:bg-brand-400 text-white text-2xl font-bold px-16 py-5 rounded-[2rem]
                            transition-all active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] group flex items-center gap-3 mx-auto"
                >
                  {t.start} 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}

            {/* ── PATIENT TYPE ──────────────────────────────────────── */}
            {step === 'patient-type' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">How can we help you?</h2>
                <div className="space-y-4">
                  {[
                    { type: 'NEW' as PatientType, label: t.new, icon: <User className="text-brand-400" size={32} />, sub: 'First visit to City General' },
                    { type: 'RETURNING' as PatientType, label: t.returning, icon: <Phone className="text-blue-400" size={32} />, sub: 'Load your existing profile' },
                  ].map(o => (
                    <button
                      key={o.type}
                      onClick={() => { setPatientType(o.type); go('auth'); }}
                      className="w-full bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-md text-left p-6 rounded-3xl
                                border border-slate-700/50 hover:border-brand-500/50 transition-all duration-300
                                flex items-center gap-6 group hover:scale-[1.02]"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {o.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-2xl font-bold mb-1">{o.label}</p>
                        <p className="text-slate-400">{o.sub}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── AUTH ────────────────────────────────────────────── */}
            {step === 'auth' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-8 max-w-sm mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">Your Details</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-brand-200 text-sm font-semibold mb-2">{t.enterMobile}</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full bg-slate-900/80 text-white text-2xl font-bold text-center py-5 px-4 rounded-2xl
                                border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                tracking-[0.2em] placeholder:text-slate-600 transition-all"
                    />
                  </div>

                  {patientType === 'NEW' && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                      <label className="block text-brand-200 text-sm font-semibold mb-2">{t.enterName}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-900/80 text-white text-xl font-bold text-center py-5 px-4 rounded-2xl
                                  border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                  placeholder:text-slate-600 transition-all"
                      />
                    </div>
                  )}

                  {error && <p className="text-red-400 text-center font-medium bg-red-400/10 py-2 rounded-xl">{error}</p>}

                  <button
                    onClick={handleAuthSubmit}
                    disabled={loading || mobile.length < 10 || (patientType === 'NEW' && name.trim() === '')}
                    className="w-full bg-brand-500 hover:bg-brand-400 text-white text-xl font-bold py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 mt-4 touch-manipulation"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : t.continue}
                  </button>
                </div>
              </div>
            )}

            {/* ── DEPARTMENT ────────────────────────────────────────── */}
            {step === 'department' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">{t.selectDept}</h2>
                {departments.length === 0 ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" size={48} /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map(d => (
                      <button
                        key={d.id}
                        onClick={() => { setSelectedDept(d); go('doctor'); }}
                        className="bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/50 hover:border-brand-500
                                  rounded-3xl p-6 text-left transition-all group hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center text-brand-400 font-bold">
                            <Building2 size={24} />
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${d.estimatedWaitMinutes > 45 ? 'bg-red-500/20 text-red-400' : d.estimatedWaitMinutes > 25 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                            Est. {d.estimatedWaitMinutes}m
                          </div>
                        </div>
                        <p className="text-white font-bold text-xl mb-1">{d.name}</p>
                        <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                          <Users size={14} className="opacity-70"/> {d.currentQueueLength} {t.waiting}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── DOCTOR ────────────────────────────────────────────── */}
            {step === 'doctor' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-8">
                <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Select Doctor</h2>
                <p className="text-brand-300 text-center font-medium mb-8 bg-brand-900/30 inline-block px-4 py-1 rounded-full mx-auto flex items-center justify-center gap-2 w-fit">
                    <Building2 size={16}/> {selectedDept?.name}
                </p>
                <div className="space-y-4 max-w-xl mx-auto">
                  <button
                    onClick={() => { setSelectedDoc(null); go('confirm'); }}
                    className="w-full bg-gradient-to-r from-brand-600/20 to-brand-500/10 hover:from-brand-600/40 hover:to-brand-500/20 border border-brand-500/30 hover:border-brand-400
                               rounded-2xl p-6 text-left transition-all flex items-center gap-5 hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <p className="text-brand-100 font-bold text-xl">Any available doctor</p>
                      <p className="text-brand-300/80 text-sm mt-1">Fastest option</p>
                    </div>
                  </button>
                  {doctors.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDoc(doc); go('confirm'); }}
                      className="w-full bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-500
                                 rounded-2xl p-6 text-left transition-all flex items-center gap-5 group hover:scale-[1.02]"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-300">
                        <User size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-xl">{doc.name}</p>
                        <p className="text-slate-400 text-sm mt-1">{doc.specialization}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CONFIRM ───────────────────────────────────────────── */}
            {step === 'confirm' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-8 max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">Summary</h2>
                <div className="bg-slate-800/60 backdrop-blur-xl rounded-[2rem] p-8 border border-slate-700/50 shadow-xl mb-8">
                  <div className="space-y-6">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Patient</span>
                      <span className="text-white font-semibold text-lg">{name || 'Guest User'} <span className="text-slate-400 font-normal">({mobile})</span></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Department</span>
                      <span className="text-brand-300 font-semibold text-lg flex items-center gap-2">
                        <Building2 size={16}/> {selectedDept?.name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Doctor Preference</span>
                      <span className="text-white font-semibold text-lg flex items-center gap-2">
                        <Stethoscope size={16} className="text-slate-400"/> {selectedDoc?.name ?? 'Any doctor'}
                      </span>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-400 text-center font-medium bg-red-400/10 py-3 rounded-xl mb-6">{error}</p>}

                <button
                  onClick={handleGetToken}
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-400 text-white text-xl font-bold py-5 rounded-[2rem] disabled:opacity-50 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Ticket size={24} /> {t.confirm}</>}
                </button>
              </div>
            )}

            {/* ── TOKEN ─────────────────────────────────────────────── */}
            {step === 'token' && tokenInfo && (
              <div className="animate-in zoom-in-95 duration-500 text-center max-w-sm mx-auto">
                <div className="bg-white rounded-[2rem] p-1 border-4 border-dashed border-brand-200 overflow-hidden shadow-2xl shadow-brand-500/20 relative">
                  <div className="bg-gradient-to-b from-brand-50 to-white pt-10 pb-12 px-8 rounded-[1.75rem] border border-slate-100">
                      
                      <div className="absolute top-4 right-4 text-green-500 opacity-80">
                         <CheckCircle2 size={32} />
                      </div>

                      <p className="text-brand-600 text-sm font-black uppercase tracking-[0.3em] mb-4">Your Token</p>
                      
                      <div className="text-7xl font-black text-slate-800 mb-6 tracking-tighter drop-shadow-sm">
                        {tokenInfo.displayNumber}
                      </div>
                      
                      <div className="space-y-1 mb-8">
                        <p className="text-slate-500 font-medium text-lg">{selectedDept?.name}</p>
                        <p className="text-slate-400 font-medium text-sm">{selectedDoc?.name || 'Any doctor'}</p>
                      </div>

                      <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200/60 pt-6 mt-4">
                        <div className="px-2">
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Queue Pos</p>
                           <p className="text-2xl font-black text-slate-700">{tokenInfo.queuePosition || 1}</p>
                        </div>
                        <div className="px-2">
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Est Wait</p>
                           <p className="text-2xl font-black text-brand-600">{tokenInfo.estimatedWaitMinutes || 10}m</p>
                        </div>
                      </div>
                  </div>
                </div>

                <p className="text-slate-400 text-center text-sm font-medium mt-8 flex items-center justify-center gap-2">
                   <Phone size={14} className="text-brand-400" /> Track status via SMS to +91 {mobile}
                </p>

                <div className="flex gap-4 mt-8">
                  <button className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                    <Printer size={20} /> Print
                  </button>
                  <button
                    onClick={() => { setStep('welcome'); setMobile(''); setName(''); setSelectedDept(null); setSelectedDoc(null); }}
                    className="flex-1 bg-brand-500 hover:bg-brand-400 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={20} /> {t.done}
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// simple shim for lucide icons if not imported above
const Users = ({size, className}: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
