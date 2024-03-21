import { displayMissionMenu } from "./mission-popout-menu.js";
import { initialiseProducts, allProducts } from "./products-and-layers.js";
import { mapStyle, minZoom, maxZoom } from "./config.js";
import { getRoundNum, getDistance } from "./utils.js";
import { initialiseControls, renderOverlaysZoom } from "./map-controls.js";
import { Timeline } from "./zoomable-timeline-with-items.js";
import { createHistogramChart } from "./histogram-popout.js";
import { calculateMissionCoverage } from "./area-calculations.js";

mapboxgl.accessToken = "pk.eyJ1IjoiZ3JhY2VmcmFpbiIsImEiOiJjbHJxbTJrZmgwNDl6MmtuemszZWtjYWh5In0.KcHGIpkGHywtjTHsL5PQDQ";
window.map = new mapboxgl.Map({
  container: "map", // container ID
  style: `mapbox://styles/mapbox/${mapStyle.currentStyle}`, // style URL
  center: [-5, 55], // starting position
  zoom: 5, // starting zoom
  minZoom: minZoom,
  maxZoom: maxZoom,
  attributionControl: false,
});


var mostRecentHover;
let loaded = false;

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on("load", async () => {
  renderOverlaysZoom();
  updateScaleBar();
  initialiseControls();
  await initialiseProducts();

  const START_DATE = new Date(1558231200000);
  const END_DATE = new Date(1593914400000);

  const from = START_DATE;
  const until = END_DATE;
  const timeline = Timeline({ from, until });
  document.querySelector("#timeline").appendChild(timeline.element);

  loaded = true; //used so style is not loaded before data is requested
});

map.on("style.load", async () => {
  if (loaded) {
    await initialiseProducts();
  }
});

function updateScaleBar() {
  const y = map.getCanvas().clientHeight / 2;
  const maxMeters = getDistance(map.unproject([0, y]), map.unproject([100, y]));
  const meters = getRoundNum(maxMeters);
  const ratio = meters / maxMeters;

  const scaleBarInner = document.getElementById("scale-bar-inner");
  const scaleBarLabel = document.getElementById("scale-bar-label");

  scaleBarInner.style.width = 100 * ratio + "px";
  scaleBarLabel.textContent = meters < 1000 ? meters + " m" : (meters / 1000).toFixed(1) + " km";
}

const coordEle = document.querySelector("#coords");

map.on("mousemove", (ev) => {
  const { lng, lat } = ev.lngLat;
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
});

map.on("zoom", (ev) => {
  renderOverlaysZoom();
  updateScaleBar();
});

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
}

map.on('mouseenter', 'product-polygons-frames-fill', (e) => {
  map.getCanvas().style.cursor = 'pointer';
  mostRecentHover = e;
  const coordinates = e.features[0].geometry.coordinates[0].slice();
  var eProps = e.features[0].properties;
  var start = new Date(eProps.date_start).toString();
  start = start.split(" ").slice(0, -4).join(" ");
  var end = new Date(eProps.date_end).toString();
  end = end.split(" ").slice(0, -4).join(" ");
  var newE = {
    footprint: {
      type: "Polygon",
      coordinates: [coordinates]
    },
  };
 
  var multis = calculateMissionCoverage([newE], window.map.getSource("uk-land")._data.features[0].geometry.coordinates) 
  const totalArea = turf.area(window.map.getSource("uk-land")._data) / 1000000; //divide by 1000 to get square km
  const coveragePercentage = Math.round((multis / totalArea) * 10000) / 1000;

  var description = `Name: ${eProps.title}<br>Mission started: ${ start }<br>Mission ended: ${ end }<br>Land coverage (%): ${ coveragePercentage }`;

  var lng = 0;
  var lat = coordinates[0][1];
  coordinates.forEach(c => {
    lng += c[0];
    if(c[1] > lat){
      lat = c[1];
    }
  });
  lng = lng / coordinates.length;
  const newCoords = [lng, lat];

  popup.setLngLat(newCoords).setHTML(description).addTo(map);
});

map.on('mouseleave', 'product-polygons-frames-fill', () => {
  map.getCanvas().style.cursor = '';
  popup.remove();
  if (window.map.getSource('mission-area-within-poly') != undefined) {
    window.map.removeLayer('mission-area-within-polyfill');
    window.map.removeSource('mission-area-within-poly');
  } 
});

map.on('click', 'product-polygons-frames-fill', (e) => {
  var cent = e.lngLat;
  var item = mostRecentHover.features[0]._geometry.coordinates[0];
  if(item.length > 0){
    var lg = 0;
    var lt = 0;
    for(var x = 0; x < item.length; x++){
      lg += item[x][0];
      lt += item[x][1];
    }
    lg = lg / item.length;
    lt = lt / item.length;
    cent = [lg, lt];
  }
  map.flyTo({
    center: cent,
    zoom: 10.5,
    essential: true,
  });
});

map.on('mouseenter', 'product-cluster-density', () => {
  map.getCanvas().style.cursor = 'pointer';
});


map.on('mouseleave', 'product-cluster-density', () => {
  map.getCanvas().style.cursor = '';
});


map.on('click', 'product-cluster-density', (e) => {
  var features = map.queryRenderedFeatures(e.point, { layers: ['product-cluster-density'] });
  console.log(features[0].properties);  
  var points = 14 - features[0].properties.point_count;
  if(points < 5) points = 5;
  if (points != 1){
  map.easeTo({
    center: features[0].geometry.coordinates,
    zoom: points,
    essential: true
  });
  }
});