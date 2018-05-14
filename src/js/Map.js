var Map = {
  dataService: window['Data'],
  overlay: document.getElementById('overlay'),

  height: 0,
  scale: 300,
  scaleMin: 1,
  scaleMax: 100,
  width: 0,

  loading: false,

  path: null,
  projection: null,
  svg: null,
  zoom: null,

  active: null,

  gCountries: null,
  gStates: null,
  gLabels: null,

  currentCountry: null,
  currentState: null,

  layerCountries: null,
  layerCountriesText: null,
  layerStates: null,
  layerStatesText: null,

  lambda: null,
  phi: null,

  is3D: false,
  lastX: 0,
  lastY: 0,
  origin: {
    x: 0,
    y: 0
  },

  init() {
    var is3D = window.location.search === '?3d=true';
    this.setupMap(is3D);
    this.setupData();
  },

  setupData() {
    var me = this;
    this.dataService.getCountries(function(data) {
      me.renderCountries();
      console.log('me.dataService', me.dataService);
      me.dataService.getStates();
    });
  },

  setupMap(is3D) {
    var me = this;
    var element = document.getElementById('chart');
    d3.select(element).select('*').remove();
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    this.active = d3.select(null);
    this.is3D = is3D;

    this.outputMessage();

    console.log('setupMap', element, element.offsetWidth, element.offsetHeight);

    if (this.is3D) {
      this.projection = d3.geoOrthographic()
        .scale(this.scale)
        .translate([this.width / 2, this.height / 2])
        .rotate([this.origin['x'], this.origin['y']])
        .center([0, 0])
        .clipAngle(90);
    } else {
      this.projection = d3.geoMercator()
        .scale(this.scale)
        .translate([this.width / 2, this.height / 2]);
    }

    this.path = d3.geoPath()
      .pointRadius(2)
      .projection(this.projection);

    this.zoom = d3
      .zoom()
      .scaleExtent([this.scaleMin, this.scaleMax])
      .on('zoom', function() {
        me.zoomed();
      });

    this.svg = d3.select(element).append('svg')
      .attr('class', 'map')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('click', function() {
        me.clickMap();
      }, true);

    this.svg.append('rect')
      .attr('class', 'sea')
      .on('click', function() {
        me.clickSea();
      });

    this.gCountries = this.svg.append('g');
    this.gStates = this.svg.append('g');
    this.gLabels = this.svg.append('g');
    this.svg.call(this.zoom);

    this.lambda = d3.scaleLinear()
      .domain([-this.width, this.width])
      .range([-180, 180]);

    this.phi = d3.scaleLinear()
      .domain([-this.height, this.height])
      .range([90, -90]);
  },

  renderCountries() {
    var me = this;
    if (this.layerCountries) {
      this.layerCountries.remove();
    }
    if (this.layerStates) {
      this.layerStates.remove();
    }
    // console.log('renderCountries', this.dataService.countriesList);
    this.layerCountries = this.gCountries.selectAll('path')
      .data(this.dataService.countriesList)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', 'country')
      .on('click', function(d) {
        me.clickCountry(d, d3.event.currentTarget);
      });
    if (this.layerCountriesText) {
      this.layerCountriesText.remove();
    }
    // if (this.layerStatesTextBgs) {
    //   this.layerStatesTextBgs.remove();
    // }
    if (this.layerStatesText) {
      this.layerStatesText.remove();
    }
    this.layerCountriesText = this.gLabels.selectAll('text')
      .data(this.dataService.countriesList)
      .enter()
      .append('text')
      .attr('class', 'country-label')
      .attr('transform', function(d) { return 'translate(' + me.path.centroid(d) + ')'; })
      .text(function(d) { return d.properties.name; });
  },

  renderStates(id) {
    var me = this;
    if (id) {
      this.dataService.selectState(id);
    }
    if (this.layerStates) {
      this.layerStates.remove();
    }
    // console.log('renderStates', id, this.dataService.statesSelected);
    this.layerStates = this.gStates.selectAll('path')
      .data(this.dataService.statesSelected)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', 'state')
      .style('fill', function(d) { return d3.interpolateYlGn(.6 - (d.properties.size / 2000000)); })
      .on('click', function(d) {
        me.clickState(d, d3.event.currentTarget);
      });

    if (this.layerStatesText) {
      this.layerStatesText.remove();
    }

    this.layerStatesText = this.gStates.selectAll('text')
      .data(this.dataService.statesSelected)
      .enter()
      .append('text')
      .attr('class', 'state-label')
      .attr('transform', function(d) { return 'translate(' + me.path.centroid(d) + ')'; })
      .text(function(d) { return me.convertNumber(me.dataService.states[d.properties.id].size) + ' km²'; });
  },

  outputMessage() {
    if (this.is3D) {
      this.overlay.innerHTML = '<p>Click a country</p><button onclick="window.location.search=\'\'">Switch to 2D mode</button>';
    } else {
      this.overlay.innerHTML = '<p>Click a country</p><button onclick="window.location.search=\'?3d=true\'">Switch to 3D mode</button>';
    }
  },

  convertNumber(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  clickCountry(d, element) {
    var me = this;
    if (this.active.node() === element) {
      return this.clickSea();
    }

    this.active.classed('active', false);
    this.active = d3.select(element).classed('active', true);
    this.active.raise();
    this.layerCountriesText.raise();

    var bounds = this.path.bounds(d);
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var scale = Math.max(this.scaleMin, Math.min(this.scaleMax, 0.5 / Math.max(dx / this.width, dy / this.height)));
    var translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
      .on('end', function() {
        me.currentCountry = me.dataService.countries[d.properties.id];
        me.currentState = null;
        me.renderStates(me.currentCountry['id']);
        me.overlay.innerHTML = '<p>' + (me.currentCountry.name || '') + ( ' (' + me.currentCountry.id + ')' || '') + '</p>';
      });
  },

  clickState(d, element) {
    var me = this;
    if (this.active.node() === element) {
      return this.clickSea();
    }
    // must not be loading
    if (this.loading) {
      return;
    }

    this.active.classed('active', false);
    this.active = d3.select(element).classed('active', true);
    this.active.raise();
    // this.layerStatesTextBgs.raise();
    this.layerStatesText.raise();

    var bounds = this.path.bounds(d);
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var scale = Math.max(this.scaleMin, Math.min(this.scaleMax, 0.5 / Math.max(dx / this.width, dy / this.height)));
    var translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
      .on('end', function() {
        if (!me.currentCountry) {
          var idArray = d.properties.id.split('-');
          me.currentCountry = me.dataService.countries[idArray[0]];
          me.currentState = null;
          me.renderStates(me.currentCountry['id']);
          me.overlay.innerHTML = '<p>' + (me.currentCountry.name || '') + ( ' (' + me.currentCountry.id + ')' || '') + '</p>';
        } else {
          me.currentState = me.dataService.states[d.properties.id];
          me.overlay.innerHTML = '<p>' + (me.currentCountry.name || '') + ( ' (' + me.currentCountry.id + ')' || '') + '</p><p>' + (me.currentState.name || '') + ( ' (' + me.currentState.id + ')' || '' ) + '</p>';
        }
      });
  },

  clickSea() {
    this.active.classed('active', false);
    this.active = d3.select(null);
    this.loading = false;
    if (this.currentState) {
      this.currentState = null;
      this.overlay.innerHTML = '<p>' + (this.currentCountry.name || '') + ( ' (' + this.currentCountry.id + ')' || '') + '</p>';
    } else if (this.currentCountry) {
      this.currentCountry = null;
      this.outputMessage();
    }
    if (!this.currentState && !this.currentCountry) {
      this.renderCountries();
      this.svg
        .transition()
        .duration(750)
        .call(this.zoom.transform, d3.zoomIdentity);
    }
  },

  clickMap() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  },

  zoomed() {
    var me = this;
    if (this.is3D) {
      var transform = d3.event.transform;
      var k = Math.sqrt(100 / this.projection.scale());
      var r = {
        x: this.lambda(transform.x),
        y: this.phi(transform.y)
      };
      if (d3.event.sourceEvent && d3.event.sourceEvent.wheelDelta) {
        this.projection.scale(this.scale * transform.k);
        transform.x = this.lastX;
        transform.y = this.lastY;
      } else {
        this.projection.rotate([this.origin['x'] + r.x, this.origin['y'] + r.y]);
        // this.projection.translate([this.origin['x'] + transform.x, this.origin['y'] + transform.y]);
        this.lastX = transform.x;
        this.lastY = transform.y;
      }
      this.gCountries.selectAll('path').attr('d', this.path);
      this.gLabels.selectAll('text')
        .attr('transform', function(d) { return 'translate(' + (me.path.centroid(d)[0] ? me.path.centroid(d) : '0,0') + ')'; });
    } else {
      // this.gCountries.style('stroke-width', .5 / d3.event.transform.k + 'px');
      this.gCountries.attr('transform', d3.event.transform);
      this.gStates.style('font-size', 3 / (.66 + (d3.event.transform.k / 3)) + 'rem');
      // this.gStates.style('stroke-width', .5 / d3.event.transform.k + 'px');
      this.gStates.attr('transform', d3.event.transform);
      this.gLabels.style('font-size', 1 / (.66 + (d3.event.transform.k / 3)) + 'rem');
      this.gLabels.attr('transform', d3.event.transform);
    }
  }
}
