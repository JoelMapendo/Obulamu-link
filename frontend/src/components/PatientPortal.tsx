import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, CheckCircle, AlertCircle, ShieldCheck, 
  Smartphone, ChevronRight, Pill, Bell, ArrowRight, Sparkles 
} from 'lucide-react';
import { Clinic, AppointmentSlot, Appointment, User, Language } from '../types/index.js';
import { ApiService } from '../services/api.js';

interface PatientPortalProps {
  clinics: Clinic[];
  currentUser: User | null;
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
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [successBooking, setSuccessBooking] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Smartphone Mockup / Interactive Booking Screen */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
            {/* Top Android App Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {lang === 'LG' ? 'Siba Olunaku lw\'Okulaba Omusawo' : 'Schedule Clinic Appointment'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'LG' ? 'Amasomero ne Amalwaliro ga Gavumenti mu Kampala' : 'Kampala Public Clinics & Bugema University HC'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Online
              </span>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Banner */}
            {successBooking && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>
                    {lang === 'LG' ? 'Enteekateeka Ekakasiddwa!' : 'Appointment Confirmed!'}
                  </span>
                </div>
                <p>
                  Booking Reference: <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border">{successBooking.bookingReference}</span>
                </p>
                <p className="text-slate-600">
                  {lang === 'LG' 
                    ? `Olinayo enteekateeka ku ${successBooking.clinic?.name} ku ssaawa ${successBooking.slot?.startTime}. Obubaka bwa SMS bwoherezeddwa.` 
                    : `Confirmed at ${successBooking.clinic?.name} between ${successBooking.slot?.startTime} - ${successBooking.slot?.endTime}. An SMS confirmation has been dispatched.`}
                </p>
                <button
                  onClick={() => setSuccessBooking(null)}
                  className="text-xs font-bold text-emerald-700 underline"
                >
                  {lang === 'LG' ? 'Siba endala' : 'Book another slot'}
                </button>
              </div>
            )}

            {/* Step 1: Department Selection */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {lang === 'LG' ? '1. Londa Ekitongole ky\'Eddwaliro' : '1. Select Department'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'General Outpatient', label: 'General OPD', sub: 'Abalwadde' },
                  { id: 'Chronic Care / ART Clinic', label: 'Chronic / ART', sub: 'Endwadde ez\'olubeerera' },
                  { id: 'Antenatal Care', label: 'Antenatal MCH', sub: 'Ab\'embuto' }
                ].map(dept => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDept(dept.id)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedDept === dept.id
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{dept.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{dept.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Clinic Health Facility Selection */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {lang === 'LG' ? '2. Londa Eddwaliro' : '2. Select Health Facility'}
              </label>
              <div className="space-y-2">
                {clinics.map(clinic => (
                  <div
                    key={clinic.id}
                    onClick={() => setSelectedClinicId(clinic.id)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                      selectedClinicId === clinic.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        selectedClinicId === clinic.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{clinic.name}</h4>
                        <p className="text-[11px] text-slate-500">{clinic.location}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Cap: {clinic.dailyCapacity}/day
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Date & Hourly Slot Allocation */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {lang === 'LG' ? '3. Londa Olunaku n\'Essaawa' : '3. Select Date & Hourly Time Window'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-1.5 font-medium"
                />
              </div>

              {/* Slot grid */}
              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Loading available clinic slots...
                </div>
              ) : slots.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No slots configured for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          isFull
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'border-slate-200 hover:border-indigo-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1">
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                          <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {isFull ? 'Full' : `${spotsRemaining} spots left`}
                          </span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Booking Button */}
            <button
              onClick={handleBook}
              disabled={isBooking || !selectedSlotId}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isBooking ? (
                <span>Securing appointment slot...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {lang === 'LG' ? 'Kakasa Enteekateeka (Confirm Booking)' : 'Confirm & Reserve Slot'}
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-3">
              ⚡ Protected by atomic database transaction. Prevents waiting-room double booking.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Patient Cards & Medication Regimens */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Appointments Countdown Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">
                  {lang === 'LG' ? 'Enteekateeka Zo Ezijja' : 'Your Scheduled Visits'}
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {myAppointments.length} Active
              </span>
            </div>

            {myAppointments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No upcoming visits scheduled. Use the booking panel to select a slot.
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map(app => (
                  <div key={app.id} className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-200">
                          {app.bookingReference}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1.5">{app.clinic.name}</h4>
                        <p className="text-xs text-indigo-200/80">{app.clinic.department}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-300 block">
                          {app.slot.slotDate}
                        </span>
                        <span className="text-xs text-slate-300">
                          {app.slot.startTime} - {app.slot.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Channel: {app.bookingChannel}</span>
                      <span className="text-emerald-400 font-bold">✓ Slot Reserved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medication Adherence Reminders Checklist */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {lang === 'LG' ? 'Eddagala Ly\'olina Okumira' : 'Medication Regimen Alerts'}
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                SMS Synced
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Automated reminders triggered via Africa's Talking SMS directly to basic and smartphones.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">TLD (ART Triple Therapy)</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Daily 8:00 PM</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">1 tablet daily with clean drinking water.</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-1">
                    <Bell className="w-3 h-3 text-amber-500" />
                    <span>Next SMS alert scheduled today at 20:00</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0 mt-0.5">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Coartem 20/120</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">BID (Twice daily)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">4 tablets morning & 4 tablets evening after meals.</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-1">
                    <Bell className="w-3 h-3 text-amber-500" />
                    <span>Finished Course</span>
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

