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

            data = _.map(data, function(d){                
                return {
                    key: d.source.split('/').pop().split('.')[0],
                    value: d["avg(Mean TemperatureF)"]
                }
            });

            return data;
        },

        updateView: function(viz, data) {
            this.$el.html('');
            _.each(data, function(d){
                this.$el.append(
                    '<div style="height:'+ d.value * 2 +'px; width:100px; margin:5px; background:lightgray; display:inline-block; vertical-align: bottom;"><p style="margin: 3px; postion: absolute; bottom: 3px;">' 
                    + d.key + '</p></div>'
                );
            }, this);
        }
    });
    return SimpleViz;
});