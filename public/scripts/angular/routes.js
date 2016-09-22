// public/scripts/angular/routes.js
angular.module('app')
    .config(['$stateProvider', '$locationProvider',  function($stateProvider, $locationProvider) {
        'use strict';
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'scripts/angular/main/template.home.html',
                controller: 'mainController as main'
            })
            .state('questionnaireSet', {
                url: '/surveys',
                templateUrl: 'scripts/angular/questionnaireSet/template.html',
                controller: 'questionnaireSetController as questionnaireSet'
            })
            .state('questionnaire', {
                url:'/questionnaireSet/:id',
                templateUrl: 'scripts/angular/questionnaire/template.html',
                controller: 'questionnaireController as questionnaire'
            })
            .state('medicationTrack', {
                url: '/medication-tracking',
                templateUrl: 'scripts/angular/medicationTrack/template.html',
                controller: 'medicationTrackController as medicationTrack'
            })
            .state('results', {
                url: '/results',
                templateUrl: 'scripts/angular/results/template.html',
                controller: 'resultsController as results'
            })
            .state('questionnaireInput', {
                url: '/questionnaire-input',
                templateUrl: 'scripts/angular/main/template.home.html',
                controller: 'mainController as main'
        });
        $locationProvider.html5Mode(true);
    }]);