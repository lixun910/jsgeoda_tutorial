onst jsgeoda = require('jsgeoda');
const fs = require('fs');

// load data
const data = fs.readFileSync('./data/natregimes.geojson').buffer;

// create jsgeoda instance
const geoda = await jsgeoda.New();

const map_uid = './data/natregimes.geojson';

// load geojson in jsgeoda
const nat = geoda.read_geojson(map_uid, data);