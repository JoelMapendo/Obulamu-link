export const en = {
  welcome: "CON Welcome to Obulamu-Link Clinic Portal\n1. Book Appointment\n2. View Scheduled Visit\n3. Reschedule / Cancel\n4. Change Language (English/Luganda)",
  selectDepartment: "CON Select Clinic Department:\n1. General Outpatient (OPD)\n2. Chronic Care / ART Clinic\n3. Antenatal Care (MCH)",
  selectClinic: "CON Select Health Facility:\n",
  selectDate: "CON Select Preferred Date:\n",
  selectSlot: "CON Select Hourly Time Window:\n",
  noSlotsAvailable: "END Sorry, no available appointment slots for the selected date. Please try another date.",
  bookingConfirmed: "END Booking confirmed for {date} at {time} at {clinic}. Booking ID: {id}. An SMS confirmation has been sent.",
  bookingError: "END System was unable to complete your booking. The slot might be full. Please try again.",
  noAppointmentsFound: "END You have no active upcoming appointments scheduled.",
  yourAppointments: "CON Your Upcoming Appointments:\n{list}\nEnter 0 to return to Main Menu or 99 to exit",
  cancelSelect: "CON Select Appointment to Cancel:\n{list}",
  cancelConfirmed: "END Appointment {id} has been cancelled successfully.",
  cancelFailed: "END Failed to cancel appointment. Please contact clinic reception.",
  selectLanguage: "CON Select Language / Londa Olulimi:\n1. English\n2. Oluganda",
  languageUpdated: "END Language updated to English. Webale nnyo.",
  invalidInput: "CON Invalid selection. Please choose an option from the list:\n",
  sessionEnded: "END Thank you for using Obulamu-Link Clinic Portal. Stay healthy!",
  
  // SMS Templates
  smsBookingConfirmation: "Obulamu-Link: Your appointment at {clinic} ({dept}) is confirmed for {date} at {time}. Booking ID: {id}. Please arrive 10 mins early.",
  sms24HourReminder: "Obulamu-Link REMINDER: You have a clinic appointment tomorrow {date} at {time} at {clinic}. Reply 1 to Confirm or dial *284# to reschedule.",
  smsMedicationReminder: "Obulamu-Link MED ALERT: Friendly reminder to take your medication: {medication} ({dosage}). Good health is your wealth!"
};

