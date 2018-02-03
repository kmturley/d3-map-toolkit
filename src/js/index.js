/* map */

var folder = window.location.hash ? window.location.hash.slice(1) : 'countries',
  width = window.innerWidth,
  height = window.innerHeight,
  active = d3.select(null),
  scaleMin = 1,
  scaleMax = 10,
  overlay = document.getElementById('overlay');

var projection = d3.geoMercator()
  .scale(200)
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);

var zoom = d3
  .zoom()
  .scaleExtent([scaleMin, scaleMax])
  .on("zoom", zoomed);

var svg = d3
  .select("body")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height)
  .on("click", stopped, true);

svg
  .append("rect")
  .attr("class", "sea")
  .attr("width", width)
  .attr("height", height)
  .on("click", reset);

var g = svg.append("g");
svg.call(zoom);

d3.json("json/" + folder + "/6.toposimplify.json", function(error, map) {
  if (error) throw error;
  g
    .selectAll("path")
    .data(topojson.feature(map, map.objects.layer).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "feature")
    .on("click", clicked);
  g.style("stroke-width", ".5");
});

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale = Math.max(scaleMin, Math.min(scaleMax, 0.9 / Math.max(dx / width, dy / height))),
    translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg
    .transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

  overlay.innerHTML = (d.properties.name || '') + ( ' (' + d.id + ')' || '');
  console.log('clicked', d.id, d.properties.name);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);
  svg
    .transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
    overlay.innerHTML = 'Click a country';
}

function zoomed() {
  g.style("stroke-width", 0.5 / d3.event.transform.k + "px");
  g.attr("transform", d3.event.transform);
}

function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}
