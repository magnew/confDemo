require([
    'jquery',
    '../app/confDemo/resultsview1',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'
],function($, ResultsView, SearchManager){
    
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