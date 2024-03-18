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

export const LayerMode = {
  Frames: "Frames",
  Heatmap: "Heatmap",
  Choropleth: "Choropleth",
  Isarithmic: "Isarithmic",
  DotDensity: "Dot Density",
  FrameOverlaps: "Frame Overlaps",
  BorderSelection: "Border Selection",
};

export async function initialiseProducts() {
  const response = await fetch("/api/getProducts");
  allProducts = await response.json();
  await addProductsToMap();
  framesMode();
}

export function initialiseLayerMenu() {
  document.querySelector("#frames-item").onclick = framesMode;
  document.querySelector("#heatmap-item").onclick = heatmapMode;
  document.querySelector("#choropleth-item").onclick = choroplethMode;
  document.querySelector("#isarithmic-item").onclick = isarithmicMode;
  document.querySelector("#dot-density-item").onclick = dotDensityMode;
  document.querySelector("#frame-overlaps-item").onclick = frameOverlapsMode;
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

//Draw every product to the screen
async function addProductsToMap() {
  //Define polygon & point mapbox
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
  // SOURCES
  addSource("product-polygons", polygonFeatureCollection);
  addSource("product-points", pointFeatureCollection);
  addSource("country-boundaries", boundariesByCountry);
  addSource("region-boundaries", boundariesByRegion);
  addSource("uk-land", UKlandBorder);
  updateChoroplethSource();
  // FRAMES LAYER
  addFramesLayers("product-polygons");
  // HEATMAP LAYER
  addHeatmapLayer("product-points");
  // CHOROPLETH LAYER
  addChoroplethLayers("country-boundaries", "region-boundaries");
  // DOT LAYER
  addDotLayer("product-points");
  // BORDER LAYER - TEMP
  addBorderLayer("uk-land");
}

export function addSource(title, data) {
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
      "fill-color": productFillColours[mapStyle.currentStyle]["SCENE"],
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

function addHeatmapLayer(title) {
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

function addDotLayer(title) {
  map.addLayer({
    id: `${title}-dot-density`,
    type: "circle",
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

const framesMode = () => {
  layerMode = LayerMode.Frames;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  window.map.setLayoutProperty("product-polygons-frames-fill", "visibility", "visible");
  window.map.setLayoutProperty("product-polygons-frames-outline", "visibility", "visible");
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

const dotDensityMode = () => {
  layerMode = LayerMode.DotDensity;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  window.map.setLayoutProperty("product-points-dot-density", "visibility", "visible");
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
  window.map.setLayoutProperty("uk-land-border-fill", "visibility", "visible");
  window.map.setLayoutProperty("uk-land-border-outline", "visibility", "visible");
  updateUkArea();
};

const hideAllLayers = () => {
  window.map.setLayoutProperty("product-polygons-frames-fill", "visibility", "none");
  window.map.setLayoutProperty("product-polygons-frames-outline", "visibility", "none");
  window.map.setLayoutProperty("product-points-heatmap", "visibility", "none");
  window.map.setLayoutProperty("product-points-dot-density", "visibility", "none");
  window.map.setLayoutProperty("region-boundaries-borders", "visibility", "none");
  window.map.setLayoutProperty("region-boundaries-choropleth", "visibility", "none");
  window.map.setLayoutProperty("uk-land-border-fill", "visibility", "none");
  window.map.setLayoutProperty("uk-land-border-outline", "visibility", "none");
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
