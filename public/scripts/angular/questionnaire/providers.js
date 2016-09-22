// public/scripts/questionnaire/providers.js
'use strict';
angular
    .module('app')
    .factory('setQuestionnaire', ['$http', '$q', setQuestionnaire]);

function setQuestionnaire($http, $q) {

    function parseResourceItems(jsonObj, myList) {
        for (var key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {
                if (key === 'item') {
                    for (var i = 0; i < jsonObj[key].length; i++) {
                        myList.push(jsonObj[key][i]);
                        setQuestionnaire().parseResourceItems(jsonObj[key][i], myList);
                    }
                }
            }
        }
        return myList;
    }

    function refineResource(resource) {
        var list = [];
        var unrefined = setQuestionnaire().parseResourceItems(resource, []);
        var index = 1;
        for (var i = 0; i < unrefined.length; i++) {
            var obj = {};
            obj.linkId = unrefined[i].linkId;
            obj.text = unrefined[i].text;
            obj.type = unrefined[i].type;
            if (typeof unrefined[i].options !== 'undefined') {  // Identifies questions
                obj.reference = unrefined[i].options.reference;
                obj.index = index + '.)'; // Adds numbering prefix to questions
                index++;
            }
            if (typeof unrefined[i].prefix !== 'undefined') {   // Identifies groups
                obj.prefix = unrefined[i].prefix;                // Requires having group labeled as "prefix" in question item
            }
            list.push(obj);
        }
        for (var j = 0; j < list.length; j++) {
            if (list[j].type === 'group') {
                list.splice(j, 1);
            }
        }
        return list;
    }
    
    function selectQuestions(resource) {    // Takes in a refinedResource list
        for (var i = 0; i < resource.length; i++) {
            if (resource[i].type === "display" || resource[i].type === "group") {
                resource.splice(i, 1);
            }
        }
        // console.log(resource);
        return resource;
    }

    function getValueSetPaths(resource) {
        var valueSets = [];
        for (var i = 0; i < resource.length; i++) {
            if (resource[i].type === 'choice') {
                var path = '/api/fhir_resources/' + resource[i].reference;
                valueSets.push(path);
            }
        }
        return valueSets;
    }

    function getValueSet(valueSetList) {
        var defer = $q.defer();
        var valueSetCalls = [];
        angular.forEach(valueSetList, function(valueSet) {
            // console.log(valueSet);
            var defer2 = $q.defer();
            $http.get(valueSet).then(function(res) {
                defer2.resolve(res.data);
            });
            valueSetCalls.push(defer2.promise);
            // valueSetCalls.push($http.get(valueSet));
        });
        $q.all(valueSetCalls)
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

    function getAnswerMap(questionnaire) {
        var defer = $q.defer();

        function updateObj(obj, dir, index) {
            var defer = $q.defer();
            obj.system = dir.system;
            if (typeof dir.filter !== 'undefined') {
                if (dir.filter[0].property === 'set' && dir.filter[0].op === '=') {
                    obj.filterCode = dir.filter[0].value;
                }
            }
            obj.index = index + 1;
            defer.resolve(obj);
            return defer.promise;
        }

        setQuestionnaire($http, $q)
            .getValueSet(setQuestionnaire().getValueSetPaths(setQuestionnaire().selectQuestions(setQuestionnaire().refineResource(questionnaire))))
            .then(function(res) {
                var valueSets = [];
                angular.forEach(res, function (item) {
                    var obj = {};
                    var dir = item.compose[0].include[0];
                    var defer1 = $q.defer();
                    updateObj(obj, dir, res.indexOf(item))
                        .then(function (res) {
                            defer1.resolve(res);
                        });
                    valueSets.push(defer1.promise);
                });
                $q.all(valueSets)
                    .then(
                        function(results) {
                            // console.log(results);
                            defer.resolve(results);
                        },
                        function(errors) {
                            defer.reject(errors);
                        },
                        function(updates) {
                            defer.update(updates);
                        }
                    );
            });
        return defer.promise;
    }
    
    function updateQuestionnaire(questionnaire) {
        var defer = $q.defer();

        // Gets answer choices from provided Code System resource based on ValueSet filter
        function getAnswerChoices(filter, codeSystem) {
            var choices = [];
            if (typeof codeSystem !== 'undefined') {
                var concept = codeSystem.concept;
                for (var i = 0; i < concept.length; i++) {
                    if (filter === concept[i].property[1].valueString) {
                        choices.push(concept[i]);
                    }
                }
            }
            return choices;
        }

        setQuestionnaire($http, $q)
            .getAnswerMap(questionnaire)
            .then(function(res) {
                var modQuestionnaire = setQuestionnaire().selectQuestions(setQuestionnaire().refineResource(questionnaire));
                angular.forEach(res, function(obj) {
                    $http.get('/api/fhir_resources/'+obj.system)
                        .then(function(resHTTP) {
                            modQuestionnaire[res.indexOf(obj)].reference = getAnswerChoices(obj.filterCode, resHTTP.data);
                        });
                });
                $q.all(modQuestionnaire)
                    .then(
                        function(results) {
                            defer.resolve(results);
                        },
                        function(errors) {
                            defer.reject(errors);
                        },
                        function(updates) {
                            defer.update(updates);
                        }
                    );
            });
        return defer.promise;
    }

    return {
        parseResourceItems: parseResourceItems, // Parse itemized FHIR resources: arg1 = resource (JSON object), arg2 = empty array; returns flattened resource
        refineResource: refineResource,         // Return flattened and refined resource: arg1 = resource (JSON object)
        selectQuestions: selectQuestions,
        getValueSetPaths: getValueSetPaths,     // Get ValueSet paths for $http requests
        getValueSet: getValueSet,               // Get an answer choice Value Set
        getAnswerMap: getAnswerMap,             // Create answer-choice map for one questionnaire
        updateQuestionnaire: updateQuestionnaire
    };
}