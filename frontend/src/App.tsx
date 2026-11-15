import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ClinicianQueue } from './components/ClinicianQueue.js';
import { PatientPortal } from './components/PatientPortal.js';
import { UssdSimulator } from './components/UssdSimulator.js';
import { SystemArchitectureModal } from './components/SystemArchitectureModal.js';
import { ApiService } from './services/api.js';
import { Clinic, User, Language } from './types/index.js';
import { Stethoscope, Smartphone, PhoneCall, Layers, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'clinician' | 'patient' | 'ussd' | 'architecture'>('clinician');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('EN');
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Initial Load: Authenticate default demo user and fetch clinics
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoadingInitial(true);

        // Fetch Clinics
        let clinicList = await ApiService.getClinics().catch(() => []);
        if (clinicList.length === 0) {
          clinicList = [
            {
              id: 'c1',
              name: 'Bugema University Health Centre',
              location: 'Bombo Road, Luweero / Kampala Metro',
              department: 'General Outpatient & ART',
              dailyCapacity: 120,
              openTime: '08:00',
              closeTime: '17:00'
            },
            {
              id: 'c2',
              name: 'Kisenyi Health Centre IV',
              location: 'Kisenyi, Central Division, Kampala',
              department: 'General Outpatient & MCH',
              dailyCapacity: 200,
              openTime: '08:00',
              closeTime: '18:00'
            },
            {
              id: 'c3',
              name: 'Kawempe National Referral Hospital',
              location: 'Kawempe Division, Kampala',
              department: 'Antenatal Care & Obstetrics',
              dailyCapacity: 350,
              openTime: '07:30',
              closeTime: '18:00'
            },
            {
              id: 'c4',
              name: 'Kiruddu National Referral Hospital',
              location: 'Buziga, Makindye Division, Kampala',
              department: 'Chronic Care / ART Clinic',
              dailyCapacity: 250,
              openTime: '08:00',
              closeTime: '17:00'
            }
          ];
        }
        setClinics(clinicList);
        setSelectedClinicId(clinicList[0]?.id || '');

        // Try login as default Clinician
        try {
          const authRes = await ApiService.login('+256772100100', 'Password123!');
          setCurrentUser(authRes.user);
        } catch {
          setCurrentUser({
            id: 'demo-doc',
            fullName: 'Dr. Sarah Namubiru',
            phoneNumber: '+256772100100',
            role: 'CLINICIAN',
            languagePref: 'EN'
          });
        }
      } catch (err) {
        console.error('Initial app initialization error:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initApp();
  }, []);

  const handleSwitchUserRole = async (targetRole: 'CLINICIAN' | 'PATIENT') => {
    try {
      if (targetRole === 'CLINICIAN') {
        const auth = await ApiService.login('+256772100100', 'Password123!').catch(() => null);
        if (auth) setCurrentUser(auth.user);
        else {
          setCurrentUser({
            id: 'doc-1',
            fullName: 'Dr. Sarah Namubiru',
            phoneNumber: '+256772100100',
            role: 'CLINICIAN',
            languagePref: 'EN'
          });
        }
        setActiveTab('clinician');
      } else {
        const auth = await ApiService.login('+256701334455', 'Password123!').catch(() => null);
        if (auth) setCurrentUser(auth.user);
        else {
          setCurrentUser({
            id: 'pat-1',
            fullName: 'Mary Nakato',
            phoneNumber: '+256701334455',
            role: 'PATIENT',
            languagePref: 'LG'
          });
        }
        setActiveTab('patient');
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans pb-mobile-nav md:pb-0">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUserRole={handleSwitchUserRole}
        lang={lang}
        setLang={setLang}
        clinics={clinics}
        selectedClinicId={selectedClinicId}
        setSelectedClinicId={setSelectedClinicId}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {loadingInitial ? (
          <div className="py-32 text-center">
            <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-700">
              Connecting to Obulamu-Link Clinic Network...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'clinician' && (
              <ClinicianQueue
                clinics={clinics}
                selectedClinicId={selectedClinicId}
                setSelectedClinicId={setSelectedClinicId}
              />
            )}

            {activeTab === 'patient' && (
              <PatientPortal
                clinics={clinics}
                currentUser={currentUser}
                lang={lang}
              />
            )}

            {activeTab === 'ussd' && (
              <UssdSimulator />
            )}

            {activeTab === 'architecture' && (
              <SystemArchitectureModal />
            )}
          </>
        )}
      </main>

      {/* NATIVE MOBILE BOTTOM NAVIGATION BAR (Shown only on small/mobile screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-teal-850 px-2 py-1.5 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('clinician')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'clinician' ? 'text-teal-400 font-black' : 'text-slate-400'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Clinician</span>
        </button>

        <button
          onClick={() => setActiveTab('patient')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'patient' ? 'text-indigo-400 font-black' : 'text-slate-400'
          }`}
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Book Visit</span>
        </button>

        <button
          onClick={() => setActiveTab('ussd')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'ussd' ? 'text-amber-400 font-black' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">USSD *284#</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'architecture' ? 'text-slate-200 font-black' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Specs</span>
        </button>
      </div>

      {/* Desktop Footer */}
      <footer className="hidden md:block bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="font-bold text-slate-200">Obulamu-Link Platform</span>
            <span>— Kampala Public Health Clinics & Bugema University Health Centre</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Dual-Channel USSD (*284#) & Android Scheduling</span>
            <span>•</span>
            <span className="text-teal-400 font-semibold">Africa's Talking SMS Synced</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
