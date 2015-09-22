require([
    'jquery',
    '../app/confDemo/simpleviz1',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunkjs/mvc/simplexml/ready!'
],function($, SimpleViz, SearchManager, SearchBar){
    
    var mainSearch = new SearchManager({
        'id': 'mainSearch',
        'search': 'index=cityweather | stats avg("Mean TemperatureF") by source'
    });

    var simpleviz = new SimpleViz({
        'id': 'simpleviz',
        'managerid': 'mainSearch',
        'el': $('#hook')
    });

});