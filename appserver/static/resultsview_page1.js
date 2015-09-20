require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'app/confDemo/resultsview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, ResultsView, SearchManager, utils){
    
    var mainSearch = new SearchManager({
        'id': 'mainSearch',
        'search': 'index=cityweather'
    });

    var resultsview = new ResultsView({
        'id': 'resultsview',
        'managerid': 'mainSearch',
        'el': $('#hook')
    });

});