import React from 'react';
import { 
  Layers, ShieldCheck, Database, Smartphone, Phone, 
  Clock, CheckCircle, ArrowRight, Activity, Users 
} from 'lucide-react';

export const SystemArchitectureModal: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
      
      {/* Title & Case Study Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3 border border-teal-500/30">
          <Activity className="w-4 h-4" />
          <span>Case Study: Kampala Public Health Clinics & Bugema University HC</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          System Architecture & Engineering Specification
        </h1>
        <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
          Solving outpatient congestion, extreme 8:00 AM patient queues, and chronic medication follow-up defaults in resource-constrained public healthcare settings through a synchronized dual-channel scheduling platform.
        </p>
      </div>

      {/* Dual Channel Architecture Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Channel A */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Channel A: Smartphone / Android Client
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Targeting smartphone owners, university students, and health workers.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Interactive visual hourly time-slot picker with live capacity counters.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Persistent booking countdown cards and electronic booking reference codes.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Luganda & English dynamic multilingual interface.</span>
            </li>
          </ul>
        </div>

        {/* Channel B */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Channel B: Offline GSM USSD (*284#) & SMS
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Targeting 2G basic feature phone users across peri-urban & rural Uganda.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Zero-data, zero-internet requirement via telco GSM signaling.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Africa's Talking webhook handling with fast continuous menu (<code className="font-bold">CON</code>) and terminal (<code className="font-bold">END</code>) sessions.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Instant fallback SMS confirmation and automated 24h reminders.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Concurrency & Over-Allocation Prevention */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              High-Concurrency Slot Reservation & Race-Condition Safety
            </h3>
            <p className="text-xs text-slate-500">
              How Obulamu-Link prevents two patients from booking the last available slot simultaneously.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
          <p className="text-teal-400">// Interactive Prisma Transaction with Optimistic Version Locking</p>
          <p>await prisma.$transaction(async (tx) =&gt; &#123;</p>
          <p className="pl-4">const slot = await tx.appointmentSlot.findUnique(&#123; where: &#123; id: slotId &#125; &#125;);</p>
          <p className="pl-4 text-amber-300">if (slot.bookedCount &gt;= slot.maxPatients) throw new Error('Slot full');</p>
          <p className="pl-4">const updated = await tx.appointmentSlot.update(&#123;</p>
          <p className="pl-8">where: &#123; id: slotId, version: slot.version &#125;,</p>
          <p className="pl-8">data: &#123; bookedCount: &#123; increment: 1 &#125;, version: &#123; increment: 1 &#125; &#125;</p>
          <p className="pl-4">&#125;);</p>
          <p className="pl-4">return await tx.appointment.create(&#123; ... &#125;);</p>
          <p>&#125;);</p>
        </div>
      </div>

      {/* Relational Schema Map */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Relational Database Entities
            </h3>
            <p className="text-xs text-slate-500">
              PostgreSQL / SQLite schema managed via Prisma ORM.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Users</span>
            <p className="text-slate-600">id, role (PATIENT, CLINICIAN), phone_number, password_hash, full_name, language_pref (EN, LG)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Clinics</span>
            <p className="text-slate-600">id, name, location, daily_capacity, department, open_time, close_time</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">AppointmentSlots</span>
            <p className="text-slate-600">id, clinic_id, slot_date, start_time, end_time, max_patients, booked_count, version</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Appointments</span>
            <p className="text-slate-600">id, booking_reference, patient_id, clinic_id, slot_id, booking_channel (ANDROID, USSD), status</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">MedicationReminders</span>
            <p className="text-slate-600">id, patient_id, medication_name, dosage, reminder_date, channel (SMS, PUSH), sent_status</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">USSSessions & SMSLogs</span>
            <p className="text-slate-600">session_id, phone_number, current_state, message, status, provider_id</p>
          </div>
        </div>
      </div>

    </div>
  );
};

