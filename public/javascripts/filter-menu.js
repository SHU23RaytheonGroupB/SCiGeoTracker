import { layerNames } from "./products-and-layers.js";


export function initialiseFilterMenu() {
    const filterButtonEle = document.querySelector("#filter-button");
    const filterMenuContainerEle = document.querySelector("#filter-menu-container");
    let filterMenuOpen = false;
    filterButtonEle.onclick = () => {
      if (!filterMenuOpen) {
        filterMenuContainerEle.classList.remove("hidden");
      } else {
        filterMenuContainerEle.classList.add("hidden");
      }
      filterMenuOpen = !filterMenuOpen;
    };
    document.querySelector("#filter-menu-close-button").onclick = () => {
        filterMenuContainerEle.classList.add("hidden");
    };
    const filterMissionListButtonEle = document.querySelector("#filter-mission-list-button");
    const filterMissionListContainerEle = document.querySelector("#filter-mission-list-container");
    let missionListOpen = false;
    filterMissionListButtonEle.onclick = () => {
      if (!missionListOpen) {
        filterMissionListContainerEle.classList.remove("hidden");
      } else {
        filterMissionListContainerEle.classList.add("hidden");
      }
      missionListOpen = !missionListOpen;
    };
    const filterMissionStartEle = document.querySelector("#filter-start-date");
    const filterMissionEndEle = document.querySelector("#filter-end-date");
    const filterMissionMinCoverageEle = document.querySelector("#filter-min-coverage");
    let startDate, endDate, minCoverage;
    filterMissionStartEle.onchange = (e) => {
      startDate = e.target.valueAsDate;
    };
    filterMissionEndEle.onchange = (e) => {
      endDate = e.target.valueAsDate;
    };
    filterMissionMinCoverageEle.oninput = (e) => {
      minCoverage = e.target.valueAsNumber;
      layerNames.forEach((layername) => {
        // const filter = ['>=', ['get', 'covered_area_km'], minCoverage];
        const filter = ['>=', 'covered_area_km', minCoverage];
        window.map.setFilter(layername, filter);
        console.log(window.map.getSource("product-polygons")._data.features[0].properties);
        console.log(layername, ['>=', ['get', 'covered_area_km'], minCoverage]);
      });
    };
  }
