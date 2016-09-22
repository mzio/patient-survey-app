// public/scripts/medicationTrack/factory.score.js
'use strict';


angular
    .module('app')
    .factory('scoreAnswers', ['$http','$q', scoreAnswers]);

function scoreAnswers($http, $q) {

    //* Returns set of scored results reflecting the entire Questionnaire Response collection
    function collection() {
        var qDefer = $q.defer(); // THIS ASYNC THO (better be worth it...)
        $http.get('/api/questionnaire_responses')
            .then(function(res) {
                var data = res.data;
                var qResultSet = [];
                for (var i = 0; i < data.length; i++) { // Parse through collection
                    var questionnaire = {};
                    var qResult = {bowl:0, systemic:0, emotion: 0, social:0,
                        n_bowl:0, n_systemic:0, n_emotion: 0, n_social:0, authored:data[i].authored};
                    for (var j = 0; j < data[i].item.length; j++) { // Start parsing through individual questionnaire responses
                        var category = data[i].item[j].subject.display;
                        var value = data[i].item[j].answer[0].valueInteger;

                        var dataObj = {};           // Pair category with value
                        dataObj[category] = value;  // &
                        questionnaire[j] = dataObj; // Populate questionnaire with new pairs

                        //* Set summed values for each category in qResult result object
                        if (questionnaire[j].hasOwnProperty('bowel')) {
                            qResult.bowl += questionnaire[j]['bowel'];
                            qResult.n_bowl++;
                        }
                        else if (questionnaire[j].hasOwnProperty('systemic')) {
                            qResult.systemic += questionnaire[j]['systemic'];
                            qResult.n_systemic++;
                        }
                        else if (questionnaire[j].hasOwnProperty('emotion')) {
                            qResult.emotion += questionnaire[j]['emotion'];
                            qResult.n_emotion++;
                        }
                        else if (questionnaire[j].hasOwnProperty('social')) {
                            qResult.social += questionnaire[j]['social'];
                            qResult.n_social++;
                        }
                    }   // Finish parsing through individual questionnaire responses
                    qResultSet.push(qResult);   // Insert summed results in a set representing all stored questionnaire responses
                }
                qDefer.resolve(qResultSet);
            });
        return qDefer.promise;
    }

    //* Returns the score of the latest questionnaire response in the database (the last one in the db)
    function latest() {
        var defer = $q.defer();
        scoreAnswers($http, $q).collection()
            .then(function(res) {
            defer.resolve(res[res.length-1]);
        });
        return defer.promise;
    }

    // Sum category values to produce total SIBDQ score
    // > Takes an individual non-summed scored result as a parameter
    function total(scoredResponse) {
        return scoredResponse.bowl+scoredResponse.systemic+scoredResponse.emotion+scoredResponse.social;
    }
    
    // Normalize category values (category value / # category questions)
    // > Takes an individual non-normalized scored result as 1st parameter
    // > Includes time identification if 2nd parameter included
    function normalize(scoredResponse, time=false) {
        var scored = {};
        scored.bowl = scoredResponse.bowl/scoredResponse.n_bowl;
        scored.systemic = scoredResponse.systemic/scoredResponse.n_systemic;
        scored.emotion = scoredResponse.emotion/scoredResponse.n_emotion;
        scored.social = scoredResponse.social/scoredResponse.n_social;
        if (time) {
            scored.authored = scoredResponse.authored;
        }
        return scored;
    }

    // Visualize results
    // > Takes in collection of normalized survey answers as a parameter
    function visualize() {
        var vis = d3.select('div.vis');
        vis.html("Hello World!");

        /* Random D3.js Network Visualization Practice */
        function Network() {
            var width = 960;
            var height = 800;
            function network(selection, data) {
                // Main implementation
            }
            // Performs bulk of work to setup visualization based on layout/sort/filter
            // Called every time a param changes and network needs to be reset
            function update() {
                // Private function

                // Filter data to show based on current filter settings
                var curNodesData = filterNodes(allData.nodes);
                var curLinksData = filterLinks(allData.links, curNodesData);
                
                // Sort nodes based on current sort + update centers for radial layout
                if (layout == 'radial') {
                    var artists = sortedArtists(curNodesData, curLinksData);
                    updateCenters(artists);
                }
                
                // Reset nodes in force layout
                force.nodes(curNodesData);

                // Enter / exit for nodes
                updateNodes();

                // Always show links in force layout
                if (layout == 'force') {
                    force.links(curLinksData);
                    updateLinks();
                }
                else {
                    // Reset links so they don't interfere w/ other layouts.
                    // updateLinks() is called when force is done animating
                    force.links([]);
                    // If present, remove from svg
                    if (link) {
                        link.data([]).exit().remove();
                        link = null;
                    }
                }

                // Start the force
                force.start();

            }

            // Enter / exit display for nodes
            function updateNodes() {
                var node = nodesG.selectAll('circle.node')
                    .data(curNodesData, function(d) {
                        return d.id;
                    });
                node.enter().append('circle')
                    .attr('class', 'node')
                    .attr('cx', function(d) {return d.x})
                    .attr('cy', function(d) {return d.y})
                    .attr('r',  function(d) {return d.radius})
                    .style('fill',   function(d) {return nodeColors(d.artist)})
                    .style('stroke', function(d) {return strokeFor(d)})
                    .style('stroke-width', 1.0);
                node.on('mouseover', showDetails)
                    .on('mouseout', hideDetails);
                node.exit().remove();
            }

            // Enter / exit display for nodes
            function updateLinks() {
                var link = linksG.selectAll('line.link')
                    .data(curLinksData, function(d) {
                        return `${d.source.id}_${d.target.id}`;
                    });
                link.enter().append('line')
                    .attr('class', 'link')
                    .attr('stroke', '#ddd')
                    .attr('stroke-opacity', 0.8)
                    .attr('x1', function(d) {return d.source.x})
                    .attr('y1', function(d) {return d.source.y})
                    .attr('x2', function(d) {return d.target.x})
                    .attr('y2', function(d) {return d.target.y});
                link.exit().remove();
            }

            network.toggleLayout = function(newLayout) {
                // Public function
            };
            return network;
        }

        var myNetwork = Network();
        d3.json('data/songs.json', function(json) {
            myNetwork('#vis', json);
        });
    }


    return {
        collection: collection,
        latest: latest,
        total: total,
        normalize: normalize,
        visualize: visualize
    };
}
