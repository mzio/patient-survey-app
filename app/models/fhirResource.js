// app/models/fhirResource.js
'use strict';
var mongoose = require('mongoose');

var resourceSchema = mongoose.Schema({
    resourceType: String,
    id: String,
    status: String
}, {collection : 'fhir_resources'});  // 2nd arg { collection : 'fhir_resources' } would overrides mongoose automatically generated collection
                                        // Normally Mongoose auto-looks for the plural version the model name (arg1)
                                        // 8/8 update: Put in place for MedicationList model

resourceSchema.methods.getId = function() {
    return this.id;
};

resourceSchema.methods.getResourceType = function() {
    return this.resourceType;
};

var resourceModel = mongoose.model('fhir_resource', resourceSchema);

module.exports.schema = resourceSchema;
module.exports.model = resourceModel;