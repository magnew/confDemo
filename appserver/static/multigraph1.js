define([
        'underscore',
        'contrib/d3',
        'splunkjs/mvc/simplesplunkview',
        'css!./css/multigraph.css'
    ],
    function(
        _,
        d3,
        SimpleSplunkView
    ) {

    var MultiGraph = SimpleSplunkView.extend({

        className: 'splunk-multigraph',

        output_mode: 'json',

        quantizeColors: ['rgb(33, 102, 172)',
            'rgb(67, 147, 195)',
            'rgb(146, 197, 222)',
            'rgb(209, 229, 240)',
            'rgb(247, 247, 247)',
            'rgb(253, 219, 199)',
            'rgb(244, 165, 130)',
            'rgb(214, 96, 77)',
            'rgb(178, 24, 43)'
        ],

        createView: function() {
            return true;
        },

        formatData: function(data){

            var extractName = function(source) {
                return source.split('/').pop().split('.')[0]
            }

            var parseDate = function(timestamp) {
                var date = timestamp.split('T')[0];
                return d3.time.format('%Y-%m-%d').parse(date);
            }
            
            var filtered = _.map(data, function(d){
                var whitelist = _.filter(_.keys(d), function(key){
                    return key === '_time' || key[0] !== '_';
                });
                return _.pick(d, whitelist)
            });

            var locations = {};
            _.each(filtered, function(d){
                _.each(_.keys(d), function(key){
                    if(key !== '_time'){
                        if(!_.contains(_.keys(locations), key)){
                            locations[key] = [];
                        }
                        locations[key].push({
                            time: parseDate(d['_time']),
                            value: parseFloat(d[key]),
                            key: extractName(key)
                        });
                    }
                });

            });

            var formattedData = _.map(locations, function(value, key){
                return {
                    key: extractName(key),
                    values: value
                }
            });

            return formattedData;
        },

        updateView: function(viz, data) {
            this.$el.empty();            
            var locations = data;
            var margin = {top: 8, right: 6, bottom: 2, left: 6},
                width = 300 - margin.left - margin.right,
                height = 80 - margin.top - margin.bottom;

            // Add min and max values
            locations.forEach(function(l) {
                l.maxValue = d3.max(l.values, function(d) { return d.value; });
                l.minValue = d3.min(l.values, function(d) { return d.value; });
            });

            var timeMin = d3.min(locations, function(s) { return s.values[0].time; });
            var timeMax = d3.max(locations, function(s) { return s.values[s.values.length - 1].time; });
            
            var valMin = d3.min(locations, function(l) { return l.minValue; })
            var valMax = d3.max(locations, function(l) { return l.maxValue; })


            var x = d3.time.scale()
                .range([0, width])
                .domain([timeMin, timeMax]);

            var y = d3.scale.linear()
                .range([height, 0]);
            
            var area = d3.svg.area()
                .x(function(d) { return x(d.time); })
                .y0(height)
                .y1(function(d) { return y(d.value); });

            var line = d3.svg.line()
                .x(function(d) { return x(d.time); })
                .y(function(d) { return y(d.value); });

            var color = d3.scale.quantize()
                .range(this.quantizeColors)
                .domain([_.min(_.pluck(locations, 'maxValue')), _.max(_.pluck(locations, 'maxValue'))]);

            // Add an SVG element for each symbol, with the desired dimensions and margin.
            var svg = d3.select('#hook').selectAll('svg')
              .data(locations)
            .enter().append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
            .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Add the area path elements. Note: the y-domain is set per element.
            svg.append('path')
                .attr('class', 'area')
                .attr('d', function(d) {y.domain([-20, d.maxValue]); return area(d.values); })
                .style('fill', function(d){ return color(d.maxValue) })
                .style('opacity', '0.3');

            // Add the line path elements. Note: the y-domain is set per element.
            svg.append('path')
                .attr('class', 'line')
                .attr('d', function(d) { y.domain([-20, d.maxValue]); return line(d.values); })
                .style('stroke', function(d){ return color(d.maxValue) });

            // Add a small label for the symbol name.
            svg.append('text')
                .attr('x', width - 6)
                .attr('y', height - 6)
                .style('text-anchor', 'end')
                .text(function(d) { 
                    return d.key.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, function(str){ return str.toUpperCase(); }); 
                });
        }
    });
    return MultiGraph;
});