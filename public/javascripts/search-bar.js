import { boundariesByRegion, allProducts } from "./products-and-layers.js";
import { forwardPolyGeocode } from "./geocoder.js";
import { updateArea } from "./area-calculations.js";

const searchResultsContainerEle = document.querySelector("#search-results-container");
const searchBarEle = document.querySelector("#search-bar");
const areaViewInfoContainerEle = document.querySelector("#area-view-info-container");
//const areaSelectionInfoContainerEle = document.querySelector("#area-selection-info-container");

export function initialiseSearchBar() {
  document.querySelector("#area-selection-info-close-button").onclick = () => {
    areaViewInfoContainerEle.classList.remove("hidden");
    window.map.setMaxBounds(null);
    window.map.removeLayer("mask-fill");
    window.map.removeLayer("mask-outline");
    window.map.removeSource("mask");
    console.log(2);
  };

  searchBarEle.onkeydown = (e) => {
    if (e.keyCode == 13) {
      // enter key
      updateSearchResults();
    }
  };
  document.querySelector("#search-button").onclick = updateSearchResults;
}

const updateSearchResults = async () => {
  searchResultsContainerEle.replaceChildren();
  const searchQuery = searchBarEle.value.toLowerCase().trim();
  if (searchQuery.length == 0) return;
  const results = await forwardPolyGeocode(searchQuery);
  results.forEach((result) => {
    const resultEle = document.createElement("button");
    resultEle.type = "button";
    resultEle.className = `text-left rounded-md py-1.5 px-3 #border-0 text-sm max-w-64 ring-1 ring-inset shadow-sm
      dark:bg-neutral-950/50 dark:ring-neutral-700/50 dark:hover:bg-neutral-950/80
      bg-neutral-100/80 ring-neutral-400/50 hover:bg-neutral-200/90`;
    const resultSpanEle = document.createElement("span");
    resultSpanEle.textContent = result.display_name;
    resultEle.onclick = () => gotoFeatureByResult(result);
    resultEle.append(resultSpanEle);
    searchResultsContainerEle.append(resultEle);
  });
};

const gotoFeatureByResult = (result) => {
  console.log(result);
  searchResultsContainerEle.replaceChildren();
  const feature = turf.feature(result.geojson);
  const boundingBox = turf.bbox(feature);
  map.addSource("mask", {
    type: "geojson",
    data: turf.mask(feature),
  });
  map.addLayer({
    id: "mask-fill",
    source: "mask",
    type: "fill",
    paint: {
      "fill-color": "black",
      "fill-opacity": 0.5,
    },
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
  window.map.fitBounds(bounds, {
    padding: 50,
    animate: false,
  });
  window.map.setMaxBounds(window.map.getBounds());
  //areaSelectionInfoContainerEle.style.display = "inline";
  // const totalAreaContainerEle = document.querySelector("#view-total-area-value");
  // const coveredAreaContainerEle = document.querySelector("#view-covered-area-value");
  // const uncoveredAreaContainerEle = document.querySelector("#view-uncovered-area-value");
  // const coveragePercentageContainerEle = document.querySelector("#view-coverage-percentage-value");
  // const missionCountContainerEle = document.querySelector("#view-total-missions-value");
  //console.log(feature);
  var fc = turf.featureCollection([feature]);
  updateArea(allProducts, fc);
  // totalAreaContainerEle.textContent = totalAreaRounded;
  // coveredAreaContainerEle.textContent = coveredArea;
  // uncoveredAreaContainerEle.textContent = uncoveredArea;
  // coveragePercentageContainerEle.textContent = coveragePercentage;
  // missionCountContainerEle.textContent = missionCount;
};
