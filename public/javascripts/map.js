import { displayMissionMenu } from "./mission-popout-menu.js";
import { initialiseProducts, allProducts } from "./products-and-layers.js";
import { mapStyle, minZoom, maxZoom } from "./config.js";
import { getRoundNum, getDistance } from "./utils.js";
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
import { createHistogramChart } from "./histogram-popout.js";

let loaded = false;
let sceneIDs = [];
let missionID;

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
  document.querySelector("#timeline-container").appendChild(timeline.element);

  loaded = true; //used so style is not loaded before data is requested
  createHistogramChart();
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

export async function circleLinkZoom(productID) {
  let reset = document.querySelectorAll("circle");
  reset.forEach((reset) => {
    reset.style.fill = "red";
  });

  let missionName;
  let currentProduct;
  sceneIDs.length = 0;
  allProducts.forEach((product) => {
    if (product.identifier === productID) {
      missionName = product.title.split(" ")[0];
      missionID = product.missionid;
      currentProduct = product;
      map.flyTo({
        center: product.centre.split(",").reverse(),
        zoom: 12,
        essential: true,
      });
    }
  });
  let circleGroup = document.querySelectorAll('circle[mission="' + missionName + '"]');
  circleGroup.forEach((circle) => {
    circle.style.fill = "blue";
  });

  displayMissionMenu(currentProduct);
}

let viewMissionButton = document.getElementById("flyto-mission-info-view-button");
viewMissionButton.addEventListener("click", () => viewSelectedMission());

//TO DO - CLEAN UP CODEBASE, MOVE API CALLS TO BACKEND, RESTRUCTURE. CHECK IF TIMELINE CODE CAN BE CLEANED UP (DONT WASTE TOO MUCH TIME ON)
function viewSelectedMission() {
  fetch("/api/getMissionInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ missionID }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response data from the backend
      console.log(data);
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
}
