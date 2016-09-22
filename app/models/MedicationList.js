// app/models/MedList.js

/* Info */
// Note: All SIBDQ medication list ValueSets are currently stored in the fhir_resources MongoDB collection
// Schema applies to (SIBDQ: medlist, submedlist) FHIR value set resources

var mongoose = require('mongoose');
var fhirResource = require('./fhirResource');

var medListSchema = fhirResource.schema;

medListSchema.add({
    identifier: {
        system: String,
        value: Number
    },
    name: String,
    description: String
});

module.exports.model = mongoose.model('MedicationList', medListSchema);