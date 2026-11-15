import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Obulamu-Link database seed...');

  // 1. Clear existing data
  await prisma.sMSLog.deleteMany();
  await prisma.medicationReminder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.appointmentSlot.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.uSSDSession.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Seed Users (Clinicians, Patients, Admins)
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  const drSarah = await prisma.user.create({
    data: {
      fullName: 'Dr. Sarah Namubiru',
      phoneNumber: '+256772100100',
      passwordHash: defaultPasswordHash,
      role: 'CLINICIAN',
      languagePref: 'EN'
    }
  });

  const drDavid = await prisma.user.create({
    data: {
      fullName: 'Dr. David Mukasa',
      phoneNumber: '+256772200200',
      passwordHash: defaultPasswordHash,
      role: 'CLINICIAN',
      languagePref: 'LG'
    }
  });

  const patientMary = await prisma.user.create({
    data: {
      fullName: 'Mary Nakato',
      phoneNumber: '+256701334455',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      languagePref: 'LG'
    }
  });

  const patientJohn = await prisma.user.create({
    data: {
      fullName: 'John Baptist Kato',
      phoneNumber: '+256782556677',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      languagePref: 'EN'
    }
  });

  console.log('✅ Users seeded: Clinicians and Patients.');

  // 3. Seed Kampala Public Health Clinics & Bugema University Health Centre
  const clinicBugema = await prisma.clinic.create({
    data: {
      name: 'Bugema University Health Centre',
      location: 'Bombo Road, Luweero / Kampala Metro',
      department: 'General Outpatient & ART',
      dailyCapacity: 120,
      openTime: '08:00',
      closeTime: '17:00'
    }
  });

  const clinicKisenyi = await prisma.clinic.create({
    data: {
      name: 'Kisenyi Health Centre IV',
      location: 'Kisenyi, Central Division, Kampala',
      department: 'General Outpatient & MCH',
      dailyCapacity: 200,
      openTime: '08:00',
      closeTime: '18:00'
    }
  });

  const clinicKawempe = await prisma.clinic.create({
    data: {
      name: 'Kawempe National Referral Hospital',
      location: 'Kawempe Division, Kampala',
      department: 'Antenatal Care & Obstetrics',
      dailyCapacity: 350,
      openTime: '07:30',
      closeTime: '18:00'
    }
  });

  const clinicKiruddu = await prisma.clinic.create({
    data: {
      name: 'Kiruddu National Referral Hospital',
      location: 'Buziga, Makindye Division, Kampala',
      department: 'Chronic Care / ART Clinic',
      dailyCapacity: 250,
      openTime: '08:00',
      closeTime: '17:00'
    }
  });

  console.log('✅ Clinics seeded.');

  // 4. Generate Hourly Slots for Next 7 Days
  const clinics = [clinicBugema, clinicKisenyi, clinicKawempe, clinicKiruddu];
  const timeWindows = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' }
  ];

  const today = new Date();
  let createdSlotsCount = 0;
  let sampleSlotId = '';

  for (const clinic of clinics) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      for (const window of timeWindows) {
        const slot = await prisma.appointmentSlot.create({
          data: {
            clinicId: clinic.id,
            slotDate: dateStr,
            startTime: window.start,
            endTime: window.end,
            maxPatients: 8,
            bookedCount: dayOffset === 0 && window.start === '08:00' ? 3 : 1
          }
        });
        createdSlotsCount++;
        if (!sampleSlotId) sampleSlotId = slot.id;
      }
    }
  }

  console.log(`✅ Generated ${createdSlotsCount} hourly appointment slots across 7 days.`);

  // 5. Seed Sample Appointments
  const todayStr = today.toISOString().split('T')[0];
  const todaySlot = await prisma.appointmentSlot.findFirst({
    where: { clinicId: clinicBugema.id, slotDate: todayStr }
  });

  if (todaySlot) {
    const app1 = await prisma.appointment.create({
      data: {
        bookingReference: 'OBL-1001',
        patientId: patientMary.id,
        clinicId: clinicBugema.id,
        slotId: todaySlot.id,
        bookingChannel: 'USSD',
        status: 'SCHEDULED',
        notes: 'Follow-up on ART refill'
      }
    });

    // Seed medication reminders for Mary
    await prisma.medicationReminder.create({
      data: {
        appointmentId: app1.id,
        patientId: patientMary.id,
        medicationName: 'TLD (Tenofovir / Lamivudine / Dolutegravir)',
        dosage: '1 tablet daily at 8:00 PM with water',
        reminderDate: todayStr,
        reminderTime: '20:00',
        channel: 'SMS',
        language: 'LG',
        sentStatus: 'PENDING'
      }
    });
  }

  console.log('✅ Sample appointments and medication reminders seeded.');
  console.log('------------------------------------------------------');
  console.log('Demo Clinician Login:');
  console.log('  Phone:    +256772100100');
  console.log('  Password: Password123!');
  console.log('Demo Patient Login:');
  console.log('  Phone:    +256701334455');
  console.log('  Password: Password123!');
  console.log('------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

