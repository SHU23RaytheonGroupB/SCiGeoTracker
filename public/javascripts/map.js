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

map.on("load", async () => {
  renderOverlaysZoom();
  updateScaleBar();
  initialiseControls();
  await initialiseProducts();
  console.log(allProducts);

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

export async function circleLinkZoom(uniqueID) {
  let reset = document.querySelectorAll("circle");
  reset.forEach((reset) => {
    reset.style.fill = "red";
  });

  let missionGroup;
  let currentProduct;
  sceneIDs.length = 0;
  allProducts.forEach((product) => {
    if (product.identifier === uniqueID) {
      missionGroup = product.title.split(" ")[0];
      currentProduct = product;
      map.flyTo({
        center: product.centre.split(",").reverse(),
        zoom: 12,
        essential: true,
      });
    }
  });
  let circleGroup = document.querySelectorAll('circle[mission="' + missionGroup + '"]');
  console.log(circleGroup);
  circleGroup.forEach((circle) => {
    circle.style.fill = "blue";
    sceneIDs.push(circle.getAttribute("sceneID"));
  });

  displayMissionMenu(currentProduct);

  for (let i = 0; i <= sceneIDs.length - 1; i++) {
    console.log(`sceneID: ${sceneIDs[i]}`);
  }
}

let viewMissionButton = document.getElementById("flyto-mission-info-view-button");
viewMissionButton.addEventListener("click", viewSelectedMission);

function viewSelectedMission() {
  let missionID = document.getElementById("flyto-mission-mission-id").textContent;

  console.log("Mission Group:", missionID);
  for (let i = 0; i <= sceneIDs.length - 1; i++) {
    console.log(`sceneID: ${sceneIDs[i]}`);
  }

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

  // fetch("/api/getFrames", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ missionID, sceneIDs }),
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     // Handle the response data from the backend
  //     console.log(data);
  //   })
  //   .catch((error) => {
  //     // Handle any errors
  //     console.error("Error:", error);
  //   });
}
