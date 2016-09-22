// app/models/QuestionnaireResponse.js
var mongoose = require('mongoose');

var testInputSchema = mongoose.Schema({
    questionnaire: {},
    testInput: {}
}); // Normally Mongoose auto-looks for the plural version the model name (arg1), also lowercases all of it

testInputSchema.methods.getQuestionnaire = function() {
    'use strict';
    return this.questionnaire;
};

var TestInputModel = mongoose.model('TestInput', testInputSchema); // Mongoose auto-looks for the plural version the model name (arg1)

module.exports.model = TestInputModel;