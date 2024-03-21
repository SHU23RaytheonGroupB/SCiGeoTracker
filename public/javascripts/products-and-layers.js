import { getGeojsonFile } from "./utils.js";
import { mapStyle, productFillColours, productOutlineColours } from "./config.js";
import { updateUkArea } from "./area-calculations.js";

export let allProducts = [];
export const boundariesByRegion = await getGeojsonFile("../boundaries/UK-by-region.json");
const boundariesByCountry = await getGeojsonFile("../boundaries/UK-by-country.json");
const UKlandBorder = await getGeojsonFile("../boundaries/UK-land-border.json");
let layerMode;
const layerMenuButtonEle = document.querySelector("#layer-menu-button");
const layerMenuItemsContainerEle = document.querySelector("#layer-menu-items-container");
const layerMenuButtonTextEle = document.querySelector("#layer-menu-button-text");

const colors = ["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"];

export const LayerMode = {
  Scenes: "Scenes",
  Heatmap: "Heatmap",
  Choropleth: "Choropleth",
  Cluster: "Cluster",
  BorderSelection: "Border Selection",
};

export async function initialiseProducts() {
  const response = await fetch("/api/getProducts");
  allProducts = await response.json();
  await addProductsToMap();
  scenesMode();
}

export function initialiseLayerMenu() {
  document.querySelector("#scenes-item").onclick = scenesMode;
  document.querySelector("#heatmap-item").onclick = heatmapMode;
  document.querySelector("#choropleth-item").onclick = choroplethMode;
  document.querySelector("#cluster-density-item").onclick = clusterMode;
  document.querySelector("#border-selection-item").onclick = borderSelectionMode;

  window.map.on("mousemove", "region-boundaries-choropleth", (e) => {
    if (e.features.length > 0) {
      if (hoveredPolygonId !== null) {
        window.map.setFeatureState({ source: "region-boundaries", id: hoveredPolygonId }, { hover: false });
      }
      hoveredPolygonId = e.features[0].id;
      window.map.setFeatureState({ source: "region-boundaries", id: hoveredPolygonId }, { hover: true });
    }
  });

  window.map.on("mouseleave", "region-boundaries-choropleth", () => {
    if (hoveredPolygonId !== null) {
      map.setFeatureState({ source: "region-boundaries", id: hoveredPolygonId }, { hover: false });
    }
    hoveredPolygonId = null;
  });

  window.map.on("click", "region-boundaries-choropleth", (e) => {
    alert(e.features[0].properties.LAD23NM);
  });
}

let layerMenuOpen = false;
const openLayerMenu = () => {
  layerMenuOpen = true;
  layerMenuItemsContainerEle.classList.remove("hidden");
  layerMenuItemsContainerEle.focus();
};
const closeLayerMenu = () => {
  layerMenuOpen = false;
  layerMenuItemsContainerEle.classList.add("hidden");
};
layerMenuButtonEle.onclick = () => {
  if (!layerMenuOpen) openLayerMenu();
  else closeLayerMenu();
};
layerMenuItemsContainerEle.focusout = () => {
  closeLayerMenu();
};

//Draw every product to the screen
async function addProductsToMap() {
  //Define polygon & point mapbox
  let polygonFeatureCollection = {
    type: "FeatureCollection",
    features: allProducts.map((product) => ({
      type: "Feature",
      geometry: product.footprint,
      properties: {
        id: product.identifier,
        type: product.type,
        title: product.title,
        mission_id: product.missionid,
        date_created: product.datecreated,
        date_modified: product.datemodified,
        date_start: product.objectstartdate,
        date_end: product.objectenddate,
        pub: product.publisher,
        covered_area_km: turf.area(product.footprint) / 1000000 ?? 0,
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
      properties: {
        id: product.identifier,
        type: product.type,
        title: product.title,
        mission_id: product.missionid,
        date_created: product.datecreated,
        date_modified: product.datemodified,
        date_start: product.objectstartdate,
        date_end: product.objectenddate,
        mission_group: product.title.split(" ")[0],
        scene_name: product.title.split(" ")[1],
        covered_area_km: turf.area(product.footprint) / 1000000 ?? 0,
      },
      cluster: true,
      clusterMaxZoom: 9,
      clusterRadius: 50,
    })),
  };

  // SOURCES
  addSource("product-polygons", polygonFeatureCollection);
  addSource("product-points", pointFeatureCollection);
  addClusterSource("product-cluster", pointFeatureCollection);
  addSource("country-boundaries", boundariesByCountry);
  addSource("region-boundaries", boundariesByRegion);
  addSource("uk-land", UKlandBorder);
  updateChoroplethSource();
  // SCENES LAYER
  addScenesLayers("product-polygons");
  // HEATMAP LAYER
  addHeatmapLayer("product-points");
  // CHOROPLETH LAYER
  addChoroplethLayers("country-boundaries", "region-boundaries");
  // CLUSTER LAYER
  addClusterLayer("product-cluster");
  // BORDER LAYER - TEMP
  addBorderLayer("uk-land");
}

export const layerNames = [
  "product-polygons-frames-fill",
  "product-polygons-frames-outline",
  "country-boundaries-borders",
  "country-boundaries-choropleth",
  "region-boundaries-borders",
  "region-boundaries-choropleth",
  "product-cluster-unclustered-label",
  "product-cluster-unclustered",
  "product-cluster-label",
  "product-cluster-density",
  "uk-land-border-fill",
  "uk-land-border-outline",
];

export async function addSelectedMissionFramesToMap(framesData) {
  let framesFeatureCollection = {
    type: "FeatureCollection",
    features: framesData.map((product) => ({
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
  if (!window.map.getSource("selected-mission-frames")) {
    addSource("selected-mission-frames", framesFeatureCollection);
    addFramesLayers("selected-mission-frames");
  } else {
    window.map.getSource("selected-mission-frames").setData(framesFeatureCollection);
    window.map.setLayoutProperty("selected-mission-frames-outline", "visibility", "visible");
  }
}
export function addSource(title, data) {
  map.addSource(title, {
    type: "geojson",
    data: data,
    // tolerance: 3,
    // buffer: 512,
  });
}

export function highlightSelectedFrame(frame) {
  let selectedMissionFrames = window.map.getSource("selected-mission-frames");

  let singleFrameFeature = {
    type: "FeatureCollection",
    features: [],
  };

  for (let i = 0; i < selectedMissionFrames.length; i++) {
    let product = selectedMissionFrames[i];
    if (product.identifier === frame.identifier) {
      singleFrameFeature.features.push({
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
      });
      break; // Exit the loop after finding the matching frame
    }
  }

  addSelectedFrameLayer(singleFrameFeature);
}

export function hideFrames() {
  if (window.map.getSource("selected-mission-frames")) {
    window.map.setLayoutProperty("selected-mission-frames-outline", "visibility", "none");
  }
}

function addClusterSource(title, data) {
  map.addSource(title, {
    type: "geojson",
    data: data,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });
}

function addFramesLayers(title) {
  map.addLayer({
    id: `${title}-outline`,
    type: "line",
    source: title,
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": productOutlineColours["SCENE"],
      "line-width": 1,
    },
  });
}

function addSelectedFrameLayer(title) {
  map.addLayer({
    id: `${title}-highlight`,
    type: "line",
    source: title,
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": productFillColours[mapStyle.currentStyle]["FRAME"],
      "fill-opacity": 0.2,
    },
  });
}

function addScenesLayers(title) {
  map.addLayer({
    id: `${title}-frames-fill`,
    type: "fill",
    source: title,
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": productFillColours[mapStyle.currentStyle]["SCENE"],
      "fill-opacity": 0.2,
    },
  });
  map.addLayer({
    id: `${title}-scenes-fill`,
    type: "fill",
    source: title,
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": productFillColours[mapStyle.currentStyle]["SCENE"],
      "fill-opacity": 0.2,
    },
  });
  map.addLayer({
    id: `${title}-scenes-outline`,
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

function addHeatmapLayer(title) {
  // var style = map.getStyle();
  // style.sources.cluster = false;
  // map.setStyle(style);
  map.addLayer({
    id: `${title}-heatmap`,
    type: "heatmap",
    source: title,
    layout: {
      visibility: "none",
    },
  });
}

function addBorderLayer(title) {
  map.addLayer({
    id: `${title}-border-fill`,
    type: "fill",
    source: title,
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": productFillColours[mapStyle.currentStyle]["SCENE"],
      "fill-opacity": 0.2,
    },
  });
  map.addLayer({
    id: `${title}-border-outline`,
    type: "line",
    source: title,
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-width": 1.2,
      "line-opacity": 0.4,
      "line-color": productFillColours[mapStyle.currentStyle]["BORDER"],
    },
  });
}

function addClusterLayer(title) {
  map.addLayer({
    id: `${title}-density`,
    type: "circle",
    source: title,
    filter: ["has", "point_count"],
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count_abbreviated"],
        "#ffffff",
        2,
        colors[0],
        4,
        colors[1],
        7,
        colors[2],
        10,
        colors[3],
        15,
        colors[4],
      ],
      "circle-opacity": 0.6,
      "circle-radius": 12,
    },
  });
  map.addLayer({
    id: `${title}-label`,
    type: "symbol",
    source: title,
    filter: ["has", "point_count"],
    layout: {
      "text-opacity": {
        stops: [
          [12.9, 0],
          [13, 1],
        ],
      },
      visibility: "none",
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "black",
    },
  });
  map.addLayer({
    id: title + "-unclustered",
    type: "circle",
    source: title,
    filter: ["!", ["has", "point_count"]],
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-color": productFillColours[mapStyle.currentStyle]["CLUSTER"],
      "circle-opacity": 0.6,
      "circle-radius": 12,
    },
  });
  map.addLayer({
    id: `${title}-unclustered-label`,
    type: "symbol",
    source: title,
    filter: ["!=", "cluster", true],
    layout: {
      "text-opacity": {
        stops: [
          [12.9, 0],
          [13, 1],
        ],
      },
      visibility: "none",
      "text-field": "1",
      "text-font": ["Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "black",
    },
  });
}

function addChoroplethLayers(countryPolygons, regionPolygons) {
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
      "line-color": "#ffffff",
    },
  });
  map.addLayer({
    id: `${regionPolygons}-choropleth`,
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
      "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.8, 0.7],
    },
  });
}

function updateChoroplethSource() {
  const regionBoundariesSource = window.map.getSource("region-boundaries");
  const data = regionBoundariesSource._data;
  data.features.forEach((feature) => {
    // find the amount of points within a feature bounding box
    feature.properties.total_missions = Math.ceil(Math.random() * 100);
  });
  regionBoundariesSource.setData(data);
}

const scenesMode = () => {
  layerMode = LayerMode.Scenes;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  window.map.setLayoutProperty("product-polygons-scenes-fill", "visibility", "visible");
  window.map.setLayoutProperty("product-polygons-scenes-outline", "visibility", "visible");
};

const heatmapMode = () => {
  layerMode = LayerMode.Heatmap;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  window.map.setLayoutProperty("product-points-heatmap", "visibility", "visible");
};

const choroplethMode = () => {
  layerMode = LayerMode.Choropleth;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  window.map.setLayoutProperty("region-boundaries-borders", "visibility", "visible");
  window.map.setLayoutProperty("region-boundaries-choropleth", "visibility", "visible");
  //window.map.setLayoutProperty("country-boundaries-borders", "visibility", "visible");
  //window.map.setLayoutProperty("country-boundaries-choropleth", "visibility", "visible");
};

const isarithmicMode = () => {
  layerMode = LayerMode.Isarithmic;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
};

const clusterMode = () => {
  layerMode = LayerMode.Cluster;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  window.map.setLayoutProperty("product-cluster-density", "visibility", "visible");
  window.map.setLayoutProperty("product-cluster-label", "visibility", "visible");
  window.map.setLayoutProperty("product-cluster-unclustered", "visibility", "visible");
  window.map.setLayoutProperty("product-cluster-unclustered-label", "visibility", "visible");
};

const frameOverlapsMode = () => {
  layerMode = LayerMode.FrameOverlaps;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
};

const borderSelectionMode = () => {
  layerMode = LayerMode.BorderSelection;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  //window.map.setLayoutProperty("uk-land-border-fill", "visibility", "visible");
  //window.map.setLayoutProperty("uk-land-border-outline", "visibility", "visible");
  updateUkArea();
};

const hideAllLayers = () => {
  window.map.setLayoutProperty("product-polygons-scenes-fill", "visibility", "none");
  window.map.setLayoutProperty("product-polygons-scenes-outline", "visibility", "none");
  window.map.setLayoutProperty("product-points-heatmap", "visibility", "none");
  window.map.setLayoutProperty("product-cluster-density", "visibility", "none");
  window.map.setLayoutProperty("product-cluster-label", "visibility", "none");
  window.map.setLayoutProperty("product-cluster-unclustered-label", "visibility", "none");
  window.map.setLayoutProperty("product-cluster-unclustered", "visibility", "none");
  window.map.setLayoutProperty("region-boundaries-borders", "visibility", "none");
  window.map.setLayoutProperty("region-boundaries-choropleth", "visibility", "none");
  window.map.setLayoutProperty("uk-land-border-fill", "visibility", "none");
  window.map.setLayoutProperty("uk-land-border-outline", "visibility", "none");

  hideFrames();

  if (map.getLayer("UkLandBorder-border-outline") != undefined) {
    window.map.setLayoutProperty("UkLandBorder-border-outline", "visibility", "none");
  }
  if (map.getLayer("mission-area-within-polyfill") != undefined) {
    window.map.setLayoutProperty("mission-area-within-polyfill", "visibility", "none");
  }

  //window.map.setLayoutProperty("country-boundaries-choropleth", "visibility", "none");
};

let hoveredPolygonId = null;

function choroplethLegend() {
  const legend = document.getElementById("legend");

  layers.forEach((choroLayer, i) => {
    const color = colors[i];
    const item = document.createElement("div");
    const key = document.createElement("span");
    key.className = "legend-key";
    key.style.backgroundColor = color;

    const value = document.createElement("span");
    value.innerHTML = `${choroLayer}`;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  });
}
