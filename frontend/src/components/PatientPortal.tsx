import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, CheckCircle, AlertCircle, ShieldCheck, 
  Smartphone, ChevronRight, Pill, Bell, ArrowRight, Sparkles, 
  Heart, Activity, Stethoscope, User, Check, RefreshCw
} from 'lucide-react';
import { Clinic, AppointmentSlot, Appointment, User as UserType, Language } from '../types/index.js';
import { ApiService } from '../services/api.js';

interface PatientPortalProps {
  clinics: Clinic[];
  currentUser: UserType | null;
  lang: Language;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  clinics,
  currentUser,
  lang
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('General Outpatient');
  const [selectedClinicId, setSelectedClinicId] = useState<string>(clinics[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [successBooking, setSuccessBooking] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate 5 upcoming days for mobile app date strip
  const dateStrip = Array.from({ length: 5 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: idx === 0 ? 'Today' : (idx === 1 ? 'Tmrw' : d.toLocaleDateString('en-GB', { weekday: 'short' })),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-GB', { month: 'short' })
    };
  });

  // Fetch slots whenever clinic or date changes
  useEffect(() => {
    if (!selectedClinicId) return;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setErrorMsg(null);
        const data = await ApiService.getSlots(selectedClinicId, selectedDate);
        setSlots(data);
        if (data.length > 0) {
          const available = data.find(s => !s.isFull);
          if (available) setSelectedSlotId(available.id);
        }
      } catch (err: any) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedClinicId, selectedDate]);

  // Fetch user appointments
  const loadMyAppointments = async () => {
    try {
      const data = await ApiService.getMyAppointments();
      setMyAppointments(data);
    } catch (err) {
      console.error('Failed to load my appointments:', err);
    }
  };

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const handleBook = async () => {
    if (!selectedClinicId || !selectedSlotId) {
      setErrorMsg('Please select a clinic and time slot.');
      return;
    }

    try {
      setIsBooking(true);
      setErrorMsg(null);
      const app = await ApiService.bookAppointment({
        clinicId: selectedClinicId,
        slotId: selectedSlotId,
        bookingChannel: 'ANDROID',
        notes: `Android App Booking: ${selectedDept}`
      });

      setSuccessBooking(app);
      await loadMyAppointments();
      // Refresh slots
      const updatedSlots = await ApiService.getSlots(selectedClinicId, selectedDate);
      setSlots(updatedSlots);
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  const selectedClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

  const t = {
    bookTitle: lang === 'LG' ? "Siba Olunaku lw'Okulaba Omusawo" : (lang === 'SW' ? "Weka Miadi ya Daktari" : "Book Clinic Appointment"),
    subtitle: lang === 'LG' ? "Amalwaliro ga Gavumenti mu Kampala ne Bugema HC" : (lang === 'SW' ? "Vituo vya Afya vya Umma Kampala na Bugema HC" : "Kampala Public Clinics & Bugema University HC"),
    deptTitle: lang === 'LG' ? "1. Londa Ekitongole ky'Eddwaliro" : (lang === 'SW' ? "1. Chagua Kitengo cha Kliniki" : "1. Select Clinical Department"),
    facilityTitle: lang === 'LG' ? "2. Londa Eddwaliro" : (lang === 'SW' ? "2. Chagua Kituo cha Afya" : "2. Select Health Facility"),
    dateTitle: lang === 'LG' ? "3. Londa Olunaku" : (lang === 'SW' ? "3. Chagua Tarehe" : "3. Select Date"),
    timeTitle: lang === 'LG' ? "4. Londa Ekiseera ky'Essaawa" : (lang === 'SW' ? "4. Chagua Saa ya Miadi" : "4. Select Hourly Time Window"),
    confirmBtn: lang === 'LG' ? "Kakasa Enteekateeka (Confirm Booking)" : (lang === 'SW' ? "Thibitisha Miadi (Confirm Booking)" : "Confirm & Reserve Slot"),
    myVisitsTitle: lang === 'LG' ? "Enteekateeka Zo Ezijja" : (lang === 'SW' ? "Miadi Yako Inayokuja" : "Your Scheduled Visits"),
    medTitle: lang === 'LG' ? "Eddagala Ly'olina Okumira" : (lang === 'SW' ? "Ratiba ya Kumeza Dawa" : "Medication Regimen Alerts"),
    confirmedHeading: lang === 'LG' ? "Enteekateeka Ekakasiddwa Mu Butongole!" : (lang === 'SW' ? "Miadi Imethibitishwa Kikamilifu!" : "Appointment Confirmed!"),
    bookAnother: lang === 'LG' ? "Siba endala" : (lang === 'SW' ? "Weka miadi nyingine" : "Book another appointment")
  };

  return (
    <div className="max-w-[1700px] mx-auto pb-16">
      
      {/* NATIVE MOBILE APP SHELL WRAPPER & DESKTOP TWO-PANE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / CENTER: APPOINTMENT BOOKING CONSOLE (Native App look on Mobile) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-teal-100 relative overflow-hidden">
            
            {/* Top App Bar Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                      {t.bookTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">
                    {t.subtitle}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 animate-pulse" />
                  Live Capacity Synced
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="my-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Success Banner */}
            {successBooking && (
              <div className="my-5 p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 animate-fade-in shadow-sm">
                <div className="flex items-center space-x-2 font-black text-sm text-emerald-900">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>{t.confirmedHeading}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Booking Reference</span>
                    <span className="font-mono font-black text-base text-slate-900">{successBooking.bookingReference}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                    Slot Locked
                  </span>
                </div>
                <p className="text-slate-700 font-medium">
                  {lang === 'LG' 
                    ? `Olinayo enteekateeka ku ${successBooking.clinic?.name} ku ssaawa ${successBooking.slot?.startTime} - ${successBooking.slot?.endTime}. Obubaka bwa SMS bwoherezeddwa ku ssimu yo.` 
                    : (lang === 'SW'
                    ? `Miadi yako katika ${successBooking.clinic?.name} imethibitishwa saa ${successBooking.slot?.startTime} - ${successBooking.slot?.endTime}. Ujumbe wa uthibitisho wa SMS umetumwa kwenye simu yako.`
                    : `Confirmed at ${successBooking.clinic?.name} between ${successBooking.slot?.startTime} - ${successBooking.slot?.endTime}. An SMS confirmation has been dispatched to your phone.`)}
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setSuccessBooking(null)}
                    className="text-xs font-bold text-teal-800 underline hover:text-teal-950"
                  >
                    {t.bookAnother}
                  </button>
                  <span className="text-[10px] text-slate-400">Africa's Talking SMS Synced</span>
                </div>
              </div>
            )}

            {/* Step 1: Department Selector (Native App Pills) */}
            <div className="mt-6 mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                {t.deptTitle}
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { 
                    id: 'General Outpatient', 
                    label: lang === 'SW' ? 'Wagonjwa wa Nje (OPD)' : (lang === 'LG' ? 'General OPD' : 'General OPD'), 
                    sub: lang === 'SW' ? 'Wagonjwa wa kawaida' : (lang === 'LG' ? 'Abalwadde ababulijjo' : 'General outpatient'), 
                    icon: '🩺' 
                  },
                  { 
                    id: 'Chronic Care / ART Clinic', 
                    label: lang === 'SW' ? 'Magonjwa ya Kudumu & ART' : (lang === 'LG' ? 'Chronic & ART' : 'Chronic & ART'), 
                    sub: lang === 'SW' ? 'Dawa za kila siku & ART' : (lang === 'LG' ? 'Endwadde ez\'olubeerera' : 'HIV/ART & chronic care'), 
                    icon: '💊' 
                  },
                  { 
                    id: 'Antenatal Care', 
                    label: lang === 'SW' ? 'Wazazi na Wajawazito' : (lang === 'LG' ? 'Antenatal MCH' : 'Antenatal MCH'), 
                    sub: lang === 'SW' ? 'Huduma ya akina mama' : (lang === 'LG' ? 'Abakyala ab\'embuto' : 'Maternal & child health'), 
                    icon: '👶' 
                  }
                ].map(dept => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDept(dept.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      selectedDept === dept.id
                        ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{dept.icon}</span>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900">{dept.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{dept.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Clinic Facility Selector */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                {t.facilityTitle}
              </label>
              <div className="space-y-2.5">
                {clinics.map(clinic => (
                  <div
                    key={clinic.id}
                    onClick={() => setSelectedClinicId(clinic.id)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedClinicId === clinic.id
                        ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        selectedClinicId === clinic.id ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{clinic.name}</h4>
                        <p className="text-[11px] text-slate-500">{clinic.location}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      Cap: {clinic.dailyCapacity}/day
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Native App Date Horizontal Strip */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {t.dateTitle}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-1.5 focus:ring-teal-500"
                />
              </div>

              {/* Horizontal Scrollable Date Strip (Native app feel) */}
              <div className="flex space-x-2.5 overflow-x-auto pb-1 pt-0.5">
                {dateStrip.map(d => {
                  const isSelected = selectedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setSelectedDate(d.iso)}
                      className={`flex-1 min-w-[70px] py-3 px-2 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/30'
                          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className={`text-[10px] font-bold uppercase ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {d.dayName}
                      </div>
                      <div className="text-base sm:text-lg font-black my-0.5 leading-none">
                        {d.dayNumber}
                      </div>
                      <div className={`text-[10px] font-semibold ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                        {d.month}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Hourly Time Windows (Staggered Allocation) */}
            <div className="mb-8">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                {t.timeTitle}
              </label>

              {loadingSlots ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Loading available clinic slots...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No slots configured for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {slots.map((slot) => {
                    const spotsRemaining = Math.max(0, slot.maxPatients - slot.bookedCount);
                    const isFull = spotsRemaining <= 0;
                    const isSelected = selectedSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isFull
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                            : 'border-slate-200 hover:border-teal-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
                          <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-bold ${
                            isSelected ? 'text-teal-100' : isFull ? 'text-red-500' : 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded'
                          }`}>
                            {isFull ? 'Full' : `${spotsRemaining} spots left`}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleBook}
              disabled={isBooking || !selectedSlotId}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm shadow-xl shadow-teal-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isBooking ? (
                <span>Securing appointment slot...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t.confirmBtn}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-400 text-center">
              <span>⚡ Protected by optimistic database concurrency to avoid double-booking</span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Active Patient Cards & Medication Regimen Stream */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Appointments Countdown Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-teal-850">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                <h3 className="font-black text-base text-white">
                  {t.myVisitsTitle}
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {myAppointments.length} Active
              </span>
            </div>

            {myAppointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active appointments. Pick a facility on the left to schedule.
              </div>
            ) : (
              <div className="space-y-3.5">
                {myAppointments.map(app => (
                  <div key={app.id} className="bg-white/10 rounded-2xl p-4.5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-teal-500/40 text-teal-200">
                          {app.bookingReference}
                        </span>
                        <h4 className="font-black text-sm text-white mt-2">{app.clinic.name}</h4>
                        <p className="text-xs text-teal-200/80">{app.clinic.department}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-300 block">
                          {app.slot.slotDate}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">
                          {app.slot.startTime} - {app.slot.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Channel: {app.bookingChannel}</span>
                      <span className="text-emerald-400 font-extrabold">✓ Slot Allocated</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medication Adherence Reminders Checklist */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-teal-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-base text-slate-900">
                  {t.medTitle}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                SMS Active
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Automated reminders triggered via Africa's Talking SMS directly to basic and smartphones.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-150 flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">TLD (ART Triple Therapy)</span>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">Daily 20:00</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">1 tablet daily with clean drinking water.</p>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1.5 font-medium">
                    <Bell className="w-3 h-3 text-amber-500" />
                    <span>Next SMS alert scheduled tonight at 8:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-150 flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">Coartem 20/120</span>
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">BID (Twice daily)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">4 tablets morning & 4 tablets evening after meals.</p>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1.5 font-medium">
                    <Bell className="w-3 h-3 text-amber-500" />
                    <span>Course in progress</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
