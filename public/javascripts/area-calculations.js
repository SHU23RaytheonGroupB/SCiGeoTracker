// //Polygon style properties
// export const draw = new MapboxDraw({
//   //USED FOR DRAW POLYGON
//   displayControlsDefault: false,
//   // Select which mapbox-gl-draw control buttons to add to the map.
//   controls: {
//     //polygon: true,
//     //trash: true,
//   },
//   // Set mapbox-gl-draw to draw by default.
//   // The user does not have to click the polygon control button first.
//   defaultMode: "draw_polygon",
//   userProperties: true,
//   styles: [
//     {
//       id: "gl-draw-polygon-fill-inactive",
//       type: "fill",
//       filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
//       paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.1 },
//     },
//     {
//       id: "gl-draw-polygon-fill-active",
//       type: "fill",
//       filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
//       paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.1 },
//     },
//     {
//       id: "gl-draw-polygon-midpoint",
//       type: "circle",
//       filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
//       paint: { "circle-radius": 3, "circle-color": "#ffffff" },
//     },
//     {
//       id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
//       type: "circle",
//       filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
//       paint: { "circle-radius": 3, "circle-color": "#ffffff" },
//     },
//     {
//       id: "gl-draw-polygon-stroke-inactive",
//       type: "line",
//       filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
//       layout: { "line-cap": "round", "line-join": "round" },
//       paint: { "line-color": "#ff0000", "line-width": 2 },
//     },
//     {
//       id: "gl-draw-polygon-stroke-active",
//       type: "line",
//       filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
//       layout: { "line-cap": "round", "line-join": "round" },
//       paint: { "line-color": "#ff0000", "line-width": 2, "line-opacity": 0.5 },
//     },
//     {
//       id: "gl-draw-line-inactive",
//       type: "line",
//       filter: ["all", ["==", "active", "false"], ["==", "$type", "LineString"], ["!=", "mode", "static"]],
//       layout: { "line-cap": "round", "line-join": "round" },
//       paint: { "line-color": "#3bb2d0", "line-width": 2 },
//     },
//     {
//       id: "gl-draw-line-active",
//       type: "line",
//       filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
//       layout: { "line-cap": "round", "line-join": "round" },
//       paint: { "line-color": "#ff0000", "line-width": 2, "line-opacity": 0.5 },
//     },
//     {
//       id: "gl-draw-point-point-stroke-inactive",
//       type: "circle",
//       filter: [
//         "all",
//         ["==", "active", "false"],
//         ["==", "$type", "Point"],
//         ["==", "meta", "feature"],
//         ["!=", "mode", "static"],
//       ],
//       paint: { "circle-radius": 5, "circle-opacity": 1, "circle-color": "#fff" },
//     },
//     {
//       id: "gl-draw-point-stroke-active",
//       type: "circle",
//       filter: ["all", ["==", "$type", "Point"], ["==", "active", "true"], ["!=", "meta", "midpoint"]],
//       paint: { "circle-radius": 5, "circle-color": "#ffffff" },
//     },
//     {
//       id: "gl-draw-point-active",
//       type: "circle",
//       filter: ["all", ["==", "$type", "Point"], ["!=", "meta", "midpoint"], ["==", "active", "true"]],
//       paint: { "circle-radius": 3, "circle-color": "#ff0000" },
//     },
//   ],
// });

const areaSelectionInfoContainerEle = document.querySelector("#area-selection-info-container");
const totalAreaContainerEle = document.querySelector("#Total-area-value-container");
const coveredAreaContainerEle = document.querySelector("#Covered-area-value-container");
const uncoveredAreaContainerEle = document.querySelector("#Uncovered-area-value-container");
const coveragePercentageContainerEle = document.querySelector("#Coverage-percentage-value-container");
const missionCountContainerEle = document.querySelector("#Mission-count-value-container");

export function updateArea(allProducts, data) {
  //USED FOR DRAW POLYGOn
  //const data = draw.getAll();

  //console.log(data.features[0].geometry.coordinates[0]);

  if (data.features[0].geometry.coordinates[0].length <= 2) {
    return;
  }
  //console.log(1);

  //console.log(data.features.length);
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
  console.log(containedMissionsInBB);
  let containedMissions = missionsWithinPolygon(containedMissionsInBB, polyCoordinates);
  console.log(containedMissions);


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
  }
}

export function updateUkArea(allProducts, UKlandBorder) {
  //diplay new layer of all the missions areas that over lap the uk
  const data = UKlandBorder;

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
  //       type: "Polygon",
  //       coordinates: [boundingBox],
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

  //bounding box is currently too big, seems to think there is an island somewhere along the -13.6 lattitude? maybe there is but very small
  let containedMissionsWithinBoundingBox = missionsWithinBoundingBox(allProducts, boundingBox);
  let containedMissions = missionsWithinPolygon(containedMissionsWithinBoundingBox, polyCoordinates);

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

function missionsWithinPolygon(boundingBoxMissions, polygon) {
  //console.log(boundingBoxMissions);
  let containedMissions = [];
  //console.log(0);
  var turfpolygon = turf.multiPolygon([[polygon]]);
  //console.log(1);

  for (let i = 0; i < boundingBoxMissions.length; i++) {
    if (boundingBoxMissions[i].centre != null) {
      const coordinatesArray = boundingBoxMissions[i].centre.split(",");
      var point = turf.point([parseFloat(coordinatesArray[1]), parseFloat(coordinatesArray[0])]);
      //console.log(i);
      if (turf.booleanPointInPolygon(point, turfpolygon)) {
        //console.log(i + ": within");
        containedMissions.push(boundingBoxMissions[i]);
        continue;
      }
    }
    console.log(containedMissions);
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

  var turfpolygon = turf.multiPolygon([polygon]);
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
