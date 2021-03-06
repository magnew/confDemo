require([
    'jquery',
    '../app/confDemo/resultsview2',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunkjs/mvc/simplexml/ready!'
],function($, ResultsView, SearchManager, SearchBar){
    
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