// app/models/QuestionnaireResponse.js
'use strict';
var mongoose = require('mongoose'); // Need mongoose to define Schemas/Models

var QuestionnaireResponseSchema = mongoose.Schema({
    resourceType: String,
    id: String,
    identifier: {},     // Identifier -> Unique id for this set of answers
    questionnaire: {},  // Reference(Questionnaire) -> Form being answered
    status: String,     // <code> in-progress | completed | amended
    subject: {},        // Reference(Any) -> Subject of the questions
    author: {},         // Reference(Device|Practitioner|Patient|RelatedPerson) -> Person who received+recorded answers
    authored: Date,     // <dateTime> -> Date the version was authored
    source: {},         // Reference(Patient|Practitioner|RelatedPerson) -> Person who answered questionnaire
    encounter: {},      // Reference(Encounter) -> Primary encounter when the answers were collected
    item: [
        {
            _id: false,
            linkId: String, // Corresponding item within Questionnaire
            text: String,   // Name for group | question
            subject: {},    // Reference(Any) -> Subject this group's answers are about
            answer: [{
                _id: false,
                valueBoolean: Boolean,
                valueInteger: Number,
                valueDecimal: Number, // <decimal> can this be a float?
                valueDate: Date,
                valueDateTime: Date,  // <dateTime> can this be more specific (also have time) <dateTime>?
                // valueInstant:         <instant> See http://hl7.org/fhir/2016May/datatypes.html#instant
                // valueTime:            <time> Time of day; see http://hl7.org/fhir/2016May/datatypes.html#time
                valueString: String,
                valueUri: String,
                valueAttachment: {},  // { Attachment }
                valueCoding: {},      // { Coding }
                valueQuantity: {},    // { Quantity }
                valueReference: {}   // { Reference(Any) }
            }]
        }
    ]
});

QuestionnaireResponseSchema.methods.getResourceType = function() {
    return this.resourceType;
};

QuestionnaireResponseSchema.methods.getId = function() {
    return this.id;
};

var QuestionnaireResponse = mongoose.model('Questionnaire_Responses', QuestionnaireResponseSchema);
// db.collection = questionnaire_responses
module.exports.model = QuestionnaireResponse;