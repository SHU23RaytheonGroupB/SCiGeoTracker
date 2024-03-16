import { displayMissionMenu } from "./mission-popout-menu.js";
import { initialiseProducts, allProducts } from "./products-and-layers.js";
import { mapStyle, minZoom, maxZoom } from "./config.js";
import { draw } from "./area-calculations.js";
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

map.on("style.load", () => {
  if (loaded) {
    initialiseProducts();
  }
});

const coordEle = document.querySelector("#coords");

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
  displayMissionMenu(currentProduct);

  // allProducts.forEach((product) => {

  // });
}

//SAVED AREAS CODE -------------------------
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

const areaSelectionInfoCloseButtonEle = document.querySelector("#area-selection-info-close-button");
areaSelectionInfoCloseButtonEle.onclick = draw.deleteAll;

//SEARCH BAR ----------------------------

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
