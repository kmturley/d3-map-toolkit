var Data = {
  countries: {},
  countriesList: [],
  states: {},
  statesList: [],
  statesSelected: [],

  getCountries(cb) {
    var me = this;
    return this.getFeed('countries', this.countries, function(items) {
      me.countriesList = items;
      if (cb) { cb(items); }
    });
  },

  getStates(cb) {
    var me = this;
    return this.getFeed('states', this.states, function(items) {
      me.statesList = items;
      if (cb) { cb(items); }
    });
  },

  getFeed(type, object, cb) {
    return d3.json(`json/${type}/6.toposimplify.json`, function(data) {
      var items = topojson.feature(data, data.objects.layer).features;
      items.forEach(function(item) {
        object[item.properties.id] = item.properties;
      });
      if (cb) { cb(items); }
    });
  },

  selectState(id) {
    var shortlist = this.statesList.filter(function(feature) {
      return feature.properties.id.startsWith(id);
    });
    this.statesSelected = this.statesSelected.concat(shortlist);
  },
}