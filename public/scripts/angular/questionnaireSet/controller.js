// public/scripts/angular/questionnaireSet/controller
'use strict';
angular
    .module('app')
    .controller('questionnaireSetController', ['dbResource', 'scoreAnswers','$http', questionnaireSet]);

function questionnaireSet(dbResource, scoreAnswers, $http) {
    /* jshint validthis: true */
    var vm = this;

    /* TODO: ability to select which questionnaires to load
     var resourcesToLoad = ['questionn_colitis-SIBDQ-A', 'questionn_colitis-SIBDQ-B']; */

    // Get Available Questionnaires
    dbResource.getResource('Questionnaire')
        .then(function(res) {
            for (var i = 0; i < res.data.length; i++) {
                console.log(res.data);
                if (res.data[i].id === 'questionn_medtrack-IBD') {
                    res.data.splice(i, 1);
                    // console.log(res.data);
                }
            }
            return res.data;
        })
        .then(function(res) {
            vm.res = res;
        });

    // Get Completed Questionnaires
    $http.get('/api/questionnaire_responses')
        .then(function(res) {
            // console.log(res.data);
            // console.log(typeof res.data[0].authored);
            vm.completed = res.data.reverse();
        });

    //* Calculate scores
    scoreAnswers.collection()
        .then(function(res) {
            var scoreArray = res.reverse();
            vm.completedTotals = [];
            vm.completedNorm = [];
            for (var i = 0; i < scoreArray.length; i++) {
                vm.completedTotals.push(scoreAnswers.total(scoreArray[i]));
                vm.completedNorm.push(scoreAnswers.normalize(scoreArray[i]));
            }
            console.log(vm.completedNorm);
        });
    
    /** JQUERY STUFFS **/
    jQuery(document).ready(function($) {
        $(".clickable-row").click(function() {
            window.document.location = $(this).data("#myModal");
        });
    });
    // Row link (make entire row link-able) src: http://www.jasny.net/bootstrap/javascript/#rowlink
    jQuery('tbody.rowlink').rowlink();
}

