// public/scripts/angular/medicationTrack/controller.js

// App currently only supports IBD tracking

'use strict';
angular
    .module('app')
    .controller('medicationTrackController', ['dbResource', 'setQuestionnaire', 'setMedicationList', 
        'myMedications','$http', '$state', medicationTrack]);

function medicationTrack(dbResource, setQuestionnaire, setMedicationList, myMedications, $http, $state) {
    /* jshint validthis: true */
    var vm = this;
    
    vm.formlyModel = {};
    
    vm.generalModel = {};
    vm.specificModel = {};
    vm.updateModel = function() {
        console.log(vm.generalModel);
    };

    /** DATA MODEL GENERATION **/
    // Medication List Generation
    vm.medicationList = [];
    vm.generateMedList = function() {
        for (var key in vm.specificModel) {
            if (vm.specificModel[key] === true) {
                getMedication(key);
            }
        }
    };

    // FHIR List Resources (Medication List)
    var current = new Date();
    var date = current.getFullYear()+'-'+(current.getMonth()+1)+'-'+current.getDate()+'_'+
        current.getHours()+':'+current.getMinutes()+':'+current.getSeconds();
    var fhirMedListBase = {
        resourceType: 'List',
        id: 'patient-medlist-IBD_'+current,
        status: 'current',
        mode: 'working',
        title: 'Patient Medication List on '+date,
        code: {
            coding: [
                {
                    system: 'http://hl7.org/fhir/2016May/codesystem-list-example-codes.html',
                    code: 'medications',
                    display: 'Medication List'
                }
            ],
            text: 'A list of medication statements for the patient.'
        },
        date: Date(),
        entry: []  // Enter dynamic resource concepts here
    };

   

    
    /** API POST TO SERVER **/
    // Saving the medication list and clearing everything else
    // > Messed up computer stuff prevents Angular from completing the post request...
    vm.saveList = function() {
        document.getElementById('updateMedForm').reset();
        var patientMedList = {
            schemaType: 'patient_medlist',
            patientId: 'Michael_Test',
            list: []};
        patientMedList.list = vm.medicationList;
        // console.log(patientMedList);
        $http.post('/api/fhir_medlists', vm.fhirMedicationList)
            .then(function(res) {
                console.log(vm.fhirMedicationList);
            });
        $http.post('/api/patient_medlists', patientMedList)
            .then(function(res) {
                vm.patientMedicationList = res.data;
                console.log(patientMedList);
                console.log(vm.patientMedicationList);
                vm.medicationList.length = 0;
            },function(err) {
                console.log("Error: Could not post "+err.data);
            });
    };
    
    // Update MyMeds dom whenever the div (class="tab-content") gets visited
    vm.myMedsUpdate = function() {
        // $state.reload();
        // Commented out would ideally be implemented but things are weird now
        // $http.get('/api/patient_medlists')
        //     .then(function(res) {
        //         vm.myMeds = res.data;
        //         console.log(vm.myMeds);
        //     });
    };

    // Ahh the medication toggle is killer <-- could work, but there's going to be a bug!
    function getMedication(code) {
        for (var i = 0; i < vm.sublist.length; i++) {
            for (var j = 0; j < vm.sublist[i].subMeds.length; j++) {
                if (vm.sublist[i].subMeds[j].code === code) {
                    vm.medicationList.push(vm.sublist[i].subMeds[j]);
                }
                // else if (vm.medicationList.includes(vm.sublist[i].subMeds[j])) {
                //     var index = vm.medicationList.indexOf(vm.sublist[i].subMeds[j]);
                //     vm.medicationList.splice(index, 1);
                // }
                //* More toggle submit on or off attempts
                // vm.buttonDisable = function() {
                //     return ()
                // }
                // vm.disabled = true;
                // vm.checkDisabled = function() {
                //     for (var key in vm.specificModel) {
                //         if (vm.specificModel[key] === true) {
                //             vm.disabled = false;
                //         }
                //     }
                //     console.log(vm.disabled);
                // };
            }
        }
    }

    /** API RESOURCE REQUESTS **/
    dbResource.getResource('Questionnaire', 'questionn_medtrack-IBD')
        .success(function(res) {   // change to .then(function(res) { .... }); once I figure out about the failure part
            console.log(res.title);
            vm.title = res.title;
            vm.description = setQuestionnaire.refineResource(res, [])[0].text;
            vm.prompt = setQuestionnaire.refineResource(res, [])[1].text;
        })
        .error(function(data) {
                console.log('Error: ', data);
        });

    dbResource.getResource('ValueSet', 'medlist-general-IBD')
        .success(function(res) {
            console.log(res.compose[0].include[0].concept);
            vm.list = res.compose[0].include[0].concept;
            // console.log(vm.list);
            // var submedSchema = setMedicationList.getListSchema(res);
            // console.log(submedSchema);
            //
            // setMedicationList.updateSchema(res)
            //     .then(function(res) {
            //         console.log(res);
            //     });
            //
            // // angular.forEach(submedSchema, function(submed) {
            // //     setMedicationList.updateSubmeds(submed)
            // //         .then(function(res) {
            // //             // console.log(res);
            // //             submedSchema.subMeds.push(res);
            // //         });
            // // });
            //
            // // for (var i = 0; i < submedSchema.length; i++) {
            // //     // submedSchema[i].subMeds
            // //
            // // }
            setMedicationList.setResources(res)
                .then(function (res) {
                    console.log(res);
                    vm.sublist = res;
                    vm.formlyFields = setMedicationList.formatForm(res);

                    $http.get('/api/patient_medlists')
                        .then(function(res) {
                            vm.myMeds = res.data;
                            console.log(vm.myMeds);

                            for (var i = 0; i < res.data[0].list.list.length; i++) {
                                console.log(res.data[0].list.list[i]);
                                var fhirEntry = {
                                    date: Date(),
                                    item: {
                                        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                                        version: '2016-01-04',
                                        concept: [
                                            {
                                                code: '',
                                                display: '',
                                                designation: [
                                                    {
                                                        use: {
                                                            system: 'http://snomed.info/sct',
                                                            code: '900000000000013009',
                                                            display: 'RxNorm Name'
                                                        },
                                                        text: ''
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                };
                                console.log(vm.sublist);
                                for (var j = 0; j < vm.sublist.length; j++) {
                                    console.log(vm.sublist[j]);
                                    for (var k = 0; k < vm.sublist[j].subMeds.length; k++) {
                                        console.log(vm.sublist[j].subMeds[k].code);
                                        console.log(res.data[0].list.list[i].code);
                                        if (vm.sublist[j].subMeds[k].code === res.data[0].list.list[i].code) {
                                            fhirEntry.item.concept[0].code = vm.sublist[j].subMeds[k].code;
                                            fhirEntry.item.concept[0].display = vm.sublist[j].subMeds[k].display;
                                            fhirEntry.item.concept[0].designation[0].text = vm.sublist[j].subMeds[k].text;
                                        }
                                    }
                                }
                                fhirMedListBase.entry.push(fhirEntry);
                            }
                            console.log(fhirMedListBase);
                            vm.fhirMedicationList = fhirMedListBase;
                            console.log(vm.fhirMedicationList);

                            /** Medication History + FHIR Resources **/
                            $http.get('/api/fhir_medlists')
                                .then(function(res) {
                                    // console.log(res.data);
                                    // console.log(typeof res.data[0].authored);
                                    vm.history = res.data;
                                    console.log(vm.history);
                                    //console.log(vm.completed[0].questionnaire.display);
                                });
                        });
                });
        })
        .error(function(data) {
            console.log('Error: ', data);
        });

    //* Getting the patient medication list when the page first loads
    // myMedications.getBase()
    //     .then(function(res) {
    //         vm.myMeds = res;
    //     });




    /** JQUERY STYLING **/ // idc if I'm breaking the view model separation rules
    $(function(){
        // Tab activation and navigation
        $('#changetabbutton').click(function(e){
            e.preventDefault();
            $('#mytabs a[href="#myMeds"]').tab('show');
        });
        // Generate FHIR toggle show/hide <-- doesn't work now
        var getFHIR = $('#lightFHIR');
        $("#FHIRmatch").on('click', function(e){
            e.stopPropagation();
            getFHIR.toggle();
        });
    });
}


