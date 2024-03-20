export function initialiseFilterMenu() {
    const filterButtonEle = document.querySelector("#filter-button");
    const filterMenuContainerEle = document.querySelector("#filter-menu-container");
    let filterMenuOpen = false;
    filterButtonEle.onclick = () => {
      if (!filterMenuOpen) {
        filterMenuContainerEle.style.display = null;
      } else {
        filterMenuContainerEle.style.display = "none";
      }
      filterMenuOpen = !filterMenuOpen;
    };
    document.querySelector("#filter-menu-close-button").onclick = () => {
        filterMenuContainerEle.style.display = "none";
    };
    const filterMissionListButtonEle = document.querySelector("#filter-mission-list-button");
    const filterMissionListContainerEle = document.querySelector("#filter-mission-list-container");
    let missionListOpen = false;
    filterMissionListButtonEle.onclick = () => {
      if (!missionListOpen) {
        filterMissionListContainerEle.style.display = null;
      } else {
        filterMissionListContainerEle.style.display = "none";
      }
      missionListOpen = !missionListOpen;
    };
  }
