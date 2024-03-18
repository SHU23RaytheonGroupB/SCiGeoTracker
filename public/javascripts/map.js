import { displayMissionMenu } from "./mission-popout-menu.js";
import { initialiseProducts, allProducts } from "./products-and-layers.js";
import { mapStyle, minZoom, maxZoom } from "./config.js";
import { initialiseControls, renderOverlaysZoom } from "./map-controls.js";

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

import { Timeline } from "./zoomable-timeline-with-items.js";

let loaded = false;

map.on("load", async () => {
  renderOverlaysZoom();
  initialiseControls();
  await initialiseProducts();

  const START_DATE = new Date(1558231200000);
  const END_DATE = new Date(1593914400000);

  const from = START_DATE;
  const until = END_DATE;
  const timeline = Timeline({ from, until });
  document.querySelector("#timeline-container").appendChild(timeline.element);

  loaded = true; //used so style is not loaded before data is requested
});

map.on("style.load", async () => {
  if (loaded) {
    await initialiseProducts();
  }
});

const scale = new mapboxgl.ScaleControl({
  maxWidth: 80,
  unit: "metric",
  position: "bottom-right",
});
map.addControl(scale);

const coordEle = document.querySelector("#coords");
const scaleEle = document.querySelector("#scale");

scaleEle.textContent = `${scale}`;

map.on("mousemove", (ev) => {
  const { lng, lat } = ev.lngLat;
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
});

map.on("zoom", (ev) => {
  renderOverlaysZoom();
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
  displayMissionMenu(currentProduct, true);

  // allProducts.forEach((product) => {

  // });
}
