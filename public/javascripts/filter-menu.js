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
  }
