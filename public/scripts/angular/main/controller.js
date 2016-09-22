// path/scripts/angular/main/controller.js
'use strict';
angular
    .module('app')
    .controller('mainController', mainController);

function mainController() {
    // Can the entire controller be defined here? That'd be awesome!!!
    /* jshint validthis: true */
    var vm = this;
    vm.title = "Patient Engagement Web App";
    vm.version = "Inflammatory Bowel Disease v0.1.0";
    vm.fhirSupport = "STU3";
    vm.author = "Michael Zhang";
}


