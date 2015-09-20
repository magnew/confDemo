require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'underscore',
    'app/confDemo/resultsview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, _, ResultsView, SearchManager, SearchBar, utils){
    
    var mainSearch = new SearchManager({
        'id': 'mainSearch',
        'search': 'index=cityweather'
    });

    var mainSearchBar = new SearchBar({
        'id': 'mainSearchBar',
        'managerid': 'mainSearch',
        el: $('#bar')
    }).render();

    mainSearchBar.on('change', function() { 
        mainSearch.set('search', mainSearchBar.val());
    });

    var resultsview = new ResultsView({
        'id': 'resultsview',
        'managerid': 'mainSearch',
        'el': $('#hook')
    });

});