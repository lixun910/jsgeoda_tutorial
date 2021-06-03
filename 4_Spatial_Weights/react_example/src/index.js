import React, { Component } from "react";
import ReactDOM from "react-dom";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import {BrushingExtension} from '@deck.gl/extensions';
import { StaticMap } from "react-map-gl";
import jsgeoda from "jsgeoda";

// Set your mapbox access token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg";

// The geojson data
const DATA_URL = `https://webgeoda.github.io/data/guerry.geojson`;

export const inFlowColors = [[35, 181, 184]];
export const outFlowColors = [[166, 3, 3]];

const brushingExtension = new BrushingExtension();

let animate = false;

class App extends Component {
  constructor() {
    super();
    this.state = {
      mapId: "",
      layers: null,
      viewPort: {
        longitude: -100.4,
        latitude: 38.74,
        zoom: 2.5,
        maxZoom: 20
      }
    };
  }

  createGeojsonLayer() {
    return new GeoJsonLayer({
      id: "GeoJsonLayer",
      data: DATA_URL,
      filled: true,
      getFillColor: [230,230,230],
      getLineColor: [255,255,255],
      stroked: true,
      pickable: true,
      opacity: 1.0,
      wireframe: true,
      lineWidthScale: 1,
      lineWidthMinPixels: 1,
    });
  }

  createConnectivityLayer(arcs) {
    return new ArcLayer({
      id: 'connectivity',
      data: arcs,
      getSourcePosition: d => d.source,
      getTargetPosition: this.getTargetPosition,
      getSourceColor: [166, 3, 3],
      getTargetColor: [35, 181, 184],
      brushingRadius: 30000,
      brushingEnabled: true,
      getWidth: 2,
      opacity: 1,
      getHeight: 0,
      extensions: [brushingExtension],
      transitions: {
        // transition with a duration of 3000ms
        getTargetPosition: { 
          duration: 4000,
        }
      },
      updateTriggers: {
        getTargetPosition: [animate]
      }
    });
  }

  // load spatial data when mount this component
  loadSpatialData(geoda) {
    fetch(DATA_URL)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        // load geojson in jsgeoda, an unique id (string) will be returned for further usage
        const guerry = geoda.read_geojson(data);
        const w = geoda.queen_weights(guerry);
        const {arcs, targets, sources} = geoda.get_connectivity(w);

        geoda.spatial_lag(w, geoda.get_col(guerry,"Crm_prs"), true, false,false);

        // Create GeoJsonLayer
        const layer = this.createGeojsonLayer();

        // Create connectivity map
        const conn_layer  = this.createConnectivityLayer(arcs);

        // Viewport settings
        const view_port = geoda.get_viewport(guerry, window.innerHeight, window.innerWidth);

        // Trigger to draw map
        this.setState({
          mapId: guerry,
          layers: [layer, conn_layer],
          viewPort: {
            ...view_port,
          }
        });

        // Animate weights graph
        setTimeout(function () {
          animate = true;
          const layer = this.createGeojsonLayer();
          const conn_layer  = this.createConnectivityLayer(arcs);

          this.setState({
            mapId: guerry,
            layers: [layer, conn_layer],
            viewPort: {
              ...view_port,
            }
          });
        }.bind(this), 100);
      });
  }

  componentDidMount() {
    // jsgeoda.New() function will create an instance from WASM
    jsgeoda.New().then((geoda) => {
      this.loadSpatialData(geoda);
    });
  }

  getTargetPosition(d) {
    if (animate) {
      return d.target;
     } else {
       return  d.source;
     } 
  }

  render() {
    return (
      <div>
        <DeckGL
          initialViewState={this.state.viewPort}
          layers={this.state.layers}
          controller={true}
        >
          <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} mapStyle='mapbox://styles/mapbox/dark-v8' />
        </DeckGL>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById("root"));;
