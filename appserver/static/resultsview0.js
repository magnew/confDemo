define([
        'underscore',
        'splunkjs/mvc/simplesplunkview',
    ],
    function(
        _,
        SimpleSplunkView
    ) {

    var ResultsViewer = SimpleSplunkView.extend({

        className: "splunk-toolkit-results-viewer",
        options : {
            "number" : 20,
        },
        output_mode: "json",

        createView: function() {
            return true;
        },

        formatData: function(data){
            console.log(data);

            return data;
        },

        updateView: function(viz, data) {
            
            this.$el.html('');
            this.$el.append(
                '<h5>Results (may be truncated)</h5>'+
                '<pre>' + JSON.stringify(data, undefined, 2) + '</pre>'
            );
        }
    });
    return ResultsViewer;
});