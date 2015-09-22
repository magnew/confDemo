define([
        'underscore',
        'splunkjs/mvc/simplesplunkview',
    ],
    function(
        _,
        SimpleSplunkView
    ) {

    var SimpleViz = SimpleSplunkView.extend({

        className: "splunk-toolkit-results-viewer",
        output_mode: "json",

        createView: function() {
            return true;
        },

        formatData: function(data){
            var number = 10;

            if (data.length > number) {
                data = _.first(data, parseInt(number));
            }
            return data;
        },

        updateView: function(viz, data) {
            
            this.$el.html('');
            this.$el.append(
                '<pre>' + JSON.stringify(data, undefined, 2) + '</pre>'
            );
        }
    });
    return SimpleViz;
});