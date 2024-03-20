import { allProducts } from "./products-and-layers.js";

export function moveMap(draw) {
  draw.changeMode("simple_select");
}

export function drawPoly(draw) {
  draw.changeMode("draw_polygon");
  window.map.on("draw.create", () => updateArea(allProducts, draw.getAll()));
  window.map.on("draw.delete", () => updateArea(allProducts, draw.getAll()));
  window.map.on("draw.update", () => updateArea(allProducts, draw.getAll()));
  window.map.on("draw.selectionchange", () => updateArea(allProducts, draw.getAll()));
}
const areaSelectionInfoContainerEle = document.querySelector("#area-selection-info-container");
const areaSaveContainerEle = document.querySelector("#name-area-container");
const totalAreaContainerEle = document.querySelector("#selection-total-area-value");
const coveredAreaContainerEle = document.querySelector("#selection-covered-area-value");
const uncoveredAreaContainerEle = document.querySelector("#selection-uncovered-area-value");
const coveragePercentageContainerEle = document.querySelector("#selection-coverage-percentage-value");
const missionCountContainerEle = document.querySelector("#selection-total-missions-value");

export var polygonData = "";

export function updateArea(allProducts, data) {
  //USED FOR DRAW POLYGOn
  //const data = draw.getAll();
  if (data.features[0].geometry.coordinates[0].length <= 2) {
    return;
  }
  
  //console.log(1);
  //console.log(data.features.length);
  polygonData = data;
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

  let containedMissionsInBB = missionsWithinBoundingBox(allProducts, boundingBox);
  //console.log(containedMissionsInBB);
  let containedMissions = missionsWithinPolygon(containedMissionsInBB, [[polyCoordinates]]);
  //console.log(containedMissions);
  if (data.features.length > 0) {
    //console.log("start for real");
    //console.log(data);

    const totalArea = turf.area(data) / 1000000; //divide by 1000 to get square km
    const totalAreaRounded = Math.round(totalArea * 100) / 100; //convert area to 2 d.p.
    const coveredArea = Math.min(calculateMissionCoverage(containedMissions, [[polyCoordinates]]), totalAreaRounded);
    const uncoveredArea = Math.round((totalArea - coveredArea) * 100) / 100;
    const coveragePercentage = Math.round((coveredArea / (coveredArea + uncoveredArea)) * 10000) / 100; //area as a % to 2 d.p.
    const missionCount = containedMissions.length;
    areaSelectionInfoContainerEle.style.display = "inline";
    totalAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${totalAreaRounded}</td>`;
    coveredAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${coveredArea}</td>`;
    uncoveredAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${uncoveredArea}</td>`;
    coveragePercentageContainerEle.innerHTML = `<td class="font-light text-neutral-400">${coveragePercentage}</td>`;
    missionCountContainerEle.innerHTML = `<td class="font-light text-neutral-400">${missionCount}</td>`;
  } else {
    areaSelectionInfoContainerEle.style.display = "none";
    areaSaveContainerEle.classList.add("hidden");

  }
}

export function updateUkArea() {
  //diplay new layer of all the missions areas that over lap the uk
  const data = window.map.getSource("uk-land")._data;

  //console.log(data.features[0].geometry.coordinates)
  let polyCoordinates = [];
  let polyCoordinatesLat = [];
  let polyCoordinatesLog = [];

  for (let i = 0; i < data.features[0].geometry.coordinates.length; i++) {
    //bcs the uk is a multigon we need to iterate through each island
    for (let k = 0; k < data.features[0].geometry.coordinates[i][0].length; k++) {
      polyCoordinates.push(data.features[0].geometry.coordinates[i][0][k]);
      polyCoordinatesLog.push(data.features[0].geometry.coordinates[i][0][k][1]);
      polyCoordinatesLat.push(data.features[0].geometry.coordinates[i][0][k][0]);
    }
  }
  //bounding box is (Latt, Long) and has a padding of (±0.8 and ±0.9)
  let boundingBox = [
    [Math.min(...polyCoordinatesLat) - 0.8, Math.min(...polyCoordinatesLog) - 0.5], //bottom left
    [Math.min(...polyCoordinatesLat) - 0.8, Math.max(...polyCoordinatesLog) + 0.5], //top left
    [Math.max(...polyCoordinatesLat) + 0.8, Math.max(...polyCoordinatesLog) + 0.5], //top right
    [Math.max(...polyCoordinatesLat) + 0.8, Math.min(...polyCoordinatesLog) - 0.5], //bottom right
    [Math.min(...polyCoordinatesLat) - 0.8, Math.min(...polyCoordinatesLog) - 0.5], //bottom left (wrap around)
  ];

  //console.log(boundingBox[1]);

  // map.addSource("title", {
  //   type: "geojson",
  //   data: {
  //     type: "Feature",
  //     geometry: {
  //       type: "MultiPolygon",
  //       coordinates: data.features[0].geometry.coordinates,
  //     },
  //   },
  // });
  // map.addLayer({
  //   id: "title" + "fill",
  //   type: "fill",
  //   source: "title", // reference the data source
  //   layout: {},
  //   paint: {
  //     "fill-color": "#FF0000",
  //     "fill-opacity": 0.3,
  //   },
  // });
  //console.log(map.getSource("UkLandBorder"));
  if (map.getSource("UkLandBorder") == undefined) {
    //console.log(1);
    window.map.addSource("UkLandBorder", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: data.features[0].geometry.coordinates,
        },
      },
    });

    window.map.addLayer({
      id: `UkLandBorder-border-outline`,
      type: "line",
      source: "UkLandBorder",
      layout: {
        visibility: "visible",
      },
      paint: {
        "line-width": 1,
        "line-opacity": 0.25,
        "line-color": "#FFFFFF",
      },
    });
  } else {
    map.setLayoutProperty("UkLandBorder-border-outline", "visibility", "visible");
  }


  //bounding box is currently too big, seems to think there is an island somewhere along the -13.6 lattitude? maybe there is but very small
  let containedMissionsWithinBoundingBox = missionsWithinBoundingBox(allProducts, boundingBox);
  let containedMissions = missionsWithinPolygon(containedMissionsWithinBoundingBox, data.features[0].geometry.coordinates);

  const area = turf.area(data) / 1000000; //divide by 1000 to get square km
  const rounded_area = Math.round(area * 100) / 100; //convert area to 2 d.p.
  const Covered_area = calculateMissionCoverage(containedMissions, data.features[0].geometry.coordinates);
  const Uncovered_area = Math.round((area - Covered_area) * 100) / 100;
  const Coverage_percentage = Math.round((Covered_area / (Covered_area + Uncovered_area)) * 10000) / 100; //area as a % to 2 d.p.
  const Mission_count = containedMissions.length;

  areaSelectionInfoContainerEle.style.display = "inline";
  totalAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${rounded_area}</td>`;
  coveredAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Covered_area}</td>`;
  uncoveredAreaContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Uncovered_area}</td>`;
  coveragePercentageContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Coverage_percentage}</td>`;
  missionCountContainerEle.innerHTML = `<td class="font-light text-neutral-400">${Mission_count}</td>`;
}

function missionsWithinBoundingBox(allMissons, polygon) {
  let containedMissions = [];
  var turfpolygon = turf.polygon([polygon]);

  for (let i = 0; i < allMissons.length; i++) {
    if (allMissons[i].centre != null) {
      // temporarly missions without a center cannot be added to
      const coordinatesArray = allMissons[i].centre.split(",");
      var point = turf.point([parseFloat(coordinatesArray[1]), parseFloat(coordinatesArray[0])]);
      if (turf.booleanPointInPolygon(point, turfpolygon)) {
        containedMissions.push(allMissons[i]);
      }
    }
  }
  return containedMissions;
}
var layer = 0;
function missionsWithinPolygon(boundingBoxMissions, polygon) {
  //console.log(boundingBoxMissions);
  let containedMissions = [];
  layer++;
  

  var turfpolygon = turf.multiPolygon(polygon);
  //console.log(boundingBoxMissions);
  for (let i = 0; i < boundingBoxMissions.length; i++) {
    if (boundingBoxMissions[i].centre != null) {
      const coordinatesArray = boundingBoxMissions[i].centre.split(",");
      var point = turf.point([parseFloat(coordinatesArray[1]), parseFloat(coordinatesArray[0])]);
      if (turf.booleanPointInPolygon(point, turfpolygon)) {
        //console.log(i + ": within");
        containedMissions.push(boundingBoxMissions[i]);
        continue;
      }
    }
    //console.log(containedMissions);
    for (let k = 0; k < boundingBoxMissions[i].footprint.coordinates[0].length; k++) {
      //console.log(i + " + " + k);

      var point = turf.point(
        boundingBoxMissions[i].footprint.coordinates[0][k],
        boundingBoxMissions[i].footprint.coordinates[0][k]
      );
      //console.log(boundingBoxMissions[i].footprint.coordinates[0][k][0] + ", " + boundingBoxMissions[i].footprint.coordinates[0][k][0]);
      if (turf.booleanPointInPolygon(point, turfpolygon)) {
        //console.log(i + " + " + k + ": within");
        containedMissions.push(boundingBoxMissions[i]);
        break;
      }
    }
    //console.log(i);
  }
  //console.log("done");

  //console.log(containedMissions);

  return containedMissions;
}

function calculateMissionCoverage(allMissons, polygon) {
  if (allMissons.length == 0) {
    return 0;
  }

  var polygonMissions = [];
  for (let i = 0; i < allMissons.length; i++) {
    polygonMissions.push(allMissons[i].footprint.coordinates[0]);
  }

  var fcMissions = [];

  for (let i = 0; i < polygonMissions.length; i++) {
    //console.log(polygonMissions[i]);
    var feature = {
      type: "Feature",
      properties: { name: i },
      geometry: {
        type: "Polygon",
        coordinates: [polygonMissions[i]],
      },
    };
    //console.log(feature);

    fcMissions.push(feature);
  }
  //console.log(fcMissions);

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

  var turfpolygon = turf.multiPolygon(polygon);

  var fcMissionsWithinPoly = [];
  //console.log("abc");
  for (let i = 0; i < fcMissions.length; i++) {
    var intersection = turf.intersect(turf.polygon(fcMissions[i].geometry.coordinates), turfpolygon);
    if (intersection) {
        if (intersection.geometry.type === 'MultiPolygon') {
            // If the intersection is a MultiPolygon, loop through each polygon
            for (let j = 0; j < intersection.geometry.coordinates.length; j++) {
                var feature = {
                    type: "Feature",
                    properties: { name: i },
                    geometry: {
                        type: "Polygon", // Each feature should be a Polygon, not MultiPolygon
                        coordinates: intersection.geometry.coordinates[j], // Use the coordinates of each polygon
                    },
                };
                fcMissionsWithinPoly.push(feature);
            }
        } else {
            // If the intersection is a single Polygon
            var feature = {
                type: "Feature",
                properties: { name: i },
                geometry: {
                    type: "Polygon",
                    coordinates: intersection.geometry.coordinates,
                },
            };
            fcMissionsWithinPoly.push(feature);
        }
    }
}

  if (map.getSource('mission-area-within-poly') != undefined) {
    map.removeSource('mission-area-within-poly');
  } 
  
  window.map.addSource('mission-area-within-poly', {
    'type': 'geojson',
    'data': {
        'type': 'FeatureCollection',
        'features': fcMissionsWithinPoly
    }
  });

  //console.log(map.getSource('mission-area-within-poly'));
  if (map.getLayer('mission-area-within-polyfill') != undefined) {
    map.removeLayer('mission-area-within-polyfill');
  }
  
  window.map.addLayer({
    id: 'mission-area-within-polyfill',
    type: "fill",
    source: "mission-area-within-poly", // reference the data source
    layout: {
      visibility: "visible",
    },
    paint: {
        "fill-color": "#FF0000",
        "fill-opacity": 0.7,
    },
  });

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
    //console.log(fcMissionIntersects[i]);
    var intersection = turf.intersect(turf.polygon(fcMissionIntersects[i].geometry.coordinates), turfpolygon);

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

  // window.map.addSource('test4', {
  //   'type': 'geojson',
  //   'data': {
  //       'type': 'FeatureCollection',
  //       'features': fcMissionIntersectsWithinPoly
  //   }
  // });

  // window.map.addLayer({
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
    if (fcMissionsWithinPoly[i].geometry.coordinates[0].length == 1) {
      areaCoveredWithOverlaps += turf.area(turf.polygon(fcMissionsWithinPoly[i].geometry.coordinates[0]));
    } else {
      areaCoveredWithOverlaps += turf.area(turf.polygon(fcMissionsWithinPoly[i].geometry.coordinates));

    }
  }

  var areaCoveredByOverlaps = 0;
  for (let i = 0; i < fcMissionIntersectsWithinPoly.length; i++) {
    //console.log(turf.area(turf.polygon(fcMissionIntersectsWithinPoly[i].geometry.coordinates)));
    areaCoveredByOverlaps += turf.area(turf.polygon(fcMissionIntersectsWithinPoly[i].geometry.coordinates));
  }
  var area = areaCoveredWithOverlaps - areaCoveredByOverlaps; //currently in m^2
  area /= 1000000; //divide by 1000 to get square km
  //console.log(area);

  var rounded_area = Math.round(area * 100) / 100; //convert area to 2 d.p.

  //console.log(rounded_area);
  return rounded_area;
}

function savePolygon(){
  
}