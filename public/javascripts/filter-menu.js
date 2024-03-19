export function initialiseFilterMenu() {
    const filterButtonEle = document.querySelector("#filter-button");
    const filterMenuContainerEle = document.querySelector("#filter-menu-container");
    filterButtonEle.onclick = () => {
        filterMenuContainerEle.style.display = null;
    };
    document.querySelector("#filter-menu-close-button").onclick = () => {
        filterMenuContainerEle.style.display = "none";
    };
}