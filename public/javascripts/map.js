import { displayMissionMenue } from "./mission-popout-menue.js";

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
  BorderSelection: "Border Selection",
};

const minZoom = 4;
const maxZoom = 12;

let cursorMode;
let layerMode;
let allProducts = [];

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
    //polygon: true,
    //trash: true,
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
  renderOverlaysZoom();
  await initialiseProducts();

  const START_DATE = new Date(1558231200000);
  const END_DATE = new Date(1593914400000);

  const from = START_DATE;
  const until = END_DATE;
  const timeline = Timeline(map, { from, until });
  document.querySelector("#timeline-container").appendChild(timeline.element);
});

let polygonButton = document.getElementById("polygon-button");
polygonButton.addEventListener("click", drawPoly);

let infoCloseButton = document.getElementById("area-selection-info-close-button");
infoCloseButton.addEventListener("click", closeInfo);

let infoMoveButton = document.getElementById("move-button");
infoCloseButton.addEventListener("click", moveMap);

function closeInfo() {
  document.getElementById("area-selection-info-container").style.display = "none";
}

map.addControl(draw);
draw.changeMode('simple_select'); //default not draw

function moveMap() {
  draw.changeMode('simple_select');
}

function drawPoly() {
  draw.changeMode('draw_polygon');
  map.on("draw.create", updateArea);
  map.on("draw.delete", updateArea);
  map.on("draw.update", updateArea);
  map.on("draw.selectionchange", updateArea);
}


const coordEle = document.querySelector("#coords");
const zoomScrollEle = document.querySelector("#zoom-scroll-button");

function renderOverlaysZoom() {
  const zoomPercentage = ((map.getZoom() - minZoom) / (maxZoom - minZoom)) * 100;
  zoomScrollEle.style.top = `${100 - zoomPercentage}%`;
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
      "line-color": "#ffffff",
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
  displayMissionMenue(currentProduct);

  // allProducts.forEach((product) => {

  // });
}

const areaSelectionInfoContainerEle = document.querySelector("#area-selection-info-container");
const totalAreaContainerEle = document.querySelector("#Total-area-value-container");
const coveredAreaContainerEle = document.querySelector("#Covered-area-value-container");
const uncoveredAreaContainerEle = document.querySelector("#Uncovered-area-value-container");
const coveragePercentageContainerEle = document.querySelector("#Coverage-percentage-value-container");
const missionCountContainerEle = document.querySelector("#Mission-count-value-container");

function updateArea(e) {
  //USED FOR DRAW POLYGON
  const data = draw.getAll();
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
    [Math.min(...polyCoordinatesLat) - 0.8, Math.min(...polyCoordinatesLog) - 0.5],
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
  //console.log(boundingBox);
  let containedMissions = missionsWithinPolygon(missionsWithinBoundingBox(allProducts, boundingBox), polyCoordinates);

  if (data.features.length > 0) {
    const area = turf.area(data) / 1000; //divide by 1000 to get square km
    const rounded_area = Math.round(area * 100) / 100; //convert area to 2 d.p.
    const Covered_area = calculateMissionCoverage(containedMissions, polyCoordinates);
    const Uncovered_area = Math.round((area - Covered_area) * 100) / 100;
    const Coverage_percentage = Math.round((Covered_area / (Covered_area + Uncovered_area)) * 10000) / 100; //area as a % to 2 d.p.
    const Mission_count = containedMissions.length;
    areaSelectionInfoContainerEle.style.display = "inline";
    totalAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${rounded_area}</td>`;
    coveredAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Covered_area}</td>`;
    uncoveredAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Uncovered_area}</td>`;
    coveragePercentageContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Coverage_percentage}</td>`;
    missionCountContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Mission_count}</td>`;
  } else {
    areaSelectionInfoContainerEle.style.display = "none";
    //if (e.type !== 'draw.delete')
    //alert('Click the map to draw a polygon.');
  }
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

function missionsWithinBoundingBox(allMissons, polygon) {
  let containedMissions = [];
  var turfpolygon = turf.polygon([polygon], { name: "poly1" });

  for (let i = 0; i < allMissons.length; i++) {
    if (allMissons[i].centre != null) {
      // temporarly missions without a center cannot be added to
      const coordinatesArray = allMissons[i].centre.split(",");
      var point = turf.point([parseFloat(coordinatesArray[1]), parseFloat(coordinatesArray[0])]);
      if (turf.inside(point, turfpolygon)) {
        containedMissions.push(allMissons[i]);
      }
    }
  }
  return containedMissions;
}

function missionsWithinPolygon(boundingBoxMissions, polygon) {
  //console.log(boundingBoxMissions);
  let containedMissions = [];
  var turfpolygon = turf.polygon([polygon], { name: "poly1" });

  for (let i = 0; i < boundingBoxMissions.length; i++) {
    if (boundingBoxMissions[i].centre != null) {
      const coordinatesArray = boundingBoxMissions[i].centre.split(",");
      var point = turf.point([parseFloat(coordinatesArray[1]), parseFloat(coordinatesArray[0])]);
      if (turf.inside(point, turfpolygon)) {
        containedMissions.push(boundingBoxMissions[i]);
        continue;
      }
    }
    //console.log(boundingBoxMissions[i].footprint.coordinates[0].length);
    for (let k = 0; k < boundingBoxMissions[i].footprint.coordinates[0].length; k++) {
      var point = turf.point(
        boundingBoxMissions[i].footprint.coordinates[0][k],
        boundingBoxMissions[i].footprint.coordinates[0][k]
      );
      //console.log(boundingBoxMissions[i].footprint.coordinates[0][k][0] + ", " + boundingBoxMissions[i].footprint.coordinates[0][k][0]);
      if (turf.inside(point, turfpolygon)) {
        containedMissions.push(boundingBoxMissions[i]);
        break;
      }
    }
  }
  //console.log(containedMissions);

  return containedMissions;
}

function calculateMissionCoverage(allMissons, polygon) {
  if (allMissons.length == 0) {
    return 0;
  }
  //console.log(allMissons);
  var polygonMissions = [];
  for (let i = 0; i < allMissons.length; i++) {
    polygonMissions.push(allMissons[i].footprint.coordinates[0]);
  }

  var fcMissions = [];

  for (let i = 0; i < polygonMissions.length; i++) {
    var feature = {
      type: "Feature",
      properties: { name: i },
      geometry: {
        type: "Polygon",
        coordinates: [polygonMissions[i]],
      },
    };
    fcMissions.push(feature);
  }

  // map.addSource('test1', {
  //   'type': 'geojson',
  //   'data': {
  //     'type': 'FeatureCollection',
  //     'features': fcMissions
  //   }
  // });
  // map.addLayer({
  //   id: 'test1' + "fill",
  //   type: "fill",
  //   source: "test1", // reference the data source
  //   layout: {},
  //   paint: {
  //     "fill-color": "#00FF00",
  //     "fill-opacity": 0.7,
  //   },
  // });

  var turfpolygon = turf.polygon([polygon]);
  var fcMissionsWithinPoly = [];

  for (let i = 0; i < fcMissions.length; i++) {
    var intersection = turf.intersect(turf.polygon(fcMissions[i].geometry.coordinates), turfpolygon);
    if (intersection) {
      var feature = {
        type: "Feature",
        properties: { name: i },
        geometry: {
          type: "Polygon",
          coordinates: [intersection.geometry.coordinates[0]],
        },
      };
      fcMissionsWithinPoly.push(feature);
    }
  }

  // map.addSource('test2', {
  //     'type': 'geojson',
  //     'data': {
  //         'type': 'FeatureCollection',
  //         'features': fcMissionsWithinPoly
  //     }
  // });

  // map.addLayer({
  //     id: 'test2' + "fill",
  //     type: "fill",
  //     source: "test2", // reference the data source
  //     layout: {},
  //     paint: {
  //         "fill-color": "#FF0000",
  //         "fill-opacity": 0.7,
  //     },
  // });

  var fcMissionIntersects = [];

  for (let i = 0; i < fcMissions.length; i++) {
    for (let k = i + 1; k < fcMissions.length; k++) {
      var intersection = turf.intersect(
        turf.polygon(fcMissions[i].geometry.coordinates),
        turf.polygon(fcMissions[k].geometry.coordinates)
      );
      if (intersection) {
        var feature = {
          type: "Feature",
          properties: { name: i },
          geometry: {
            type: "Polygon",
            coordinates: [intersection.geometry.coordinates[0]],
          },
        };
        fcMissionIntersects.push(feature);
      }
    }
  }

  // map.addSource('test3', {
  //   'type': 'geojson',
  //   'data': {
  //       'type': 'FeatureCollection',
  //       'features': fcMissionIntersects
  //   }
  // });

  // map.addLayer({
  //     id: 'test3' + "fill",
  //     type: "fill",
  //     source: "test3", // reference the data source
  //     layout: {},
  //     paint: {
  //         "fill-color": "#0000FF",
  //         "fill-opacity": 0.7,
  //     },
  // });

  var fcMissionIntersectsWithinPoly = [];

  for (let i = 0; i < fcMissionIntersects.length; i++) {
    var intersection = turf.intersect(turf.polygon(fcMissionIntersects[i].geometry.coordinates), turfpolygon);
    //console.log(intersection);

    if (intersection) {
      var feature = {
        type: "Feature",
        properties: { name: i },
        geometry: {
          type: "Polygon",
          coordinates: [intersection.geometry.coordinates[0]],
        },
      };
      fcMissionIntersectsWithinPoly.push(feature);
    }
  }

  // map.addSource('test4', {
  //   'type': 'geojson',
  //   'data': {
  //       'type': 'FeatureCollection',
  //       'features': fcMissionIntersectsWithinPoly
  //   }
  // });

  // map.addLayer({
  //     id: 'test4' + "fill",
  //     type: "fill",
  //     source: "test4", // reference the data source
  //     layout: {},
  //     paint: {
  //         "fill-color": "#FFFFFF",
  //         "fill-opacity": 0.7,
  //     },
  // });

  var areaCoveredWithOverlaps = 0;
  for (let i = 0; i < fcMissionsWithinPoly.length; i++) {
    areaCoveredWithOverlaps += turf.area(turf.polygon(fcMissionsWithinPoly[i].geometry.coordinates));
  }

  var areaCoveredByOverlaps = 0;
  for (let i = 0; i < fcMissionIntersectsWithinPoly.length; i++) {
    areaCoveredWithOverlaps += turf.area(turf.polygon(fcMissionIntersectsWithinPoly[i].geometry.coordinates));
  }

  var area = areaCoveredWithOverlaps - areaCoveredByOverlaps; //currently in m^2
  area /= 1000; //divide by 1000 to get square km
  var rounded_area = Math.round(area * 100) / 100; //convert area to 2 d.p.

  //console.log(rounded_area);
  return rounded_area;
}
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
  map.setLayoutProperty("region-boundaries-choropleth", "visibility", "none");
  map.setLayoutProperty("uk-land-border", "visibility", "none");
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
  map.setLayoutProperty("uk-land-border", "visibility", "visible");
};

document.querySelector("#frames-item").onclick = framesMode;
document.querySelector("#heatmap-item").onclick = heatmapMode;
document.querySelector("#choropleth-item").onclick = choroplethMode;
document.querySelector("#isarithmic-item").onclick = isarithmicMode;
document.querySelector("#dot-density-item").onclick = dotDensityMode;
document.querySelector("#frame-overlaps-item").onclick = frameOverlapsMode;
document.querySelector("#border-selection-item").onclick = borderSelectionMode;


let selectedAreas = [];
let savedAreas = JSON.parse(sessionStorage.getItem("savedAreas") ?? "[]");
console.log(savedAreas);
const saveSavedAreas = () => {
  sessionStorage.setItem("savedAreas", JSON.stringify(savedAreas));
};

if (savedAreas.length == 0) {
  for (let i = 0; i < 10; i++) {
    savedAreas.push({
      name: `Test area ${i+1}`,
      type: 'geojson',
      geometry: {
        "type": "FeatureCollection",
        "name": "united_kingdom_Country_Boundary_level_1",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": [
        { "type": "Feature", "properties": { "shape1": "Northern Ireland", "shapeiso": "GB-NIR", "shapeid": "14339913B6930312138089", "shapegroup": "GBR", "shapetype": "ADM1", "shape0": "united kingdom" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ -5.976526999921077, 55.056598000097665 ], [ -5.993442000248081, 55.059413999556511 ], [ -6.020147999730341, 55.057172999634304 ], [ -6.042815000012183, 55.05566700033188 ], [ -6.055729000193139, 55.068872000442525 ], [ -6.036681000427791, 55.106579000020872 ], [ -6.028465000159599, 55.161832000246648 ], [ -6.067552000424428, 55.196554999813429 ], [ -6.139336000356082, 55.224305999822093 ], [ -6.235589000032292, 55.205505999802085 ], [ -6.335820999739326, 55.239054000042131 ], [ -6.370510000436127, 55.244235999791613 ], [ -6.407193999603351, 55.233462000271174 ], [ -6.456692999782092, 55.245420999579494 ], [ -6.479918999761992, 55.251032000226701 ], [ -6.52495299998094, 55.23440399964494 ], [ -6.538654999628477, 55.220199000183754 ], [ -6.713415999948381, 55.191651000293461 ], [ -6.737975000246024, 55.170759000027886 ], [ -6.881336999602809, 55.16938899980255 ], [ -6.959173999880136, 55.193067999988273 ], [ -6.964190000068413, 55.161832000246648 ], [ -6.994062999907499, 55.109956000169348 ], [ -7.018503000113299, 55.099046999819222 ], [ -7.018396999721688, 55.074802999658743 ], [ -7.047597000001474, 55.052161999676571 ], [ -7.149065000049688, 55.043380000286845 ], [ -7.151069999880519, 55.056491999706054 ], [ -7.180065999746034, 55.060331999622122 ], [ -7.223772999923938, 55.058123000276282 ], [ -7.248128999853407, 55.04687599962773 ], [ -7.256067999938182, 55.067035000265093 ], [ -7.28844199999827, 55.051857000000609 ], [ -7.348738999904867, 55.045491999656122 ], [ -7.390325000298503, 55.018304999576117 ], [ -7.405780999893182, 54.94964199967859 ], [ -7.445468999994318, 54.923837000377318 ], [ -7.449488000071085, 54.86733700020244 ], [ -7.48446599970606, 54.826811000127634 ], [ -7.539319000371506, 54.794015000391994 ], [ -7.549746000077789, 54.74664400032043 ], [ -7.641523000186282, 54.747392999787166 ], [ -7.749423000071374, 54.708833000442667 ], [ -7.829879999762113, 54.731520999894258 ], [ -7.85003500021503, 54.723912999785171 ], [ -7.911490999609896, 54.693026999996107 ], [ -7.900202999768567, 54.666390000098488 ], [ -7.85003500021503, 54.63863399985928 ], [ -7.80955699965574, 54.637917000069535 ], [ -7.752427000105911, 54.622993999873245 ], [ -7.714067000091916, 54.628021999715543 ], [ -7.703410999717789, 54.608287999791401 ], [ -7.786456000044325, 54.580860000288851 ], [ -7.85003500021503, 54.536827000365804 ], [ -7.937037999603945, 54.534277999729966 ], [ -7.99931399994108, 54.543801000016174 ], [ -8.015892000015754, 54.525688000201114 ], [ -8.048482000144134, 54.490078000199617 ], [ -8.160230000314243, 54.464765000204636 ], [ -8.149254999618506, 54.451175000326032 ], [ -8.151423999817666, 54.436907999804419 ], [ -8.097684000116487, 54.40539099969493 ], [ -8.054375000305981, 54.367982000369068 ], [ -8.002792000250565, 54.355553000070927 ], [ -7.981521999640506, 54.336077000353328 ], [ -7.951698000262468, 54.308769000089342 ], [ -7.872486000428523, 54.290337999998769 ], [ -7.854620000312707, 54.222321000214038 ], [ -7.845706000231701, 54.213514999717518 ], [ -7.813182000448933, 54.202740000150925 ], [ -7.692732000081719, 54.204695000374045 ], [ -7.674049000061245, 54.184721000174079 ], [ -7.632595000358947, 54.170182999745691 ], [ -7.612389000252108, 54.146029000138299 ], [ -7.578668000128062, 54.13974499993185 ], [ -7.554732999828047, 54.12465800026655 ], [ -7.525894000008066, 54.133443999840779 ], [ -7.481296000110262, 54.123880000361794 ], [ -7.450347000113936, 54.147810999578041 ], [ -7.41368200002421, 54.155023000311246 ], [ -7.421016000088287, 54.140018999976917 ], [ -7.381919000261632, 54.13881300011991 ], [ -7.388001000146005, 54.123928999923464 ], [ -7.361840999762308, 54.129110999672946 ], [ -7.318662999697608, 54.116369000229213 ], [ -7.280684000166445, 54.12436200010626 ], [ -7.256038000353385, 54.154755999689712 ], [ -7.250752000304544, 54.171229000318192 ], [ -7.256825999819966, 54.188144999791973 ], [ -7.239410999817721, 54.205863000277304 ], [ -7.147417999640936, 54.227412000263655 ], [ -7.148215999568663, 54.257348000310003 ], [ -7.174557000205368, 54.273561999786523 ], [ -7.177051000103518, 54.28551799985587 ], [ -7.208331000075532, 54.298746000127835 ], [ -7.180517999905703, 54.313941000276998 ], [ -7.187971000061566, 54.336077000353328 ], [ -7.150911999788889, 54.338151999815011 ], [ -7.116254999668456, 54.352476000267245 ], [ -7.060524999928759, 54.404978000434426 ], [ -7.028070999776787, 54.418111999968858 ], [ -6.922943000019416, 54.378534999590613 ], [ -6.902265999776034, 54.353723000216348 ], [ -6.870294000267847, 54.336077000353328 ], [ -6.864229000268097, 54.330165000214663 ], [ -6.854627999982142, 54.291135999926496 ], [ -6.874565000274515, 54.278118000345501 ], [ -6.832252999676143, 54.262826000219775 ], [ -6.814943000019412, 54.226112999715212 ], [ -6.794335000259991, 54.210012000053837 ], [ -6.737425000063638, 54.183784000131539 ], [ -6.696959000057745, 54.199402000002351 ], [ -6.643908999800431, 54.180019000076868 ], [ -6.6333339995644, 54.151171999887936 ], [ -6.657432000186589, 54.11856099969043 ], [ -6.649057999826766, 54.099479000155782 ], [ -6.657496000440005, 54.081049000111307 ], [ -6.662600000189798, 54.069901000430889 ], [ -6.627767000046958, 54.041656000124362 ], [ -6.594991000334346, 54.044673999905228 ], [ -6.579256999610777, 54.054729999589881 ], [ -6.51132700024084, 54.056055000437993 ], [ -6.474531000405307, 54.072741000097153 ], [ -6.456692999782092, 54.066218999707132 ], [ -6.438672999759092, 54.059630999870819 ], [ -6.395823999577885, 54.061483999886718 ], [ -6.364012000253581, 54.081049000111307 ], [ -6.359749999762641, 54.112176000222291 ], [ -6.342991000334337, 54.110466999652374 ], [ -6.32395999955429, 54.093085000272595 ], [ -6.291914000230861, 54.111576999578915 ], [ -6.268014999792342, 54.102336999752765 ], [ -6.202752000204612, 54.097981000322989 ], [ -6.182183999591871, 54.081049000111307 ], [ -6.168641000082062, 54.069901000430889 ], [ -6.096336000406041, 54.060290999729887 ], [ -6.085302999733585, 54.050848000434939 ], [ -6.095733999624315, 54.038987000249904 ], [ -6.065447999625462, 54.02787300033873 ], [ -6.019127000310789, 54.040960000403743 ], [ -5.965708000124039, 54.069901000430889 ], [ -5.946683999666789, 54.081049000111307 ], [ -5.896606999813116, 54.110395999975481 ], [ -5.87518300019525, 54.165088000410947 ], [ -5.884167999953206, 54.206620000112991 ], [ -5.857342000333006, 54.228664000443302 ], [ -5.821331999871859, 54.244332999968037 ], [ -5.735461999671486, 54.251382000379067 ], [ -5.689045999573182, 54.247657000370339 ], [ -5.655600999586397, 54.234165999661229 ], [ -5.637363000302173, 54.252725000258636 ], [ -5.607450000417145, 54.25660999955187 ], [ -5.562596999551829, 54.291780999993193 ], [ -5.544172999784053, 54.291144000295446 ], [ -5.540148000329907, 54.319455000048265 ], [ -5.546337999798823, 54.336077000353328 ], [ -5.558875999727547, 54.369747999970286 ], [ -5.581118000195488, 54.379684999563153 ], [ -5.644391999790912, 54.368088999907457 ], [ -5.668015000092112, 54.37228400000663 ], [ -5.642226999776199, 54.411784000431339 ], [ -5.637345000371397, 54.437801999662611 ], [ -5.64603800015351, 54.459030000134476 ], [ -5.650490999559906, 54.486881000257995 ], [ -5.668781000342847, 54.501140000410771 ], [ -5.663360000363696, 54.517656000324223 ], [ -5.703190999864717, 54.538779999597352 ], [ -5.680932000411417, 54.578339000044878 ], [ -5.558910000396168, 54.523782999585819 ], [ -5.541871999792932, 54.492384999568117 ], [ -5.536075999607647, 54.451934000253971 ], [ -5.570825000373418, 54.420157999891842 ], [ -5.574921000403776, 54.404255000368039 ], [ -5.527923999592872, 54.349024000257486 ], [ -5.504634000258875, 54.338737999858836 ], [ -5.484941000426772, 54.375071999972874 ], [ -5.464642999674652, 54.38945000021738 ], [ -5.474094000237869, 54.428317000229413 ], [ -5.443264000333329, 54.45519899973408 ], [ -5.438172000237557, 54.483504000109576 ], [ -5.466448000175035, 54.507975999992482 ], [ -5.48365300038563, 54.567995999715663 ], [ -5.520392000290542, 54.600973999750352 ], [ -5.540837999773828, 54.64938400007162 ], [ -5.587299000148676, 54.674761000319961 ], [ -5.626600000389658, 54.677265999826091 ], [ -5.675320999764267, 54.666352000144741 ], [ -5.744721000373829, 54.674392000390583 ], [ -5.803518000355382, 54.658741999943402 ], [ -5.855335999556701, 54.633770000385255 ], [ -5.912930999865694, 54.648037000007605 ], [ -5.894119000191665, 54.673312000048838 ], [ -5.868339000244646, 54.688769999735769 ], [ -5.712333999714247, 54.747603999624914 ], [ -5.7085509997288, 54.751853999562456 ], [ -5.694810000081418, 54.77000500023064 ], [ -5.693322999856491, 54.800030999930755 ], [ -5.717090999649884, 54.836763999558968 ], [ -5.760285999599148, 54.854475999767601 ], [ -5.781583999701752, 54.84865800036647 ], [ -5.77245000026727, 54.824576999628903 ], [ -5.800107999584441, 54.828479999752233 ], [ -5.806663999743762, 54.858282999960522 ], [ -5.836205999607159, 54.888962000096285 ], [ -5.878289000436951, 54.912093000191874 ], [ -5.922658999713008, 54.961063000257298 ], [ -5.978950000142333, 54.984516999959624 ], [ -5.9692040003643, 55.03689399975832 ], [ -5.976526999921077, 55.056598000097665 ] ], [ [ -7.286145000191539, 54.140204000414315 ], [ -7.292816000258142, 54.131596000055424 ], [ -7.31222599963013, 54.13003299992306 ], [ -7.319267999718363, 54.137272000102769 ], [ -7.327224999733915, 54.136169999645801 ], [ -7.338045999623148, 54.145819000346648 ], [ -7.325725999854967, 54.151170999841838 ], [ -7.310033000122814, 54.166133000037973 ], [ -7.290675999597681, 54.170581000113145 ], [ -7.281530999655843, 54.166430000244361 ], [ -7.285234000448725, 54.153389999648823 ], [ -7.295403999994562, 54.147493000201848 ], [ -7.286145000191539, 54.140204000414315 ] ] ], [ [ [ -5.51947200013268, 54.670354000336886 ], [ -5.520570000405144, 54.676849000381139 ], [ -5.534082000284059, 54.682327000290911 ], [ -5.542514999767377, 54.676923000196382 ], [ -5.530808000388845, 54.669181000203025 ], [ -5.51947200013268, 54.670354000336886 ] ] ], [ [ [ -5.631055999934404, 54.497021000219036 ], [ -5.636111000122526, 54.508297000406287 ], [ -5.631871999792907, 54.514643999920736 ], [ -5.64129199982591, 54.5210159996887 ], [ -5.651756000339105, 54.511762000116278 ], [ -5.641059999919037, 54.488158999838049 ], [ -5.631055999934404, 54.497021000219036 ] ] ], [ [ [ -6.168759000127693, 55.298270999606984 ], [ -6.174254999968241, 55.302765000004797 ], [ -6.1969749999962, 55.306536000336223 ], [ -6.220724999858817, 55.306611000197563 ], [ -6.239544999901796, 55.312369999575878 ], [ -6.255767999793306, 55.310302000437048 ], [ -6.279441999748428, 55.300638999989928 ], [ -6.28454600039754, 55.293993000176897 ], [ -6.259431999686967, 55.290467000351839 ], [ -6.227708999970332, 55.295851000423397 ], [ -6.195527999817273, 55.292143000299291 ], [ -6.190002000391985, 55.285912999885113 ], [ -6.200235000145085, 55.277527999917311 ], [ -6.199803000008387, 55.268183999791802 ], [ -6.190737000112392, 55.259676000447143 ], [ -6.182514000420724, 55.267363999748852 ], [ -6.181275999987349, 55.279137000372316 ], [ -6.168759000127693, 55.298270999606984 ] ] ] ] } }
        ]
        }
        ,
    });
    
  }
  console.log(savedAreas);
  saveSavedAreas();
}

const savedAreasContainerEle = document.querySelector("#saved-areas-container");
const savedAreasListEle = document.querySelector("#saved-areas-list");
const savedAreasSearch = document.querySelector("#saved-areas-search");

let searchedAreas = savedAreas;

const savedSearchChanged = () => {
  console.log("here");
  if(savedAreasSearch.value.length == 0){
    searchedAreas = savedAreas;
    openSavedAreas();
  }
  else{
    let tempArray = [];
    savedAreas.forEach(area => {
      if (area.name.includes(savedAreasSearch.value) == true){
        tempArray.push(area);
      }
    });
    if (tempArray != searchedAreas) {
      console.log(searchedAreas);
      searchedAreas = tempArray;
      openSavedAreas();
    }
  }
}

savedAreasSearch.addEventListener("change", savedSearchChanged)


let savedAreasOpen = false;
const openSavedAreas = () => {
  savedAreasListEle.replaceChildren();
  searchedAreas.forEach((savedArea) => {
    var tempContent = "";
    const savedAreaContainerEle = document.createElement("div");
    savedAreaContainerEle.className = "p-1.5 rounded-md bg-neutral-800 ring-1 ring-neutral-600/50 flex flex-row gap-1 flex";
    const savedAreaCheckboxEle = document.createElement("input");
    savedAreaCheckboxEle.type = "checkbox";
    savedAreaCheckboxEle.name = "saved-area-checkbox";
    savedAreaCheckboxEle.className = "w-4 h-4 my-auto text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600";
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
    savedAreaViewButtonEle.className = "ml-auto my-auto p-1 rounded-md bg-neutral-700/70 ring-1 ring-neutral-600/50";
    savedAreaEditButtonEle.className = "ml-auto my-auto p-1 rounded-md bg-neutral-700/70 ring-1 ring-neutral-600/50";
    savedAreaDeleteButtonEle.className = "ml-auto my-auto p-1 rounded-md bg-neutral-700/70 ring-1 ring-neutral-600/50";
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
    savedAreaCheckboxEle.onclick = () => {
      if (selectedAreas.includes(savedArea)){
        selectedAreas.splice(selectedAreas.indexOf(savedArea), 1);
      }
      else{
        selectedAreas.push(savedArea);
      }
    }
    savedAreaViewButtonEle.onclick = () => {
      alert(savedArea.name);
      if(savedAreaNameEle.contentEditable == 'true'){
        savedAreaNameEle.contentEditable = 'false';
        savedAreaEditButtonImageEle.src = "images/icons8-edit-90.png";
        savedAreaViewButtonImageEle.src = "images/icons8-map-90.png";
        savedAreaNameEle.textContent = tempContent;
      }
      else{

      }
    };
    savedAreaEditButtonEle.onclick = () => {
      console.log(savedAreaNameEle.contentEditable);
      if (savedAreaNameEle.contentEditable == 'false' || savedAreaNameEle.contentEditable == 'inherit'){
        tempContent = savedAreaNameEle.textContent;
        savedAreaNameEle.contentEditable = 'true';
        savedAreaNameEle.focus();
        //savedAreaNameEle.select(); either highlight or put cursor at end
        savedAreaEditButtonImageEle.src = "images/icons8-tick-30.png";
        savedAreaViewButtonImageEle.src = "images/icons8-cross-30.png";
      }
      else{
        savedAreaNameEle.contentEditable = 'false';
        savedAreaEditButtonImageEle.src = "images/icons8-edit-90.png";
        savedAreaViewButtonImageEle.src = "images/icons8-map-90.png";
        savedAreaNameEle.textContent = savedAreaNameEle.textContent.trim();
        if(savedAreaNameEle.textContent.length != 0){
          savedArea.name = savedAreaNameEle.textContent;
          saveSavedAreas();
        }
        else{
          savedAreaNameEle.textContent = tempContent;
        }
      }
    };
    savedAreaDeleteButtonEle.onclick = () => {
      if(confirm("Confirm deletion?") == true){
        savedAreas.splice(savedAreas.indexOf(savedArea), 1)
        saveSavedAreas();
        openSavedAreas();
      }
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

const importFiles = () => {
  var files = []
  const filesUploaded = document.getElementById("saved-areas-upload").files;
  for (var x = 0; x < filesUploaded.length; x++) {files.push(filesUploaded[x])}
  if(files.length != 0){
    var successes = 0;
    files.forEach(file => {
      if(file.name.endsWith(".geojson")){
        const reader = new FileReader();
        savedAreas.push({
          name: file.name.slice(0, file.name.length - 8),
          type: 'geojson',
          geometry: reader.readAsText(file),
        });
        successes++;
      }
    });
    if(successes != files.length){
      alert("Some or all files uploaded were not compatible.\nPlease only upload GEOJSON files.");
    }
    saveSavedAreas();
    openSavedAreas();
  }
}

const exportFiles = () => {
  if(selectedAreas.length == 0){
    alert("No areas selected"); //maybe change this for something less intrusive
  }
  else{
    selectedAreas.forEach(area => {
      console.log("hi");
      var link = document.createElement("a");
      //link.href
      link.setAttribute = ('download', area);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
}
const popupMessage = () => {
  let popup = document.getElementById("#snackbar-no-select");
  popup.className = "show";
  setTimeout(function(){ popup.className = popup.className.replace("show", ""); }, 3000);
}


document.querySelector("#saved-areas-upload").oninput = importFiles;
document.querySelector("#saved-areas-export-button").onclick = exportFiles;

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
    resultEle.className =
      "text-left rounded-md py-1.5 px-3 #border-0 text-sm max-w-64 bg-neutral-950/50 ring-1 ring-neutral-700/50 #ring-inset shadow-sm hover:bg-neutral-950/80";
    const resultSpanEle = document.createElement("span");
    resultSpanEle.textContent = result.LAD23NM;
    resultEle.onclick = () => {
      searchResultsContainerEle.replaceChildren();
      alert(result.LAD23CD);
    };
    // resultEle.querySelector("span").textContent = result.LAD23NM;
    resultEle.append(resultSpanEle);
    searchResultsContainerEle.append(resultEle);
  });
};

searchBarEle.oninput = updateSearchResults;
document.querySelector("#search-button").onclick = updateSearchResults;
