import React, { Component } from "react";
import ReactDOM from "react-dom";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import colorbrewer from "colorbrewer";
import jsgeoda from "jsgeoda";

// Set your mapbox access token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg";

// The geojson data
const DATA_URL = `https://webgeoda.github.io/data/natregimes.geojson`;


class App extends Component {
  constructor() {
    super();
    this.state = {
      mapId: "",
      layer: null,
      viewPort: {
        longitude: -100.4,
        latitude: 38.74,
        zoom: 2.5,
        maxZoom: 20
      }
    };
  }

  // load spatial data when mount this component
  loadSpatialData(geoda) {
    fetch(DATA_URL)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        // load geojson in jsgeoda, an unique id (string) will be returned for further usage
        const nat = geoda.read_geojson(data);
        const hr60 = geoda.get_col(nat, "HR60");
        const cb = geoda.custom_breaks(nat, "natural_breaks", 5, null, hr60);

        // Viewport settings
        const view_port = geoda.get_viewport(nat, window.innerHeight, window.innerWidth);

        // Create GeoJsonLayer
        const layer = new GeoJsonLayer({
          id: "GeoJsonLayer",
          data: DATA_URL,
          filled: true,
          getFillColor: (f) => this.getFillColor(f, cb.breaks),
          stroked: true,
          pickable: true
        });

        // Trigger to draw map
        this.setState({
          mapId: nat,
          layer: layer,
          viewPort: view_port
        });
      });
  }

  componentDidMount() {
    // jsgeoda.New() function will create an instance from WASM
    jsgeoda.New().then((geoda) => {
      this.loadSpatialData(geoda);
    });
  }

  // Determine which color for which geometry
  getFillColor(f, breaks) {
    for (let i = 1; i < breaks.length; ++i) {
      if (f.properties.HR60 < breaks[i]) {
        return colorbrewer.YlOrBr[breaks.length - 1][i - 1]
          .match(/[0-9a-f]{2}/g)
          .map((x) => parseInt(x, 16));
      }
    }
  }

  render() {
    return (
      <div>
        <DeckGL
          initialViewState={this.state.viewPort}
          layers={[this.state.layer]}
          controller={true}
          getTooltip={({ object }) =>
            object && `${object.properties.NAME}: ${object.properties.HR60}`
          }
        >
          <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
        </DeckGL>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById("root"));;
