import React from 'react';
import { Activity, Smartphone, PhoneCall, UserCheck, Stethoscope, Layers, Globe } from 'lucide-react';
import { User, Language } from '../types/index.js';

interface NavbarProps {
  activeTab: 'clinician' | 'patient' | 'ussd' | 'architecture';
  setActiveTab: (tab: 'clinician' | 'patient' | 'ussd' | 'architecture') => void;
  currentUser: User | null;
  onSwitchUserRole: (role: 'CLINICIAN' | 'PATIENT') => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUserRole,
  lang,
  setLang
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      {/* Top Banner with Uganda National Health Theme */}
      <div className="bg-gradient-to-r from-black via-amber-500 to-red-600 h-1.5 w-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('clinician')}>
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">Obulamu-Link</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-300 border border-teal-500/30">
                  Kampala Clinics
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Bugema University Health Centre & KCCA Health Centres
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('clinician')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'clinician'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Clinician Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'patient'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android App</span>
            </button>

            <button
              onClick={() => setActiveTab('ussd')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ussd'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden md:inline">USSD (*284#)</span>
              <span className="md:hidden">USSD</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden lg:inline">Architecture</span>
            </button>
          </nav>

          {/* User Controls & Language Toggle */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'EN' ? 'LG' : 'EN')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Toggle English / Oluganda"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'EN' ? 'EN' : 'LG'}</span>
            </button>

            {/* Role Switcher Pill */}
            {currentUser && (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span className="text-slate-200 font-medium truncate max-w-[120px]">
                  {currentUser.fullName}
                </span>
                <button
                  onClick={() => onSwitchUserRole(currentUser.role === 'CLINICIAN' ? 'PATIENT' : 'CLINICIAN')}
                  className="ml-1 text-[10px] text-teal-400 underline hover:text-teal-300"
                >
                  Switch to {currentUser.role === 'CLINICIAN' ? 'Patient' : 'Doctor'}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

