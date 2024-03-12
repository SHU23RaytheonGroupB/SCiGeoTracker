import { displayMissionMenu } from "./mission-popout-menu.js";
import { updateUkArea, updateArea, draw } from "./area-calculations.js";

const darkTheme_ProductFillColours = {
  SCENE: "#fc685d", //LIGHT RED
  BORDER: "#cc0000", //DARK RED
};

const outdoorsTheme_ProductFillColours = {
  SCENE: "#00ff00", //LIGHT GREEN
  BORDER: "#6a329f", //PURPLE
};

const satelliteTheme_ProductFillColours = {
  SCENE: "#ffffff", //wHITE
  BORDER: "#fc685d", //LIGHT RED
};

const productFillColours = {
  "dark-v11": darkTheme_ProductFillColours,
  "satellite-streets-v12": satelliteTheme_ProductFillColours,
  "outdoors-v11": outdoorsTheme_ProductFillColours,
  "light-v11": outdoorsTheme_ProductFillColours,
};

const productOutlineColours = {
  SCENE: "#000000", //BLACK
  DOCUMENT: "#000000", //BLACK
};

const LayerMode = {
  Frames: "Frames",
  Heatmap: "Heatmap",
  Choropleth: "Choropleth",
  Isarithmic: "Isarithmic",
  DotDensity: "Dot Density",
  FrameOverlaps: "Frame Overlaps",
  BorderSelection: "Border Selection",
};

const CursorMode = {
  Move: "Move",
  Rectangle: "Rectangle",
  Polygon: "Polygon",
};

const MapStyle = {
  Dark: "dark-v11",
  Light: "light-v11",
  Satellite: "satellite-streets-v12",
  Outdoors: "outdoors-v11",
};

const minZoom = 4;
const maxZoom = 12;

let cursorMode;
let layerMode;
let mapStyle = MapStyle.Dark;
let allProducts = [];
let darkMode = sessionStorage.getItem("dark") == "true" ?? true;

setDarkMode(darkMode);

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

mapboxgl.accessToken = "pk.eyJ1IjoiZ3JhY2VmcmFpbiIsImEiOiJjbHJxbTJrZmgwNDl6MmtuemszZWtjYWh5In0.KcHGIpkGHywtjTHsL5PQDQ";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: `mapbox://styles/mapbox/${mapStyle}`, // style URL
  center: [-5, 55], // starting position
  zoom: 5, // starting zoom
  minZoom: minZoom,
  maxZoom: maxZoom,
  attributionControl: false,
});

import { Timeline } from "./zoomable-timeline-with-items.js";

//Functionality - add event listeners aka filtersPanel.on change etc to relevant functions &
//this will determine all calls for any functions not to be triggered on instant load of page
let loaded = false;

map.on("load", async () => {
  darkStyle();
  renderOverlaysZoom();
  await initialiseProducts();

  const START_DATE = new Date(1558231200000);
  const END_DATE = new Date(1593914400000);

  const from = START_DATE;
  const until = END_DATE;
  const timeline = Timeline(map, { from, until });
  document.querySelector("#timeline-container").appendChild(timeline.element);

  loaded = true; //used so style is not loaded before data is requested
});

map.on("style.load", () => {
  if (loaded) {
    addProductsToMap();
    framesMode();
  }
});

let polygonButton = document.getElementById("polygon-button");
polygonButton.addEventListener("click", drawPoly);

let infoCloseButton = document.getElementById("area-selection-info-close-button");
infoCloseButton.addEventListener("click", closeInfo);

function closeInfo() {
  document.getElementById("area-selection-info-container").style.display = "none";
}

let infoMoveButton = document.getElementById("move-button");
infoMoveButton.addEventListener("click", moveMap);

const styleMenuButtonEle = document.querySelector("#style-menu-button");
const styleMenuItemsContainerEle = document.querySelector("#style-menu-items-container");
const styleMenuButtonTextEle = document.querySelector("#style-menu-button-text");
let styleMenuOpen = false;
const openStyleMenu = () => {
  styleMenuOpen = true;
  styleMenuItemsContainerEle.style.display = null;
  styleMenuItemsContainerEle.focus();
};
const closeStyleMenu = () => {
  styleMenuOpen = false;
  styleMenuItemsContainerEle.style.display = "none";
};
styleMenuButtonEle.onclick = () => {
  if (!styleMenuOpen) openStyleMenu();
  else closeStyleMenu();
};
styleMenuItemsContainerEle.focusout = () => {
  closeStyleMenu();
};

const darkStyle = () => {
  mapStyle = MapStyle.Dark;
  styleMenuButtonTextEle.textContent = "Dark";
  closeStyleMenu();
  map.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
};

const lightStyle = () => {
  mapStyle = MapStyle.Light;
  styleMenuButtonTextEle.textContent = "Light";
  closeStyleMenu();
  map.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
};

const satelliteStyle = () => {
  mapStyle = MapStyle.Satellite;
  styleMenuButtonTextEle.textContent = "Satellite";
  closeStyleMenu();
  map.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
};

const topoStyle = () => {
  mapStyle = MapStyle.Outdoors;
  styleMenuButtonTextEle.textContent = "Topology";
  closeStyleMenu();
  map.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
};

document.querySelector("#dark-item").onclick = darkStyle;
document.querySelector("#light-item").onclick = lightStyle;
document.querySelector("#satellite-item").onclick = satelliteStyle;
document.querySelector("#topo-item").onclick = topoStyle;

document.querySelector("#theme-button").onclick = () => setDarkMode(!darkMode);

function setDarkMode(enabled) {
  darkMode = enabled;
  sessionStorage.setItem("dark", darkMode ? "true" : "false");
  if (darkMode) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

map.addControl(draw);
draw.changeMode("simple_select"); //default not draw

function moveMap() {
  draw.changeMode("simple_select");
}

function drawPoly() {
  draw.changeMode("draw_polygon");
  map.on("draw.create", updateArea);
  map.on("draw.delete", updateArea);
  map.on("draw.update", updateArea);
  map.on("draw.selectionchange", updateArea);
}

const coordEle = document.querySelector("#coords");
const zoomScrollButtonEle = document.querySelector("#zoom-scroll-button");

function renderOverlaysZoom() {
  const zoomPercentage = ((map.getZoom() - minZoom) / (maxZoom - minZoom)) * 100;
  zoomScrollButtonEle.style.top = `${100 - zoomPercentage}%`;
}

var barTop = 0,
  barBottom = 0;
zoomScrollButtonEle.onmousedown = dragMouseDown;

function setZoomByPercentage(percentage) {
  percentage = Math.min(100, Math.max(0, percentage));
  map.setZoom((percentage / 100) * (maxZoom - minZoom) + minZoom);
}

function dragMouseDown(e) {
  e.preventDefault();
  const boundingRect = zoomScrollButtonEle.parentElement.getBoundingClientRect();
  barTop = boundingRect.top + 12;
  barBottom = boundingRect.bottom - 12;
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
}

function elementDrag(e) {
  e.preventDefault();
  setZoomByPercentage(((barBottom - e.clientY) / (barBottom - barTop)) * 100);
}

function closeDragElement() {
  document.onmouseup = null;
  document.onmousemove = null;
}

map.on("mousemove", (ev) => {
  const { lng, lat } = ev.lngLat;
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
});

map.on("zoom", (ev) => {
  renderOverlaysZoom();
});

async function initialiseProducts() {
  const response = await fetch("/api/getProducts");
  allProducts = await response.json();
  //allRenderableProducts = filterOutNonSceneProducts();

  await addProductsToMap();

  //filtersPanel.on("change", filterProductsByType);
  framesMode();
}

function filterOutNonSceneProducts() {
  let filteredProducts = allProducts.filter((p) => p.documentType === productTypes["SCENE"]);
  return filteredProducts;
}

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
      "fill-color": productFillColours[mapStyle]["SCENE"],
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
  // map.addLayer({
  //   id: `${regionPolygons}-choropleth`,
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
    id: `${title}-border-fill`,
    type: "fill",
    source: title,
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": productFillColours[mapStyle]["SCENE"],
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
      "line-color": productFillColours[mapStyle]["BORDER"],
    },
  });
}

let hoveredPolygonId = null;

map.on("mousemove", "region-boundaries-choropleth", (e) => {
  if (e.features.length > 0) {
    if (hoveredPolygonId !== null) {
      map.setFeatureState({ source: "region-boundaries", id: hoveredPolygonId }, { hover: false });
    }
    hoveredPolygonId = e.features[0].id;
    map.setFeatureState({ source: "region-boundaries", id: hoveredPolygonId }, { hover: true });
  }
});

map.on("mouseleave", "region-boundaries-choropleth", () => {
  if (hoveredPolygonId !== null) {
    map.setFeatureState({ source: "region-boundaries", id: hoveredPolygonId }, { hover: false });
  }
  hoveredPolygonId = null;
});

map.on("click", "region-boundaries-choropleth", (e) => {
  alert(e.features[0].properties.LAD23NM);
});

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
export async function circleLinkZoom(d) {
  let reset = document.querySelectorAll("circle");
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
    }
  });
  let circleGroup = document.querySelectorAll('circle[mission="' + misGroup + '"]');
  circleGroup.forEach((circle) => {
    circle.style.fill = "blue";
  });
  displayMissionMenu(currentProduct);

  // allProducts.forEach((product) => {

  // });
}

const areaSelectionInfoContainerEle = document.querySelector("#area-selection-info-container");


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

// BUTTON FUNCTIONALITY

const moveButtonEle = document.querySelector("#move-button");
const rectangleButtonEle = document.querySelector("#rectangle-button");
const polygonButtonEle = document.querySelector("#polygon-button");
const cursorSelectedClasses = [
  "dark:bg-neutral-700",
  "dark:hover:bg-neutral-600/90",
  "bg-neutral-200/90",
  "hover:bg-neutral-200/30",
];

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
  map.setLayoutProperty("region-boundaries-choropleth", "visibility", "none");
  map.setLayoutProperty("uk-land-border-fill", "visibility", "none");
  map.setLayoutProperty("uk-land-border-outline", "visibility", "none");
  //map.setLayoutProperty("country-boundaries-choropleth", "visibility", "none");
};

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
  map.setLayoutProperty("region-boundaries-choropleth", "visibility", "visible");
  map.setLayoutProperty("country-boundaries-borders", "visibility", "visible");
  map.setLayoutProperty("country-boundaries-choropleth", "visibility", "visible");
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

const borderSelectionMode = () => {
  layerMode = LayerMode.BorderSelection;
  layerMenuButtonTextEle.textContent = layerMode;
  closeLayerMenu();
  hideAllLayers();
  map.setLayoutProperty("uk-land-border-fill", "visibility", "visible");
  map.setLayoutProperty("uk-land-border-outline", "visibility", "visible");
  updateUkArea();
};

document.querySelector("#frames-item").onclick = framesMode;
document.querySelector("#heatmap-item").onclick = heatmapMode;
document.querySelector("#choropleth-item").onclick = choroplethMode;
document.querySelector("#isarithmic-item").onclick = isarithmicMode;
document.querySelector("#dot-density-item").onclick = dotDensityMode;
document.querySelector("#frame-overlaps-item").onclick = frameOverlapsMode;
document.querySelector("#border-selection-item").onclick = borderSelectionMode;

let savedAreas = JSON.parse(sessionStorage.getItem("savedAreas") ?? "[]");

const saveSavedAreas = () => {
  sessionStorage.setItem("savedAreas", JSON.stringify(savedAreas));
};

if (savedAreas.length == 0) {
  for (let i = 0; i < 10; i++) {
    savedAreas.push({
      name: `Test area ${i + 1}`,
    });
  }
  saveSavedAreas();
}

const savedAreasContainerEle = document.querySelector("#saved-areas-container");
const savedAreasListEle = document.querySelector("#saved-areas-list");

let savedAreasOpen = false;
const openSavedAreas = () => {
  savedAreasListEle.replaceChildren();
  savedAreas.forEach((savedArea) => {
    const savedAreaContainerEle = document.createElement("div");
    savedAreaContainerEle.className =
      "p-1.5 rounded-md dark:bg-neutral-800 ring-1 ring-neutral-600/50 ring-neutral-700/50 bg-neutral-300/90 flex flex-row gap-1 flex";
    const savedAreaCheckboxEle = document.createElement("input");
    savedAreaCheckboxEle.type = "checkbox";
    savedAreaCheckboxEle.name = "saved-area-checkbox";
    savedAreaCheckboxEle.className =
      "w-4 h-4 my-auto text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600";
    savedAreaContainerEle.append(savedAreaCheckboxEle);
    const savedAreaNameEle = document.createElement("span");
    savedAreaNameEle.className = "grow my-auto";
    savedAreaNameEle.textContent = savedArea.name;
    savedAreaContainerEle.append(savedAreaNameEle);
    const savedAreaViewButtonEle = document.createElement("button");
    const savedAreaEditButtonEle = document.createElement("button");
    const savedAreaDeleteButtonEle = document.createElement("button");
    savedAreaViewButtonEle.name = "saved-area-view-button";
    savedAreaEditButtonEle.name = "saved-area-edit-button";
    savedAreaDeleteButtonEle.name = "saved-area-delete-button";
    savedAreaViewButtonEle.className =
      "ml-auto my-auto p-1 rounded-md dark:bg-neutral-700/70 ring-1 ring-neutral-600/50 bg-neutral-100/90";
    savedAreaEditButtonEle.className =
      "ml-auto my-auto p-1 rounded-md dark:bg-neutral-700/70 ring-1 ring-neutral-600/50 bg-neutral-100/90";
    savedAreaDeleteButtonEle.className =
      "ml-auto my-auto p-1 rounded-md dark:bg-neutral-700/70 ring-1 ring-neutral-600/50 bg-neutral-100/90";
    const savedAreaViewButtonImageEle = document.createElement("img");
    const savedAreaEditButtonImageEle = document.createElement("img");
    const savedAreaDeleteButtonImageEle = document.createElement("img");
    savedAreaViewButtonImageEle.className = "h-4 w-4";
    savedAreaEditButtonImageEle.className = "h-4 w-4";
    savedAreaDeleteButtonImageEle.className = "h-4 w-4";
    savedAreaViewButtonImageEle.src = "images/icons8-map-90.png";
    savedAreaEditButtonImageEle.src = "images/icons8-edit-90.png";
    savedAreaDeleteButtonImageEle.src = "images/icons8-delete-90.png";
    savedAreaViewButtonEle.append(savedAreaViewButtonImageEle);
    savedAreaEditButtonEle.append(savedAreaEditButtonImageEle);
    savedAreaDeleteButtonEle.append(savedAreaDeleteButtonImageEle);
    savedAreaViewButtonEle.onclick = () => {
      alert(savedArea.name);
    };
    savedAreaEditButtonEle.onclick = () => {
      alert(savedArea.name);
    };
    savedAreaDeleteButtonEle.onclick = () => {
      alert(savedArea.name);
    };
    savedAreaContainerEle.append(savedAreaViewButtonEle);
    savedAreaContainerEle.append(savedAreaEditButtonEle);
    savedAreaContainerEle.append(savedAreaDeleteButtonEle);
    savedAreasListEle.append(savedAreaContainerEle);
  });

  savedAreasOpen = true;
  savedAreasContainerEle.style.display = null;
  savedAreasContainerEle.focus();
};
const closeSavedAreas = () => {
  savedAreasOpen = false;
  savedAreasContainerEle.style.display = "none";
};

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

const searchResultsContainerEle = document.querySelector("#search-results-container");
const searchBarEle = document.querySelector("#search-bar");

const updateSearchResults = () => {
  searchResultsContainerEle.replaceChildren();
  const searchQuery = searchBarEle.value.toLowerCase().trim();
  if (searchQuery.length == 0) return;
  const results = [];
  boundariesByRegion.features.forEach((feature) => {
    if (feature.properties.LAD23NM.toLowerCase().includes(searchQuery)) {
      results.push(feature.properties);
    }
  });
  // const results = map.querySourceFeatures("region-boundaries", {
  //   filter: [
  //     "in",
  //     searchQuery,
  //     ["string", ["get", "LAD23NM"]]
  //     // "==", "LAD23NM", searchQuery
  //   ]
  // });
  results.forEach((result) => {
    const resultEle = document.createElement("button");
    resultEle.type = "button";
    resultEle.className = `text-left rounded-md py-1.5 px-3 #border-0 text-sm max-w-64 ring-1 ring-inset shadow-sm
      dark:bg-neutral-950/50 dark:ring-neutral-700/50 dark:hover:bg-neutral-950/80
      bg-neutral-100/80 ring-neutral-300/90 hover:bg-neutral-200/90`;
    const resultSpanEle = document.createElement("span");
    resultSpanEle.textContent = result.LAD23NM;
    resultEle.onclick = () => gotoFeatureByResult(result);
    // resultEle.querySelector("span").textContent = result.LAD23NM;
    resultEle.append(resultSpanEle);
    searchResultsContainerEle.append(resultEle);
  });
};


const areaViewInfoContainerEle = document.querySelector("#area-view-info-container");
document.querySelector("#area-selection-info-close-button").onclick = () => {
  areaViewInfoContainerEle.style.display = "none";
  map.setMaxBounds(null);
  map.removeLayer("mask-fill");
  map.removeLayer("mask-outline");
  map.removeSource("mask");
};

const gotoFeatureByResult = (result) => {
  searchResultsContainerEle.replaceChildren();
  let feature;
  boundariesByRegion.features.forEach((x) => {
    if (x.properties.LAD23CD == result.LAD23CD) {
      feature = x;
    }
  });
  const boundingBox = turf.bbox(feature);
  map.addSource("mask", {
    "type": "geojson",
    "data": turf.mask(feature),
  });
  map.addLayer({
    "id": "mask-fill",
    "source": "mask",
    "type": "fill",
    "paint": {
      "fill-color": "black",
      'fill-opacity': 0.5
    }
  });
  map.addLayer({
    id: "mask-outline",
    type: "line",
    source: "mask",
    paint: {
      "line-width": 1.2,
      "line-opacity": 0.4,
      "line-color": "white",
    },
  });
  const bounds = [boundingBox.slice(0, 2), boundingBox.slice(2, 4)];
  map.fitBounds(bounds, {
    padding: 50,
    animate: false
  });
  map.setMaxBounds(map.getBounds());
  areaSelectionInfoContainerEle.style.display = "inline";
  const totalAreaContainerEle = document.querySelector("#view-total-area-value");
  const coveredAreaContainerEle = document.querySelector("#view-covered-area-value");
  const uncoveredAreaContainerEle = document.querySelector("#view-uncovered-area-value");
  const coveragePercentageContainerEle = document.querySelector("#view-coverage-percentage-value");
  const missionCountContainerEle = document.querySelector("#view-total-missions-value");
  totalAreaContainerEle.textContent = totalAreaRounded;
  coveredAreaContainerEle.textContent = coveredArea;
  uncoveredAreaContainerEle.textContent = uncoveredArea;
  coveragePercentageContainerEle.textContent = coveragePercentage;
  missionCountContainerEle.textContent = missionCount;
};

searchBarEle.oninput = updateSearchResults;
document.querySelector("#search-button").onclick = updateSearchResults;
