// public/scripts/medicationTrack/providers.js

'use strict';
angular
    .module('app')
    .factory('setMedicationList', ['$http', '$q', setMedicationList]);

function setMedicationList($http, $q) {

    /* Getting the medication list */
    function setSchema(code, submedlist) {
        var defer = $q.defer();
        $http.get('api/fhir_resources/ValueSet/medication_lists/IBD/RxCUI?code=' + code)
            .then(
                function(res) {
                    angular.forEach(res.data[0].compose[0].include[0].concept, function (obj) {
                        // var defer1 = $q.defer();
                        var data = {"code": obj.code, "display": obj.display, "text": obj.designation[0].text};
                        // defer1.resolve(data);
                        //console.log(submedlist);
                        submedlist.subMeds.push(data);
                    });
                    $q.all(submedlist)
                        .then(
                            function(res) {
                                // console.log(res);
                                defer.resolve(res);
                            },
                            function(error) {
                                defer.reject(error);
                            },
                            function(updates) {
                                defer.update(updates);
                            });
                }
            );
        // console.log(defer.promise);
        return defer.promise;
    }

    function setResources(data) {
        var defer = $q.defer();
        var submedlistSet = [];
        angular.forEach(data.compose[0].include[0].concept, function(object) {
            var defer2 = $q.defer();
            var submedlist = {"generalCode": object.code, "generalText": object.display, "subMeds": []};

            setMedicationList($http, $q).setSchema(object.code, submedlist)
                .then(function(res) {
                    // console.log(res);
                    defer2.resolve(res);
                });
            // console.log(defer2.promise);
            submedlistSet.push(defer2.promise);
        });
        $q.all(submedlistSet)
            .then(
                function(res) {
                    // console.log(res);
                    defer.resolve(res);
                },
                function(error) {
                    defer.reject(error);
                },
                function(updates) {
                    defer.update(updates);
                }
            );
        return defer.promise;
    }


    /* Field formatting for Angular Formly */
    // v1: Takes in the returned setResources object array
    function formatForm(resourceArray) {
        var generalTextSet = [];
        var specificSet = [];
        for (var i = 0; i < resourceArray.length; i++) {
            generalTextSet.push(resourceArray[i]);
            var specField = {
                key: resourceArray[i].generalCode,
                type: 'multiCheckbox',
                templateOptions: {
                    label: resourceArray[i].generalText,
                    options: resourceArray[i].subMeds,
                    valueProp: 'code',
                    labelProp: 'display'
                },
                "hideExpression": "model.general-selection == 5"
                // hideExpression: '1 != 0'
            };
            specificSet.push(specField);
        }
        var form = [
            {
                key: 'general-selection',
                type: 'multiCheckbox',
                templateOptions: {
                    label: 'Please select all general medications that you are currently taking.',
                    options: generalTextSet,
                    valueProp: 'generalCode',
                    labelProp: 'generalText'
                }
            }
        ];
        for (var i = 0; i < resourceArray.length; i++) {
            form.push(specificSet[i]);
        }
        return form;
    }
    // v2: Generates form directly from API data
    function formatFormAPI(data) {
        
    }

    // These aren't relevant
    function getListSchema(data) {
        var submedlistSet = [];
        angular.forEach(data.compose[0].include[0].concept, function (object) {
            var submedlist = {"genMedCode": object.code, "subMeds": []};
            submedlistSet.push(submedlist);
        });
        return submedlistSet;
    }

    function updateSubmeds(listSchemaObject) {
        var defer = $q.defer();
        $http.get('api/fhir_resources/ValueSet/medication_lists/IBD/RxCUI?code=' + listSchemaObject.genMedCode)
            .then(function (res) {
                var submedCalls = [];
                angular.forEach(res.data[0].compose[0].include[0].concept, function (obj) {
                    var defer1 = $q.defer();
                    var data = {"code": obj.code, "display": obj.display, "text": obj.designation[0].text};
                    defer1.resolve(data);
                    submedCalls.push(defer1.promise);
                });
                $q.all(submedCalls)
                    .then(
                        function (results) {
                            defer.resolve(results);
                        },
                        function (errors) {
                            defer.reject(errors);
                        },
                        function (updates) {
                            defer.update(updates);
                        }
                    );
            });
        //console.log(defer.promise);
        return defer.promise;
    }

    function updateSchema(data) {
        var defer = $q.defer();
        var submedSchema = setMedicationList($q).getListSchema(data);
        angular.forEach(submedSchema, function(submed) {
            setMedicationList($http, $q).updateSubmeds(submed)
                .then(function(res) {
                    // console.log(res);
                    // console.log(submedSchema[0].subMeds);
                    submedSchema[0].subMeds.push(res);
                });
        });
        $q.all(submedSchema)
            .then(
                function (results) {
                    defer.resolve(results);
                },
                function (errors) {
                    defer.reject(errors);
                },
                function (updates) {
                    defer.update(updates);
                }
            );
        return defer.promise;
    }


    return {
        setSchema: setSchema,
        setResources: setResources,
        formatForm: formatForm
        // getListSchema: getListSchema,
        // updateSubmeds: updateSubmeds,
        // updateSchema: updateSchema
    };
}