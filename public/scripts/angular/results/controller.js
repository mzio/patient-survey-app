// path/scripts/angular/results/controller.js
'use strict';

angular
    .module('app')
    .controller('resultsController', ['$http', 'scoreAnswers', resultsController]);

function resultsController($http, scoreAnswers) {
    /* jshint validthis: true */
    var vm = this;
    
    // scoreAnswers.collection()
    //     .then(function(res) {
    //         vm.scoredCollection = res;
    //         vm.lastScore = res[res.length-1];
    //     });

    scoreAnswers.latest()
        .then(function(res) {
            vm.lastScore = res;
        });

    scoreAnswers.collection()
        .then(function(res) {
            var scoreArray = res.reverse();
            vm.completed = scoreArray;
            vm.completedTotals = [];
            vm.completedNorm = [];
            for (var i = 0; i < scoreArray.length; i++) {
                vm.completedTotals.push(scoreAnswers.total(scoreArray[i]));
                vm.completedNorm.push(scoreAnswers.normalize(scoreArray[i], true));
            }
            console.log(vm.completedNorm);
        });

    scoreAnswers.visualize();
}
