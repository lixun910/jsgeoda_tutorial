const fs = require('fs');
const fetch = require('node-fetch');
const jsgeoda = require('jsgeoda');

const DATA_URL = `https://webgeoda.github.io/data/natregimes.geojson`;

async function natural_breaks() {
  // create jsgeoda instance
  const geoda = await jsgeoda.New();

  fetch(DATA_URL)
    .then((res) => res.arrayBuffer())
    .then((data) => {
      // load geojson in jsgeoda, an unique id (string) will be returned for further usage
      const nat = geoda.read_geojson(data);
      const hr60 = geoda.get_col(nat, "HR60");
      const cb = geoda.custom_breaks(nat, "natural_breaks", 5, null, hr60);
    });
}

natural_breaks();