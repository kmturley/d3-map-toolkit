/* map */

var folder = window.location.hash ? window.location.hash.slice(1) : 'countries',
  width = window.innerWidth,
  height = window.innerHeight,
  scale = -2,
  svg = d3.select("svg"),
  path = d3.geoPath(),
  g = svg.append("g"),
  zoom = d3.zoom();

g.attr('class', 'layerGroup');
svg.call(zoom);
zoom.on("zoom", zoomed);
zoom.scaleExtent([1, 50]);

d3.json("json/" + folder + "/6.toposimplify.json", function(error, us) {
  var layer = g.selectAll('path')
    .data(topojson.feature(us, us.objects.layer).features)
    .enter()
    .append('path')
    .attr('class', 'layer')
    .attr('d', path)
    .attr("transform", "scale(" + Math.abs(scale) + ", " + scale + ") translate(" + (width/2)/Math.abs(scale) + "," + (height/2)/scale + ")");
});

function zoomed() {
  // g.style("stroke-width", 0.025 + ((.5 - (d3.event.transform.k/100)) / 10) + "px");
  g.attr('transform', d3.event.transform);
}