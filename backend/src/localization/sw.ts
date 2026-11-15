export const sw = {
  welcome: "CON Karibu kwenye Obulamu-Link\n1. Weka Miadi ya Daktari\n2. Angalia Miadi Yako\n3. Badilisha au Ghairi Miadi\n4. Chagua Lugha (English/Luganda/Kiswahili)",
  selectDepartment: "CON Chagua Kitengo cha Kliniki:\n1. Wagonjwa wa Nje (OPD)\n2. Magonjwa ya Kudumu / ART Clinic\n3. Huduma ya Wajawazito (Antenatal)",
  selectClinic: "CON Chagua Kituo cha Afya:\n",
  selectDate: "CON Chagua Tarehe Unayotaka:\n",
  selectSlot: "CON Chagua Saa ya Miadi:\n",
  noSlotsAvailable: "END Samahani, hakuna nafasi zilizobaki kwa tarehe uliyochagua. Tafadhali jaribu tarehe nyingine.",
  bookingConfirmed: "END Miadi imethibitishwa tarehe {date} saa {time} katika {clinic}. Nambari yako ni: {id}. Ujumbe wa SMS umetumwa kwenye simu yako.",
  bookingError: "END Mfumo haukuweza kukamilisha miadi yako. Nafasi inaweza kuwa imejaa. Tafadhali jaribu tena.",
  noAppointmentsFound: "END Huna miadi yoyote iliyoratibiwa kwa sasa.",
  yourAppointments: "CON Miadi Yako Inayokuja:\n{list}\nWeka 0 kurudi mwanzo au 99 kutoka",
  cancelSelect: "CON Chagua miadi unayotaka kughairi:\n{list}",
  cancelConfirmed: "END Miadi nambari {id} imeghairiwa kikamilifu.",
  cancelFailed: "END Imeshindikana kughairi miadi. Tafadhali wasiliana na mapokezi ya kliniki.",
  selectLanguage: "CON Chagua Lugha / Select Language / Londa Olulimi:\n1. English\n2. Oluganda\n3. Kiswahili",
  languageUpdated: "END Lugha imebadilishwa kuwa Kiswahili. Asante sana.",
  invalidInput: "CON Chaguo si sahihi. Tafadhali chagua nambari iliyoorodheshwa:\n",
  sessionEnded: "END Asante kwa kutumia Obulamu-Link. Tunakutakia afya njema!",

  // SMS Templates in Swahili
  smsBookingConfirmation: "Obulamu-Link: Miadi yako katika {clinic} ({dept}) imethibitishwa tarehe {date} saa {time}. Nambari: {id}. Fika mapema dakika 10.",
  sms24HourReminder: "Obulamu-Link KUMBUKUMBU: Una miadi ya kliniki kesho {date} saa {time} katika {clinic}. Piga *284# kubadilisha au kughairi.",
  smsMedicationReminder: "Obulamu-Link UKUMBUSHO WA DAWA: Kumbuka kumeza dawa yako: {medication} ({dosage}). Afya bora ni utajiri!"
};
