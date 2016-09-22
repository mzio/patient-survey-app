// public/scripts/medicationTrack/factory.mymeds.js
'use strict';
angular
    .module('app')
    .factory('myMedications', ['$http', myMedications]);

function myMedications($http) {

    /* Getting the medication list */
    function getBase() {
        $http.get('/api/patient_medlists')
            .then(function(res) {
                return res.data;
            });
    }
    
    return {
        getBase: getBase
    };
}