let fs = require('fs');
let ndjson = require('ndjson');
let geojsonArea = require('@mapbox/geojson-area');

if (!process.argv[2] || !process.argv[3]) {
  return console.error('Please provide input and output paths');
}

fs.createReadStream(process.argv[2])
  .pipe(ndjson.parse())
  .on('data', (item) => {
    item.properties.size = Math.ceil(geojsonArea.geometry(item.geometry) / 1000000); // convert meters to kilometers
  })
  .pipe(ndjson.serialize())
  .pipe(fs.createWriteStream(process.argv[3]))
