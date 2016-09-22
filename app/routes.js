// app/routes.js

// Load path definition module
var path = require('path');

// Load FHIR Resource models
var fhirResource = require('./models/fhirResource');
var QuestionnaireResponse = require('./models/QuestionnaireResponse');
var MedicationList = require('./models/MedicationList');
var TestInputModel = require('./models/TestInput');  // The model for testing questionnaire form submissions (created 8/7/16)

// Load _Medication schema models
var PatientMedicationList = require('./models/_Medication/PatientMedicationList');
var fhirMedicationList =  require('./models/_Medication/fhirMedicationList');

//* Load mongoDB model for doc-related requests
// Starting local FHIR models
var FHIR_Resource = fhirResource.model; // mongoose automatically generates a collection called fhir_resources
var TestInput = TestInputModel.model;   // The model for testing questionnaire form submissions (created 8/7/16)
var MedList = MedicationList.model;

// _Medication models + Patient generated models
var PatientMedList = PatientMedicationList.model;
var QuestionRes = QuestionnaireResponse.model;
var FHIR_MedList = fhirMedicationList.model;

// Define our API routes
var routes = function(app) {

    /*** DATABASE (RELATED) METHODS ***/

    /** Pull Available FHIR resources from MongoDB **/
    // Get a single FHIR resource
    app.get('/api/fhir_resources/:resourceType/:id', function(req, res) {
        console.log(req.params);
        FHIR_Resource.findOne(req.params, function(err, resource) {
            if (err) console.log("Error retrieving resource:", err);
            app.set('json spaces', 1);
            res.json(resource); // vs jsonp? What's the difference?
        });
    });

    // Get all FHIR resources of a single resourceType
    app.get('/api/fhir_resources/:resourceType/', function(req, res) {
        console.log(req.params);
        FHIR_Resource.find(req.params, function(err, resource) {
            if (err) console.log("Error retrieving resource:", err);
            app.set('json spaces', 1);
            res.json(resource); // vs jsonp? What's the difference?
        });
    });

    /** Questionnaire Response Data **/
    app.get('/api/questionnaire_responses', function(req, res) {
        QuestionRes.find({"resourceType": "QuestionnaireResponse"}, '-__v', function(err, data) {   // '-_id' excludes the _id field from the result
            if (err) {
                res.send(err);
                console.log('Error');
            }
            res.json(data);
        });
    });
    // Posting responses to the questionnaire_responses server
    app.post('/api/questionnaire_responses', function(req, res) {
        console.log(req.body);
        QuestionRes.create(req.body, function(err, responses) {
            if (err) {
                res.send(err);
                console.log('Error: ' + err);
            }
            console.log(responses);
            console.log("Posted!"+'\n'+'Access at localhost:8080/api/questionnaire_responses');
        });
    });
    
    /** Medication Lists **/
    // Get all submedlists (Use unique mongoose schema b/c resourceSchema != specific enough...
    app.get('/api/fhir_resources/ValueSet/medication_lists/IBD', function(req, res) {
        MedList.find({"identifier.system":"ValueSet/medlist-general-IBD"}, function(err, resource) {
            if (err) {
                res.send(err);
                console.log('Error');
            }
            res.json(resource);
        });
    });
    // Get specific submedlist (based on matching general-med RxNorm code), last part should be RxCui?code=<code>
    app.get('/api/fhir_resources/ValueSet/medication_lists/IBD/?RxCUI', function(req, res) {
        // console.log(req.query.code, typeof req.query.code);
        var medFilter = {identifier:{system:"ValueSet/medlist-general-IBD", value:req.query.code}}; // Mongoose specific way?
        // console.log(medFilter);
        MedList.find(medFilter, function(err, resource) {
            if (err) {
                res.send(err);
                console.log('Error');
            }
            res.json(resource);
        });
    });

    /** Patient Medication List Responses **/
    app.get('/api/patient_medlists', function(req, res) {
        PatientMedList.find(function(err, patient_medlists) {
            if (err) {
                res.send(err);
            }
            res.json(patient_medlists);
        });
    });
    app.post('/api/patient_medlists', function(req, res) {
        PatientMedList.remove({},function(err, removed) {
            if (err) {
                res.send(err);
                console.log('Error: '+err);
            }
            PatientMedList.create({
                    schemaType: req.body.type, list:req.body},
                function(err, patient_medlist) {
                    if (err) {
                        res.send(err);
                        console.log('Error: '+err);
                    }
                    console.log("Posted!"+'\n'+"Access at localhost:8080/api/patient_medlists");
                });
        });
    });

    /** FHIR Medication List Resources **/
    //* Converted from Patient Medication List Responses
    app.get('/api/fhir_medlists', function(req, res) {
        FHIR_MedList.find(function(err, fhir_medlists) {
            if (err) {
                res.send(err);
            }
            res.json(fhir_medlists);
        });
    });
    app.post('/api/fhir_medlists', function(req, res) {
        console.log(req.body);
        FHIR_MedList.create(req.body, function(err, responses) {
            if (err) {
                res.send(err);
                console.log('Error: ' + err);
            }
            console.log(responses);
            console.log("Posted!"+'\n'+'Access at localhost:8080/api/fhir_medlists');
        });
    });
    
    /* Testing Questionnaire Submission Data */
    // # Getting the stored questionnaireInputs
    app.get('/api/testinputs', function(req, res) {
        TestInput.find(function(err, inputs) {
            if (err) {
                res.send(err);
            }
            res.json(inputs);
        });
    });
    // # Create questionnaireInputs and send all back after creation
    app.post('/api/testinputs', function(req, res) {
        // console.log(req.body); // <-- console.logs the actual json data...
        // console.log(req.body.questionnaire);
        TestInput.create({
            questionnaire: req.body.questionnaire,
            testInput: req.body}, function(err, input) {  // callback function refers to the created model
            if (err) {
                res.send(err);
                console.log('Error: '+err);
            }
            console.log("POST request received."+'\n'+"Posting:"+'\n',
                    input,'\n'+'...to localhost:8080/api/testinputs...');
            res.send(input);
        });
    });
    // # Delete testInputs
    // Don't give this as an option to people <-- do manually in console for now


    //* Submedication Lists */

    // // Get submedlists (Use unique mongoose schema b/c resourceSchema != specific enough...
    // app.get('/api/fhir_resources/ValueSet/SubMedList', function(req, res) {
    //     MedList.find({"identifier.system":"ValueSet/medlist-general-IBD"}, function(err, res) {
    //         if (err) {
    //             res.send(err);
    //         }
    //         res.json(inputs);
    //     });
    // });


    /** ANGULAR RELATED METHODS **/
    // Home
    app.get('/', function(req, res) {   // Catch-all route for all non-specified paths
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });
    
    // Results
    app.get('/results', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });
    
    // Medication Tracking
    app.get('/medication-tracking', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });

    // Surveys
    app.get('/questionnaireSet', function(req, res) {
        console.log("Request received!");
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });

    // Individual surveys
    app.get('/questionnaireSet/:id', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });

    app.get('/questionnaire', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });

    // Submitted Questionnaire Data (working test)
    app.get('/questionnaire-input', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });
    
    app.post('/questionnaire-input', function(req, res) {
        console.log('POST request to homepage');
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
        console.log(req.body);
        console.log("POST request received."+'\n'+"Posting:"+'\n'+
            req.body+'\n'+'...to localhost:8080/api/testinputs...');
    });
    
    // Successful Questionnaire submission
    app.get('/submit-success', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });

    // Default redirect to main
    app.get('*', function(req, res) {   // Catch-all route for all non-specified paths
        res.sendFile('index.html', { root: path.join(__dirname, '../public')});
    });
};

// Expose them to the server
module.exports = routes;