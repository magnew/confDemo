require([
    'jquery',
    '../app/confDemo/simpleviz0',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunkjs/mvc/simplexml/ready!'
],function($, SimpleViz, SearchManager, SearchBar){
    
    var mainSearch = new SearchManager({
        'id': 'mainSearch',
        'search': 'index=cityweather | stats avg("Mean TemperatureF") by source'
    });

    var mainSearchBar = new SearchBar({
        'id': 'mainSearchBar',
        'managerid': 'mainSearch',
        el: $('#bar')
    }).render();

    mainSearchBar.on('change', function() { 
        mainSearch.set('search', mainSearchBar.val());
    });

    var simpleviz = new SimpleViz({
        'id': 'simpleviz',
        'managerid': 'mainSearch',
        'el': $('#hook')
    });

});