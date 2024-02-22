import {  displayMissionMenue } from "./mission-popout-menue.js";

let productFillColours = {
  SCENE: "#A2A2A2", //GREY
  DOCUMENT: "#219BF5", //blue
  IMAGERY: "#0085EC", //slightly darker blue
  VIDEO: "#008907", //green
};

let productOutlineColours = {
  SCENE: "#000000", //BLACK
  DOCUMENT: "#219BF5", //blue
  IMAGERY: "#0085EC", //slightly darker blue
  VIDEO: "#008907", //green
};

const CursorMode = {
  Move: "Move",
  Rectangle: "Rectangle",
  Polygon: "Polygon",
};

const LayerMode = {
  Frames: "Frames",
  Heatmap: "Heatmap",
  Choropleth: "Choropleth",
  Isarithmic: "Isarithmic",
  DotDensity: "Dot Density",
  FrameOverlaps: "Frame Overlaps",
};

const minZoom = 4;
const maxZoom = 12;

let cursorMode;
let layerMode;
let allProducts = [];

mapboxgl.accessToken = "pk.eyJ1IjoiZ3JhY2VmcmFpbiIsImEiOiJjbHJxbTJrZmgwNDl6MmtuemszZWtjYWh5In0.KcHGIpkGHywtjTHsL5PQDQ";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/dark-v11", // style URL
  center: [-5, 55], // starting position
  zoom: 5, // starting zoom
  minZoom: minZoom,
  maxZoom: maxZoom,
  attributionControl: false,
});

const draw = new MapboxDraw({
  //USED FOR DRAW POLYGON
  displayControlsDefault: false,
  // Select which mapbox-gl-draw control buttons to add to the map.
  controls: {
    polygon: true,
    trash: true,
  },
  // Set mapbox-gl-draw to draw by default.
  // The user does not have to click the polygon control button first.
  defaultMode: "draw_polygon",
  userProperties: true,
  styles: [
    {
      id: "gl-draw-polygon-fill-inactive",
      type: "fill",
      filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.1 },
    },
    {
      id: "gl-draw-polygon-fill-active",
      type: "fill",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.1 },
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: { "circle-radius": 3, "circle-color": "#ffffff" },
    },
    {
      id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
      type: "circle",
      filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
      paint: { "circle-radius": 3, "circle-color": "#ffffff" },
    },
    {
      id: "gl-draw-polygon-stroke-inactive",
      type: "line",
      filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ff0000", "line-width": 2 },
    },
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ff0000", "line-width": 2, "line-opacity": 0.5 },
    },
    {
      id: "gl-draw-line-inactive",
      type: "line",
      filter: ["all", ["==", "active", "false"], ["==", "$type", "LineString"], ["!=", "mode", "static"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#3bb2d0", "line-width": 2 },
    },
    {
      id: "gl-draw-line-active",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ff0000", "line-width": 2, "line-opacity": 0.5 },
    },
    {
      id: "gl-draw-point-point-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"],
      ],
      paint: { "circle-radius": 5, "circle-opacity": 1, "circle-color": "#fff" },
    },
    {
      id: "gl-draw-point-stroke-active",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "active", "true"], ["!=", "meta", "midpoint"]],
      paint: { "circle-radius": 5, "circle-color": "#ffffff" },
    },
    {
      id: "gl-draw-point-active",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["!=", "meta", "midpoint"], ["==", "active", "true"]],
      paint: { "circle-radius": 3, "circle-color": "#ff0000" },
    },
  ],
});

import { Timeline } from "./zoomable-timeline-with-items.js";

//Functionality - add event listeners aka filtersPanel.on change etc to relevant functions &
//this will determine all calls for any functions not to be triggered on instant load of page
map.on("load", async () => {
  renderOverlaysMove();
  renderOverlaysZoom();
  await initialiseProducts();
  
  const START_DATE = new Date(1558231200000);
  const END_DATE = new Date(1593914400000);

  const from = START_DATE;
  const until = END_DATE;
  const timeline = Timeline(map, { from, until });
  document.querySelector("#timeline-container").appendChild(timeline.element);

});

map.addControl(draw);
map.on("draw.create", updateArea);
map.on("draw.delete", updateArea);
map.on("draw.update", updateArea);
map.on("draw.selectionchange", updateArea);

const coordEle = document.querySelector("#coords");
const zoomScrollEle = document.querySelector("#zoom-scroll-button");

function renderOverlaysMove() {
  const { lng, lat } = map.getCenter();
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
}

function renderOverlaysZoom() {
  const zoomPercentage = ((map.getZoom() - minZoom) / (maxZoom - minZoom)) * 100;
  zoomScrollEle.style.top = `${100 - zoomPercentage}%`;
}

map.on("move", (ev) => {
  renderOverlaysMove();
});

map.on("zoom", (ev) => {
  renderOverlaysZoom();
});

async function initialiseProducts() {
  const response = await fetch("/api/getProducts");
  allProducts = await response.json();
  await addProductsToMap();

  //filtersPanel.on("change", filterProductsByType);
  framesMode();
}

function filterProductsByType() {
  //PSEUDOCODE IDEA
  //let type = dropdown.value
  //filteredProducts = allProducts.where( p => p.type == type)
  //map.allLayers.forEach(remove)
  //addProductsToMap()
}

//Draw every product to the screen
async function addProductsToMap() {
  //Define polygon & point mapbox 
  console.log(allProducts);
  let polygonFeatureCollection = {
    type: "FeatureCollection",
    features: allProducts.map((product) => ({
      type: "Feature",
      geometry: product.footprint,
      attributes: {
        id: product.identifier,
        type: product.type,
        title: product.title,
        mission_id: product.missionid,
        date_created: product.datecreated,
        date_start: product.objectstartdate,
        date_end: product.objectenddate,
        pub: product.publisher, 
      },
    })),
  };
  let pointFeatureCollection = {
    type: "FeatureCollection",
    features: allProducts.map((product) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: product.centre != null ? product.centre.split(",").reverse() : [],
      },
      attributes: {
        id: product.identifier,
        type: product.type,
        title: product.title,
        mission_id: product.missionid,
        date_created: product.datecreated,
        date_start: product.objectstartdate,
        date_end: product.objectenddate,
        mission_group: product.title.split(" ")[0],
        scene_name: product.title.split(" ")[1],
      },
    })),
  };

  const boundariesByRegion = await getGeojsonFile("../boundaries/UK-by-region.json");
  const boundariesByCountry = await getGeojsonFile("../boundaries/UK-by-country.json");
  const UKlandBorder = await getGeojsonFile("../boundaries/UK-land-border.json");

  async function getGeojsonFile(fileLocation) {
    const response = await fetch(fileLocation);
    if (!response.ok) {
      throw new Error(`Error getting ${fileLocation} file`);
    }
    return await response.json();
  }
  // SOURCES
  addSource("product-polygons", polygonFeatureCollection);
  addSource("product-points", pointFeatureCollection);
  addSource("country-boundaries", boundariesByCountry);
  addSource("region-boundaries", boundariesByRegion);
  addSource("uk-land-border", UKlandBorder);
  updateChoroplethSource();
  // FRAMES LAYER
  addFramesLayers("product-polygons");
  // HEATMAP LAYER
  addHeatmapLayer("product-points");
  //CHLOROPLETH LAYER
  addChloroplethLayers("country-boundaries", "region-boundaries");
  // DOT LAYER
  addDotLayer("product-points");
  // BORDER LAYER - TEMP
  addBorderLayer("uk-land-border");
}

function addSource(title, data) {
  map.addSource(title, {
    type: "geojson",
    data: data,
    // tolerance: 3,
    // buffer: 512,
  });
}

function addFramesLayers(title) {
  map.addLayer({
    id: `${title}-frames-fill`,
    type: "fill",
    source: title,
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": productFillColours["SCENE"],
      "fill-opacity": 0.2,
    },
  });
  map.addLayer({
    id: `${title}-frames-outline`,
    type: "line",
    source: title,
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": productOutlineColours["SCENE"],
      "line-width": 1,
    },
  });
}


function addHeatmapLayer(title, productType) {
  map.addLayer({
    id: `${title}-heatmap`,
    type: "heatmap",
    source: title,
    layout: {
      visibility: "none",
    },
  });
}

function updateChoroplethSource() {
  const regionBoundariesSource = map.getSource("region-boundaries");
  const data = regionBoundariesSource._data;
  data.features.forEach((feature) => {
    // find the amount of points within a feature bounding box
    feature.properties.total_missions = Math.ceil(Math.random() * 100);
  });
  regionBoundariesSource.setData(data);
}

function addChloroplethLayers(countryPolygons, regionPolygons) {
  map.addLayer({
    id: `${regionPolygons}-borders`,
    type: "line",
    source: regionPolygons,
    layout: {
      visibility: "none",
    },
    paint: {
      "line-width": 0.5,
      "line-opacity": 0.4,
      "line-color": '#ffffff'
    },
  });
  map.addLayer({
    id: `${regionPolygons}-chloropleth`,
    type: "fill",
    source: regionPolygons,
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "total_missions"], // assign product count property within geojson to use instead of density
        0,
        "#FFFFFF",
        100,
        "#2AFF25",
      ],
      "fill-opacity": 0.7,
    },
  });
  // map.addLayer({
  //   id: `${regionPolygons}-chloropleth`,
  //   type: "fill",
  //   source: regionPolygons,
  //   layout: {
  //     visibility: "visible",
  //   },
  //   paint: {
  //     "fill-color": productFillColours["DOCUMENT"],
  //     "fill-opacity": 0.2,
  //   },
  // });
}

function addBorderLayer(title) {
  map.addLayer({
    id: `${title}-border`,
    type: "line",
    source: title,
    layout: {
      visibility: "visible",
    },
    paint: {
      // "fill-color": productFillColours["DOCUMENT"],
      // "fill-opacity": 0.2,
      "line-width": 0.5,
      "line-opacity": 0.4,
      "line-color": '#ffffff'
    },
  });
}

function chloroLegend() {
  const legend = document.getElementById("legend");

  layers.forEach((chloroLayer, i) => {
    const color = colors[i];
    const item = document.createElement("div");
    const key = document.createElement("span");
    key.className = "legend-key";
    key.style.backgroundColor = color;

    const value = document.createElement("span");
    value.innerHTML = `${chloroLayer}`;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  });
}
export async function circleLinkZoom(d) {
  let reset = document.querySelectorAll('circle')  
  reset.forEach((reset) => {
    reset.style.fill = "red";
  });

  let misGroup;
  let currentProduct;
  allProducts.forEach((product) => {
    if (product.identifier === d) {
      misGroup = product.title.split(" ")[0];
      currentProduct = product;
      map.flyTo({
        center: product.centre.split(",").reverse(),
        zoom: 12,
        essential: true,
      });      
  }});
  let circleGroup = document.querySelectorAll('circle[mission="'+misGroup+'"]')  
  circleGroup.forEach((circle) => {
    circle.style.fill = "blue";
  });
  displayMissionMenue(currentProduct);

  // allProducts.forEach((product) => {
    
  // });
}

const areaSelectionInfoContainerEle = document.querySelector("#area-selection-info-container");

function updateArea(e) {
  //USED FOR DRAW POLYGON
  const data = draw.getAll();
  if (data.features.length > 0 && data.features[0].geometry.coordinates.length > 0) {
    let polyCoordinates = [];
    let polyCoordinatesLat = [];
    let polyCoordinatesLog = [];
    for (let i = 0; i < data.features[0].geometry.coordinates[0].length; i++) {
      polyCoordinates.push(data.features[0].geometry.coordinates[0][i]);
      polyCoordinatesLog.push(data.features[0].geometry.coordinates[0][i][1]);
      polyCoordinatesLat.push(data.features[0].geometry.coordinates[0][i][0]);
    }
    //bounding box is (Latt, Long) and has a padding of (±0.8 and ±0.9)
    let boundingBox = [
      [Math.min(...polyCoordinatesLat) - 0.8, Math.min(...polyCoordinatesLog) + 0.5],
      [Math.min(...polyCoordinatesLat) - 0.8, Math.max(...polyCoordinatesLog) + 0.5],
      [Math.max(...polyCoordinatesLat) + 0.8, Math.max(...polyCoordinatesLog) + 0.5],
      [Math.max(...polyCoordinatesLat) + 0.8, Math.min(...polyCoordinatesLog) - 0.5],
      [Math.min(...polyCoordinatesLat) - 0.8, Math.min(...polyCoordinatesLog) - 0.5],
    ];
    // map.addSource('title', {
    //   'type': "geojson",
    //   'data' : {
    //     'type': "Feature",
    //     'geometry': {
    //       'type': 'Polygon',
    //       'coordinates': [
    //         boundingBox
    //       ]
    //     }
    //   },
    // });
    // map.addLayer({
    //   id: 'title' + "fill",
    //   type: "fill",
    //   source: "title", // reference the data source
    //   layout: {},
    //   paint: {
    //     "fill-color": "#FF0000",
    //     "fill-opacity": 0.7,
    //   },
    // });
    // outlinePolygon("title", 'IMAGERY');
    const area = turf.area(data) / 1000; //divide by 1000 to get square km
    const roundedArea = Math.round(area * 100) / 100; //convert area to 2 d.p.
    const coveredArea = 403.27;
    const uncoveredArea = 603.13;
    const coveragePercentage = Math.round((coveredArea / (coveredArea + uncoveredArea)) * 10000) / 100; //area as a % to 2 d.p.
    const missionCount = 100;
    areaSelectionInfoContainerEle.style.display = null;
    document.querySelector("#area-selection-total-area").textContent = `${roundedArea.toLocaleString()}mi²`;
    document.querySelector("#area-selection-covered-area").textContent = `${coveredArea.toLocaleString()}mi²`;
    document.querySelector("#area-selection-uncovered-area").textContent = `${uncoveredArea.toLocaleString()}mi²`;
    document.querySelector("#area-selection-coverage-percentage").textContent = `${coveragePercentage.toLocaleString()}%`;
    document.querySelector("#area-selection-total-missions").textContent = `${missionCount.toLocaleString()}`;
  } else {
    areaSelectionInfoContainerEle.style.display = "none";
    //if (e.type !== 'draw.delete')
    //alert('Click the map to draw a polygon.');
  }
}

function addDotLayer(title) {
  map.addLayer({
    id: `${title}-dot-density`,
    type: 'circle',
    source: title,
    paint: {
      "circle-color": "#FF0000",
      "circle-radius": {
        base: 1.75,
        stops: [
          [12, 2],
          [32, 180],
        ],
      },
    },
  });
}

//-----------CUSTOM POLYGONS---------

// BUTTON FUNCTIONALITY

const moveButtonEle = document.querySelector("#move-button");
const rectangleButtonEle = document.querySelector("#rectangle-button");
const polygonButtonEle = document.querySelector("#polygon-button");
const cursorSelectedClasses = ["bg-neutral-800", "hover:bg-neutral-500/30"];

function deselectAllCursors() {
  moveButtonEle.classList.remove(...cursorSelectedClasses);
  rectangleButtonEle.classList.remove(...cursorSelectedClasses);
  polygonButtonEle.classList.remove(...cursorSelectedClasses);
}

const selectMoveCursor = () => {
  cursorMode = CursorMode.Move;
  deselectAllCursors();
  moveButtonEle.classList.add(...cursorSelectedClasses);
};

const selectRectangleCursor = () => {
  cursorMode = CursorMode.Rectangle;
  deselectAllCursors();
  rectangleButtonEle.classList.add(...cursorSelectedClasses);
};

const selectPolygonCursor = () => {
  cursorMode = CursorMode.Polygon;
  deselectAllCursors();
  polygonButtonEle.classList.add(...cursorSelectedClasses);
};

moveButtonEle.onclick = selectMoveCursor;
rectangleButtonEle.onclick = selectRectangleCursor;
polygonButtonEle.onclick = selectPolygonCursor;
selectMoveCursor();

const layerMenuButtonEle = document.querySelector("#layer-menu-button");
const layerMenuItemsContainerEle = document.querySelector("#layer-menu-items-container");
const layerMenuButtonTextEle = document.querySelector("#layer-menu-button-text");
let layerMenuOpen = false;
const openLayerMenu = () => {
  layerMenuOpen = true;
  layerMenuItemsContainerEle.style.display = null;
  layerMenuItemsContainerEle.focus();
};
const closeLayerMenu = () => {
  layerMenuOpen = false;
  layerMenuItemsContainerEle.style.display = "none";
};
layerMenuButtonEle.onclick = () => {
  if (!layerMenuOpen) openLayerMenu();
  else closeLayerMenu();
};
layerMenuItemsContainerEle.focusout = () => {
  closeLayerMenu();
};

const hideAllLayers = () => {
  map.setLayoutProperty("product-polygons-frames-fill", "visibility", "none");
  map.setLayoutProperty("product-polygons-frames-outline", "visibility", "none");
  map.setLayoutProperty("product-points-heatmap", "visibility", "none");
  map.setLayoutProperty("product-points-dot-density", "visibility", "none");
  map.setLayoutProperty("region-boundaries-borders", "visibility", "none");
  map.setLayoutProperty("region-boundaries-chloropleth", "visibility", "none");
  map.setLayoutProperty(" -boundaries-borders", "visibility", "none");
  map.setLayoutProperty("country-boundaries-chloropleth", "visibility", "none");
}

const framesMode = () => {
  layerMode = LayerMode.Frames;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  map.setLayoutProperty("product-polygons-frames-fill", "visibility", "visible");
  map.setLayoutProperty("product-polygons-frames-outline", "visibility", "visible");
};

const heatmapMode = () => {
  layerMode = LayerMode.Heatmap;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  map.setLayoutProperty("product-points-heatmap", "visibility", "visible");
};

const choroplethMode = () => {
  layerMode = LayerMode.Choropleth;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  map.setLayoutProperty("region-boundaries-borders", "visibility", "visible");
  map.setLayoutProperty("region-boundaries-chloropleth", "visibility", "visible");
  map.setLayoutProperty("country-boundaries-borders", "visibility", "visible");
  map.setLayoutProperty("country-boundaries-chloropleth", "visibility", "visible");
};

const isarithmicMode = () => {
  layerMode = LayerMode.Isarithmic;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
};

const dotDensityMode = () => {
  layerMode = LayerMode.DotDensity;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  map.setLayoutProperty("product-points-dot-density", "visibility", "visible");
};

const frameOverlapsMode = () => {
  layerMode = LayerMode.FrameOverlaps;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
};

document.querySelector("#frames-item").onclick = framesMode;
document.querySelector("#heatmap-item").onclick = heatmapMode;
document.querySelector("#choropleth-item").onclick = choroplethMode;
document.querySelector("#isarithmic-item").onclick = isarithmicMode;
document.querySelector("#dot-density-item").onclick = dotDensityMode;
document.querySelector("#frame-overlaps-item").onclick = frameOverlapsMode;

let savedAreasOpen = false;
const openSavedAreas = () => {
  savedAreasOpen = true;
  savedAreasContainerEle.style.display = null;
  savedAreasContainerEle.focus();
};
const closeSavedAreas = () => {
  savedAreasOpen = false;
  savedAreasContainerEle.style.display = "none";
};

const savedAreasContainerEle = document.querySelector("#saved-areas-container");
document.querySelector("#saved-areas-close-button").onclick = closeSavedAreas;
document.querySelector("#folder-button").onclick = () => {
  if (!savedAreasOpen) openSavedAreas();
  else closeSavedAreas();
};

export { map as map };

const areaSelectionInfoCloseButtonEle = document.querySelector("#area-selection-info-close-button");
areaSelectionInfoCloseButtonEle.onclick = draw.deleteAll;


document.querySelector("#zoom-in-button").onclick = () => map.zoomIn();
document.querySelector("#zoom-out-button").onclick = () => map.zoomOut();


document.querySelector("#search-bar").oninput = (e) => {
  const searchQuery = e.target.value;
  
};
