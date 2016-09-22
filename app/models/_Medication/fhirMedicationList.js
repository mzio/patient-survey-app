// app/models/_Medication/fhirMedicationList.js
'use strict';
var mongoose = require('mongoose');

var fhirMedicationListSchema = mongoose.Schema({
    resourceType: String,   // List
    id: String,
    status: String,         // (current) | retired | entered-in-error
    mode: String,           // (working) | snapshot | changes
    title: String,
    code: {
        coding: [
            {
                _id: false,
                system: String,     // http://hl7.org/fhir/2016May/codesystem-list-example-codes.html
                version: String,
                code: String,       // medications
                display: String,    // Medication List
                userSelected: Boolean
            }
        ],
        text: String
    },
    subject: {},
    encounter: {},
    date: Date,
    source: {},
    orderedBy: {},
    note: String,
    entry: [
        {
            _id: false,
            flag: {},
            deleted: Boolean,
            date: Date,
            item: {                                 // Examples (already defined in local fhir_resources collection
                system: String,                     // "http://www.nlm.nih.gov/research/umls/rxnorm",
                version: String,                    // "2016-01-04",
                concept: [
                    {
                        _id: false,
                        code: String,               // "795085",
                        display: String,            // "Cimzia 200 MG Injection",
                        designation: [
                            {
                                _id: false,
                                use: {
                                    system: String, // "http://snomed.info/sct",
                                    code: String,   // "900000000000013009",
                                    display: String // "RxNorm Name"
                                },
                                text: String        // "certolizumab pegol 200 MG Injection [Cimzia]"
                            }
                        ]
                    }
                ]
            }
        }
    ],
    emptyReason: {}
});

fhirMedicationListSchema.methods.getResourceType = function() {
    return this.resourceType;
};

fhirMedicationListSchema.methods.getId = function() {
    return this.id;
};

var fhirMedList = mongoose.model('FHIR_MedList', fhirMedicationListSchema);
// collection should be fhir_medlists

module.exports.model = fhirMedList;