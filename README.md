# Maps

Example using the following tools:
* Natural Earth Data
* D3


# Installation

Install dependencies

  npm install

Download map data:

  npm run setup --o=countries --i=http://naciscdn.org/naturalearth/packages/natural_earth_vector.zip
  npm run setup --o=counties_us --i=http://www2.census.gov/geo/tiger/GENZ2016/shp/cb_2016_us_county_500k.zip
  npm run setup --o=counties_ca --i=http://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/files-fichiers/gpr_000b11a_e.zip
  npm run setup --o=counties_aus --i=http://www.dptiapps.com.au/dataportal/Counties_shp.zip


# Usage

Convert map data:

  npm run convert --o=countries --i=data/countries/10m_cultural/ne_10m_admin_0_countries.shp
  npm run convert --o=states --i=data/countries/10m_cultural/ne_10m_admin_1_states_provinces.shp
  npm run convert --o=counties_us --i=data/counties_us/cb_2016_us_county_500k.shp
  npm run convert --o=counties_ca --i=data/counties_ca/gpr_000b11a_e.shp
  npm run convert --o=counties_aus --i=data/counties_aus/Counties.shp

Preview a file:

  npm run preview --i=src/json/counties_aus/4.geo2topo.json

Run the web server:

  npm start

Then view in your web browser:

  http://localhost:8080/#countries
  http://localhost:8080/#states
  http://localhost:8080/#counties_us
  http://localhost:8080/#counties_ca
  http://localhost:8080/#counties_aus
