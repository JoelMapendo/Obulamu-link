import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ClinicianQueue } from './components/ClinicianQueue.js';
import { PatientPortal } from './components/PatientPortal.js';
import { UssdSimulator } from './components/UssdSimulator.js';
import { SystemArchitectureModal } from './components/SystemArchitectureModal.js';
import { ApiService } from './services/api.js';
import { Clinic, User, Language } from './types/index.js';

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
          // Fallback initial data if backend not yet running
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
          // If login fails (e.g. backend just starting), set mock doctor
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUserRole={handleSwitchUserRole}
        lang={lang}
        setLang={setLang}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingInitial ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">
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

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-200">Obulamu-Link System</span>
            <span>— Kampala Public Health Clinics & Bugema University Health Centre</span>
          </div>
          <div>
            Dual-Channel USSD (*284#) & Android Scheduling Platform
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;

