define([
        'underscore',
        'contrib/d3',
        'splunkjs/mvc/simplesplunkview',
        'splunkjs/mvc',
        'css!./css/multigraph.css'
    ],
    function(
        _,
        d3,
        SimpleSplunkView,
        mvc
    ) {

    var MultiGraph = SimpleSplunkView.extend({

        className: 'splunk-multigraph',

        options : {
            'layout' : 'grid',
        },

        output_mode: 'json',

        selectedLocations: [],

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

        initialize: function() { 
            SimpleSplunkView.prototype.initialize.apply(this, arguments);
            this.settings.on('change:layout', this.render, this);
        },

        createView: function() {
            this.$el.width(1200);
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
            var that = this;
            this.$el.empty();
            this.addControlsToEl(this.$el);
            var locations = data;
            var layout = this.settings.get('layout');
            var margin = {top: 8, right: 6, bottom: 2, left: 6},
                width = this.getWidthForLayout(layout) - margin.left - margin.right,
                height = this.getHeightForLayout(layout) - margin.top - margin.bottom;

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
                .range(this.quantizeColors);

            if (that.selectedLocations.length > 1) {
                var selection = _.filter(locations, function(loc){ return _.contains(that.selectedLocations, loc.key) });
                color.domain([_.min(_.pluck(selection, 'maxValue')), _.max(_.pluck(selection, 'maxValue'))]);
            }
            else {
                color.domain([_.min(_.pluck(locations, 'maxValue')), _.max(_.pluck(locations, 'maxValue'))]);
            }

            if (layout !== 'combine') {
                var svg = d3.select('.splunk-multigraph').selectAll('svg')
                  .data(locations)
                .enter().append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                  .attr('class', 'minigraph')
                .append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('class', layout === 'stack' ? 'center' : '')
                    .on('click', _.bind(this.graphClick, this))

                svg.append('path')
                    .attr('class', 'area')
                    .attr('d', function(d) {y.domain([-20, d.maxValue]); return area(d.values); })
                    .style('fill', function(d){
                        if (that.selectedLocations.length > 0 ) {
                            return _.contains(that.selectedLocations, d.key) ? color(d.maxValue) : 'gray'
                        }
                        else {
                            return color(d.maxValue)
                        }
                    })
                    .style('opacity', '0.3');

                svg.append('path')
                    .attr('class', 'line')
                    .attr('d', function(d) { y.domain([-20, d.maxValue]); return line(d.values); })
                    .style('stroke', function(d){ 
                        if (that.selectedLocations.length > 0 ) {
                            return _.contains(that.selectedLocations, d.key) ? color(d.maxValue) : 'gray'
                        }
                        else {
                            return color(d.maxValue)
                        }
                     });

                svg.append('text')
                    .attr('x', width - 6)
                    .attr('y', height - 6)
                    .style('text-anchor', 'end')
                    .text(function(d) { 
                        return d.key.replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function(str){ return str.toUpperCase(); }); 
                    });
            }
            else {
                 y.domain([valMin-3, valMax+3]);
                var svg = d3.select('.splunk-multigraph').append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                .append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

                var location = svg.selectAll('.location')
                  .data(locations)
                .enter().append('g')
                  .attr('class', 'location');

                location.append('path')
                    .attr('class', 'area')
                    .attr('d', function(d) { return area(d.values); })
                    .style('fill', function(d){ return color(d.maxValue) })
                    .style('opacity', '0.1');

                location.append('path')
                    .attr('class', 'line')
                    .attr('d', function(d) { return line(d.values); })
                    .style('stroke', function(d){ return color(d.maxValue) });
            }
        },

        graphClick: function(e) {
            if (_.contains(this.selectedLocations, e.key)) {
                this.selectedLocations = [];
            }
            this.selectedLocations.push(e.key);
            var filterStrings = _.map(this.selectedLocations, function(k){
                return 'source=*' + k + '*';
            });
            this.setPageToken('filter', filterStrings.join(' OR '));
            this.render();
        },

        setPageToken: function(key, value) {
            mvc.Components.getInstance('default').set(key, value);
            mvc.Components.getInstance('submitted').set(key, value);
        },

        getWidthForLayout: function(layout) {
            if (layout === 'grid') {
                return 300;
            } 
            else {
                return 1200;
            }  
        },

        getHeightForLayout: function(layout) {
            if (layout === 'combine') {
                return 250;
            } 
            else {
                return 80;
            }  
        },

        addControlsToEl: function(el){
            var that = this;
            el.append('<div id="controls"></div>');
            $('#controls').append('\
            <div class="btn-group">\
                <div id="grid-button" class="action" >\
                    <span class="icon-table"/>\
                </div>\
                <div id="stack-button" class="action" >\
                    <span class="icon-menu"/>\
                </div>\
                <div id="combine-button" class="action" >\
                    <span class="icon-chart-area"/>\
                </div>\
            </div>');

            $('#grid-button').on('click', function(){
                that.settings.set('layout', 'grid');
            });

            $('#stack-button').on('click', function(){
                that.settings.set('layout', 'stack');
            });

            $('#combine-button').on('click', function(){
                that.settings.set('layout', 'combine');
            });
        }
    });
    return MultiGraph;
});