require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'app/confDemo/multigraph',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, MultiGraph, SearchManager, utils){

    var mainSearch = new SearchManager({
        'id': 'mainSearch',
        'search': 'index=cityweather | timechart span=1w avg("Mean TemperatureF") by source'
    });

    var graphViz = new MultiGraph({
        'id': 'graphViz',
        'managerid': 'mainSearch',
        'el': $('#hook')
    });

});