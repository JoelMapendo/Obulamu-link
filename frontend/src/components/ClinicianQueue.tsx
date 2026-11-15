import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, 
  Pill, Plus, RefreshCw, Smartphone, Phone, Sparkles 
} from 'lucide-react';
import { Appointment, Clinic } from '../types/index.js';
import { ApiService } from '../services/api.js';

interface ClinicianQueueProps {
  clinics: Clinic[];
  selectedClinicId: string;
  setSelectedClinicId: (id: string) => void;
}

export const ClinicianQueue: React.FC<ClinicianQueueProps> = ({
  clinics,
  selectedClinicId,
  setSelectedClinicId
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [queueData, setQueueData] = useState<{
    totalCount: number;
    hourlyDistribution: Array<{ timeWindow: string; total: number; completed: number; scheduled: number }>;
    appointments: Appointment[];
  }>({ totalCount: 0, hourlyDistribution: [], appointments: [] });

  // Modal State for Medication & Next Follow-up
  const [intakeModalOpen, setIntakeModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [medicationName, setMedicationName] = useState<string>('TLD (Tenofovir / Lamivudine / Dolutegravir)');
  const [dosage, setDosage] = useState<string>('1 tablet once daily at 8:00 PM after food');
  const [reminderDate, setReminderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmittingIntake, setIsSubmittingIntake] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getClinicianQueue(selectedClinicId || undefined, selectedDate);
      setQueueData(data);
    } catch (err: any) {
      console.error('Failed to fetch clinician queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedClinicId, selectedDate]);

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await ApiService.updateAppointmentStatus(appointmentId, status);
      await fetchQueue();
      showNotification(`Appointment marked as ${status}`);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleOpenIntakeModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setIntakeModalOpen(true);
  };

  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setIsSubmittingIntake(true);
      await ApiService.createReminder({
        patientId: selectedAppointment.patientId,
        appointmentId: selectedAppointment.id,
        medicationName,
        dosage,
        reminderDate,
        reminderTime: '20:00'
      });

      // Mark appointment as COMPLETED automatically
      await ApiService.updateAppointmentStatus(selectedAppointment.id, 'COMPLETED');

      setIntakeModalOpen(false);
      await fetchQueue();
      showNotification(`Medication alert scheduled and appointment completed for ${selectedAppointment.patient.fullName}`);
    } catch (err: any) {
      alert(`Failed to save intake: ${err.message}`);
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const currentClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-teal-500/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                Live Queue Management
              </span>
              <span className="text-xs text-slate-500">Decongestion Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {currentClinic ? currentClinic.name : 'Health Facility Queue'}
            </h1>
            <p className="text-sm text-slate-500">
              {currentClinic?.location} • {currentClinic?.department}
            </p>
          </div>

          {/* Clinic & Date Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Facility</label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 p-2 font-medium"
              >
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Queue Date</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 p-2 font-medium"
                />
                <button
                  onClick={fetchQueue}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Refresh Queue"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Congestion Breakdown Visualizer (Impact of Decongestion) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Hourly Patient Distribution & Capacity</span>
            </h2>
            <p className="text-xs text-slate-500">
              Time-slotted scheduling levels outpatient arrival peaks to prevent 8:00 AM waiting room overcrowding.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-teal-600">{queueData.totalCount}</span>
            <span className="text-xs text-slate-400 block font-medium">Total Booked Today</span>
          </div>
        </div>

        {/* Visual Bar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {queueData.hourlyDistribution.length > 0 ? (
            queueData.hourlyDistribution.map((slot, idx) => {
              const maxCap = 8; // target capacity per hour
              const percentage = Math.min(100, Math.round((slot.total / maxCap) * 100));
              const isOvercrowded = slot.total >= 8;

              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition-all ${
                    isOvercrowded 
                      ? 'bg-amber-50/60 border-amber-200' 
                      : 'bg-slate-50 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{slot.timeWindow}</span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isOvercrowded ? 'bg-amber-200 text-amber-900' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {slot.total} pts
                    </span>
                  </div>

                  {/* Progress meter */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOvercrowded ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Done: {slot.completed}</span>
                    <span>Pending: {slot.scheduled}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-6 text-center text-slate-400 text-sm">
              No hourly appointments allocated for this date.
            </div>
          )}
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-slate-700" />
            <span>Today's Outpatient Roster</span>
          </h2>
          <span className="text-xs text-slate-500">
            {queueData.appointments.length} patients in queue
          </span>
        </div>

        {queueData.appointments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No scheduled patients for this date</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Patients can schedule their visit via USSD code (*284#) or the Android portal.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Time Window</th>
                  <th className="px-6 py-3">Ref Code</th>
                  <th className="px-6 py-3">Patient Details</th>
                  <th className="px-6 py-3">Booking Channel</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Clinician Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Time Window */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-slate-800">
                          {app.slot.startTime} - {app.slot.endTime}
                        </span>
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {app.bookingReference}
                      </span>
                    </td>

                    {/* Patient */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-900">{app.patient.fullName}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>{app.patient.phoneNumber}</span>
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-600">
                            {app.patient.languagePref || 'EN'}
                          </span>
                        </div>
                        {app.notes && (
                          <div className="text-[11px] text-teal-700 mt-1 bg-teal-50 px-2 py-0.5 rounded inline-block">
                            {app.notes}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.bookingChannel === 'USSD' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <Phone className="w-3 h-3" />
                          <span>USSD (*284#)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                          <Smartphone className="w-3 h-3" />
                          <span>Android App</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.status === 'SCHEDULED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Waiting / Scheduled
                        </span>
                      )}
                      {app.status === 'COMPLETED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Completed
                        </span>
                      )}
                      {app.status === 'NO_SHOW' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          No-Show
                        </span>
                      )}
                      {app.status === 'CANCELLED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {app.status === 'SCHEDULED' && (
                        <>
                          <button
                            onClick={() => handleOpenIntakeModal(app)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition"
                          >
                            <Pill className="w-3.5 h-3.5 mr-1.5" />
                            Prescribe & Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'NO_SHOW')}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Mark Patient No-Show"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {app.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenIntakeModal(app)}
                          className="text-xs text-teal-600 font-semibold hover:underline"
                        >
                          Add Follow-up Alert
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Medication Intake & Reminder Scheduling Modal */}
      {intakeModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Prescribe & Schedule Medication Alerts
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <span className="font-semibold text-slate-800">{selectedAppointment.patient.fullName}</span> ({selectedAppointment.patient.phoneNumber})
                </p>
              </div>
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIntake} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medication Name & Formulation
                </label>
                <select
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium focus:ring-teal-500"
                >
                  <option value="TLD (Tenofovir / Lamivudine / Dolutegravir)">TLD (Tenofovir / Lamivudine / Dolutegravir)</option>
                  <option value="Coartem (Artemether / Lumefantrine)">Coartem (Artemether / Lumefantrine)</option>
                  <option value="Amoxicillin 500mg">Amoxicillin 500mg</option>
                  <option value="Ferrous Sulphate & Folic Acid (IFA)">Ferrous Sulphate & Folic Acid (IFA - Antenatal)</option>
                  <option value="Metformin 500mg">Metformin 500mg (Chronic Care)</option>
                  <option value="Amlodipine 5mg">Amlodipine 5mg (Hypertension)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dosage Instructions (Luganda / English translated)
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 tablet daily at 8:00 PM with food"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  First Reminder Start Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium focus:ring-teal-500"
                />
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold mb-1">📢 Africa's Talking Automated GSM SMS Trigger:</p>
                <p>
                  The patient will automatically receive periodic SMS medication adherence prompts in{' '}
                  <span className="font-bold underline">
                    {selectedAppointment.patient.languagePref === 'LG' ? 'Oluganda' : 'English'}
                  </span>{' '}
                  to prevent clinic follow-up defaults.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIntake}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/30 transition flex items-center space-x-1.5"
                >
                  {isSubmittingIntake ? (
                    <span>Scheduling...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Schedule SMS Alert</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

