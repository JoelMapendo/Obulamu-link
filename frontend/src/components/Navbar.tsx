import React from 'react';
import { Activity, Smartphone, PhoneCall, UserCheck, Stethoscope, Layers, Globe, Shield, Bell } from 'lucide-react';
import { User, Language, Clinic } from '../types/index.js';

interface NavbarProps {
  activeTab: 'clinician' | 'patient' | 'ussd' | 'architecture';
  setActiveTab: (tab: 'clinician' | 'patient' | 'ussd' | 'architecture') => void;
  currentUser: User | null;
  onSwitchUserRole: (role: 'CLINICIAN' | 'PATIENT') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  clinics: Clinic[];
  selectedClinicId: string;
  setSelectedClinicId: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUserRole,
  lang,
  setLang,
  clinics,
  selectedClinicId,
  setSelectedClinicId
}) => {
  const selectedClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-50 border-b border-teal-900/40">
      {/* Uganda National Flag & Healthcare Strip */}
      <div className="bg-gradient-to-r from-black via-amber-400 to-red-600 h-1 w-full" />
      
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Brand & Facility Identity */}
          <div className="flex items-center space-x-3.5">
            <div 
              onClick={() => setActiveTab('clinician')}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 cursor-pointer hover:scale-105 transition transform"
            >
              <Activity className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  Obulamu<span className="text-teal-400">-Link</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-600/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1 animate-ping" />
                  MOH / KCCA NETWORK
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:flex items-center gap-1.5">
                <span>Kampala Health Centres</span>
                <span className="text-slate-600">•</span>
                <span className="text-teal-300/90 font-medium">Bugema University Health Centre</span>
              </p>
            </div>
          </div>

          {/* Desktop Facility Selector Pill */}
          <div className="hidden lg:flex items-center bg-slate-800/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-inner">
            <span className="text-xs text-slate-400 font-semibold mr-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Active Facility:
            </span>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer pr-2 hover:text-teal-300 transition"
            >
              {clinics.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 space-x-1">
            <button
              onClick={() => setActiveTab('clinician')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'clinician'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Clinician Console</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'patient'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-700/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android App</span>
            </button>

            <button
              onClick={() => setActiveTab('ussd')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ussd'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-700/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>USSD (*284#)</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Right Controls: Language & User Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              >
                <option value="EN" className="bg-slate-900 text-white">English</option>
                <option value="LG" className="bg-slate-900 text-white">Oluganda</option>
                <option value="SW" className="bg-slate-900 text-white">Kiswahili</option>
              </select>
            </div>

            {/* Profile Avatar / Role Switcher */}
            {currentUser && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-850 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'CLINICIAN' ? 'bg-teal-500 text-white' : 'bg-indigo-500 text-white'
                }`}>
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-slate-200 font-bold leading-none truncate max-w-[110px]">
                    {currentUser.fullName}
                  </div>
                  <button
                    onClick={() => onSwitchUserRole(currentUser.role === 'CLINICIAN' ? 'PATIENT' : 'CLINICIAN')}
                    className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold underline block mt-0.5"
                  >
                    Switch to {currentUser.role === 'CLINICIAN' ? 'Patient' : 'Clinician'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
