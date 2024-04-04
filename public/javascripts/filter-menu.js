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
    const updateFilter = () => {
      layerNames.forEach((layername) => {
        const filter = [
          'all',
        ];
        if (minCoverage && minCoverage > 0) {
          filter.push(['>=', 'covered_area_km', minCoverage]);
        }
        if (startDate) {
          filter.push(['>=', 'date_end', startDate.getTime()]);
        }
        if (endDate) {
          filter.push(['<=', 'date_start', endDate.getTime()]);
        }
        window.map.setFilter(layername, filter);
      });
    };
    filterMissionStartEle.onchange = (e) => {
      startDate = e.target.valueAsDate;
      updateFilter();
    };
    filterMissionEndEle.onchange = (e) => {
      endDate = e.target.valueAsDate;
      endDate.setUTCHours(23, 59, 59, 999);
      updateFilter();
    };
    filterMissionMinCoverageEle.oninput = (e) => {
      minCoverage = e.target.valueAsNumber;
      updateFilter();
    };
  }
