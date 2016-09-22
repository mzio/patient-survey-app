// public/scripts/angular/questionnaire/controller.js

'use strict';
angular
    .module('app')
    .controller('questionnaireController', ['dbResource', 'setQuestionnaire', 'scoreAnswers',
        '$stateParams', '$q', '$http', '$location', questionnaire]);

angular
    .module('app')
    .controller('questionnaireInputController', [questionnaireInput]);

function questionnaire(dbResource, setQuestionnaire, scoreAnswers, $stateParams, $q, $http, $location) {
    /* jshint validthis: true */
    var vm = this;
    var id = $stateParams.id;
    
    /* Resource Collection */
    dbResource.getResource('Questionnaire', id)
        .success(function(data) {
            vm.title = data.title;
            vm.id = data.title;
            vm.description = setQuestionnaire.refineResource(data, [])[0].text;

            setQuestionnaire.updateQuestionnaire(data)
                .then(function(res) {
                    console.log(res);
                    vm.display = res;
                });
        })
        .error(function(data) {
            console.log('Error: ', data);
        });
    
    /* Form Input Collection */
    vm.formModel = {'questionnaire': id};
    vm.formValues = {};  // formValue seems to update all things with the latest pick <-- need to isolate
    
    vm.updateItem = function(
        linkId='',
        text='',
        subject='',
        valueInteger=0,
        valueString='',
        valueCoding=''
    ) {
        vm.formValues[linkId] = {
            'linkId': linkId,
            'text': text,
            'subject': {
                'display':subject},     // Denotes the question category (if applicable) ex.) SIBDQ: bowl | system | emotion | social
            'answer': [{
                'valueInteger': valueInteger,   // idk if this should be number or string yet...
                'valueString': valueString,
                'valueCoding': {
                    'system':'ValueSet/cs_answers_colitis-SIBDQ',
                    'code':valueCoding
                }
            }]
        };
    };

    /** Questionnaire Response **/
    //* Posting to the server
    vm.onSubmit = function() {  // ng doesn't seem to recognize successful HTTP POST
        console.log(getQuestionnaireResponse());
        $http.post('/api/questionnaire_responses', getQuestionnaireResponse())
            .then(function(res) {
                console.log('Client-side POST completed!');
            }, function(err) {
                console.log("Error: "+err.data);
            });
        };
        // TODO: may also want to submit metadata for easier data analysis (time, SIBDQ categories, scores). Same ng-directive but to different Express server
        // TODO: RESPONSE --> this is covered w/ factory.score.js methods (processes QuestionnaireResponse into easier data)

    
    //* Generate QuestionnaireResponse on the client side
    function getQuestionnaireResponse() {
        // Creating a QuestionnaireResponse resource
        var submitModel = vm.formValues;
        var formModel = vm.formModel;
        var submission = {
            'resourceType': 'QuestionnaireResponse',
            'id': '',
            'questionnaire':'',
            'status':'completed',
            'author': {
                'resourceType': 'Device'
            },
            'authored': '',
            'source': 'Patient',
            'item': []
        };
        // Submission Time (keys: authored)
        submission.authored = new Date();
        // Identification (keys: id, questionnaire)
        var Questionnaire = formModel.questionnaire;
        submission.id = Questionnaire +'_Response_'+Date();
        submission.questionnaire = {    // this breaks for submitting to testinputs
            'reference':'Questionnaire/'+Questionnaire,
            'display':Questionnaire
        };
        // Item entry (keys: item)
        for (var key in submitModel) {
            if (submitModel.hasOwnProperty(key)) {
                submission.item.push(submitModel[key]);
            }
        }
        // console.log(submission); // to test
        return submission;
    }

    //* Calculate score
    scoreAnswers.latest()
        .then(function(res) {
            vm.score = scoreAnswers.total(res);
            vm.normScore = scoreAnswers.normalize(res);
        });


    /** JQUERY STYLING **/ // idc if I'm breaking the view model separation rules
    $(document).ready(function() {
        setTimeout(function() {
            $("#view-button").show();
        }, 500);
    });
}

function questionnaireInput() {
    /* jshint validthis: true */
    var vm = this;
    vm.res = {};
}

