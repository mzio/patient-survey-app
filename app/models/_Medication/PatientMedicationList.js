// app/models/_Medication/PatientMedicationList.js

var mongoose = require('mongoose');

var patientMedListSchema = mongoose.Schema({
    schemaType: String,
    patientId: String,
    list: {}
});

var patientMedListModel = mongoose.model('Patient_MedList', patientMedListSchema);
// collection should be patient_medlists

module.exports.model = patientMedListModel;
