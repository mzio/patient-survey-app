// public/scripts/angular/app.js

/* Top level Angular module */
'use strict';
angular.module('app', ['ui.router','ngRoute'])  // TODO: finish injecting all dependencies, see about webpack / non-script dependencies
    .factory('dbResource', ['$http', getResource])  // Include all universal providers here as well?
    .run(function($rootScope) {
        $rootScope.Utils = {
            keys: Object.keys   // Allows Object.keys in ng view
        };
    });



function getResource($http) {
    return {
        getResource: function(resourceType, id) {   // Get resource can return either a list of resources based on type or an individual resource
            if (!id) {
                return $http.get('/api/fhir_resources/'+resourceType);
            }
            return $http.get('/api/fhir_resources/'+resourceType+'/'+id);
        }
    };
}

window.addEventListener("beforeunload", function () {
    document.body.classList.add("animate-out");
});

