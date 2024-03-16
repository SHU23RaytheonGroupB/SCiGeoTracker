import { updateUkArea, updateArea, draw } from "./area-calculations.js";
import { initialiseLayerMenu } from "./products-and-layers.js";
import { mapStyle, MapStyle, minZoom, maxZoom, CursorMode } from "./config.js";

let cursorMode;
let darkMode = sessionStorage.getItem("dark") == "true" ?? true;

const moveButtonEle = document.querySelector("#move-button");
const rectangleButtonEle = document.querySelector("#rectangle-button");
const polygonButtonEle = document.querySelector("#polygon-button");
const cursorSelectedClasses = [
  "dark:bg-neutral-700",
  "dark:hover:bg-neutral-600/90",
  "bg-neutral-200/90",
  "hover:bg-neutral-200/30",
];

const zoomScrollButtonEle = document.querySelector("#zoom-scroll-button");
var barTop = 0,
  barBottom = 0;

export function initialiseControls() {
  let polygonButton = document.getElementById("polygon-button");
  polygonButton.addEventListener("click", drawPoly);

  let infoCloseButton = document.getElementById("area-selection-info-close-button");
  infoCloseButton.addEventListener("click", closeInfo);

  let infoMoveButton = document.getElementById("move-button");
  infoMoveButton.addEventListener("click", moveMap);

  initialiseStyleMenu();
  initialiseLayerMenu();
  initialiseCursorButtons();
  initialiseSavedAreas();
  initialiseZoomButtons();
  initialiseSearchBar();
}

export function renderOverlaysZoom() {
  const zoomPercentage = ((window.map.getZoom() - minZoom) / (maxZoom - minZoom)) * 100;
  zoomScrollButtonEle.style.top = `${100 - zoomPercentage}%`;
}

function setZoomByPercentage(percentage) {
  percentage = Math.min(100, Math.max(0, percentage));
  window.map.setZoom((percentage / 100) * (maxZoom - minZoom) + minZoom);
}

function dragMouseDown(e) {
  e.preventDefault();
  const boundingRect = zoomScrollButtonEle.parentElement.getBoundingClientRect();
  barTop = boundingRect.top + 12;
  barBottom = boundingRect.bottom - 12;
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
}

function elementDrag(e) {
  e.preventDefault();
  setZoomByPercentage(((barBottom - e.clientY) / (barBottom - barTop)) * 100);
}

function closeDragElement() {
  document.onmouseup = null;
  document.onmousemove = null;
}

function closeInfo() {
  document.getElementById("area-selection-info-container").style.display = "none";
}

function moveMap() {
  draw.changeMode("simple_select");
}

function drawPoly() {
  draw.changeMode("draw_polygon");
  window.map.on("draw.create", updateArea);
  window.map.on("draw.delete", updateArea);
  window.map.on("draw.update", updateArea);
  window.map.on("draw.selectionchange", updateArea);
}

function initialiseStyleMenu() {
  const styleMenuButtonEle = document.querySelector("#style-menu-button");
  const styleMenuItemsContainerEle = document.querySelector("#style-menu-items-container");
  const styleMenuButtonTextEle = document.querySelector("#style-menu-button-text");
  let styleMenuOpen = false;
  const openStyleMenu = () => {
    styleMenuOpen = true;
    styleMenuItemsContainerEle.style.display = null;
    styleMenuItemsContainerEle.focus();
  };
  const closeStyleMenu = () => {
    styleMenuOpen = false;
    styleMenuItemsContainerEle.style.display = "none";
  };
  styleMenuButtonEle.onclick = () => {
    if (!styleMenuOpen) openStyleMenu();
    else closeStyleMenu();
  };
  styleMenuItemsContainerEle.focusout = () => {
    closeStyleMenu();
  };

  const darkStyle = () => {
    mapStyle.currentStyle = MapStyle.Dark;
    styleMenuButtonTextEle.textContent = "Dark";
    closeStyleMenu();
    map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
  };

  const lightStyle = () => {
    mapStyle.currentStyle = MapStyle.Light;
    styleMenuButtonTextEle.textContent = "Light";
    closeStyleMenu();
    map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
  };

  const satelliteStyle = () => {
    mapStyle.currentStyle = MapStyle.Satellite;
    styleMenuButtonTextEle.textContent = "Satellite";
    closeStyleMenu();
    map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
  };

  const topoStyle = () => {
    mapStyle.currentStyle = MapStyle.Outdoors;
    styleMenuButtonTextEle.textContent = "Topology";
    closeStyleMenu();
    map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
  };

  document.querySelector("#dark-item").onclick = darkStyle;
  document.querySelector("#light-item").onclick = lightStyle;
  document.querySelector("#satellite-item").onclick = satelliteStyle;
  document.querySelector("#topo-item").onclick = topoStyle;

  document.querySelector("#theme-button").onclick = () => setDarkMode(!darkMode);

  setDarkMode(darkMode);
  darkStyle();
}

function setDarkMode(enabled) {
  darkMode = enabled;
  sessionStorage.setItem("dark", darkMode ? "true" : "false");
  if (darkMode) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

function initialiseCursorButtons() {
  const selectMoveCursor = () => {
    cursorMode = CursorMode.Move;
    deselectAllCursors();
    moveButtonEle.classList.add(...cursorSelectedClasses);
  };

  const selectRectangleCursor = () => {
    cursorMode = CursorMode.Rectangle;
    deselectAllCursors();
    rectangleButtonEle.classList.add(...cursorSelectedClasses);
  };

  const selectPolygonCursor = () => {
    cursorMode = CursorMode.Polygon;
    deselectAllCursors();
    polygonButtonEle.classList.add(...cursorSelectedClasses);
  };

  moveButtonEle.onclick = selectMoveCursor;
  rectangleButtonEle.onclick = selectRectangleCursor;
  polygonButtonEle.onclick = selectPolygonCursor;
  selectMoveCursor();
}

function deselectAllCursors() {
  moveButtonEle.classList.remove(...cursorSelectedClasses);
  rectangleButtonEle.classList.remove(...cursorSelectedClasses);
  polygonButtonEle.classList.remove(...cursorSelectedClasses);
}

function initialiseSavedAreas() {
  // ... (move the saved areas code here)
}

function initialiseZoomButtons() {
  zoomScrollButtonEle.onmousedown = dragMouseDown;

  document.querySelector("#zoom-in-button").onclick = () => window.map.zoomIn();
  document.querySelector("#zoom-out-button").onclick = () => window.map.zoomOut();
}

function initialiseSearchBar() {
  // ... (move the search bar code here)
}
