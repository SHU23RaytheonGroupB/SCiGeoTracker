import { drawPoly, moveMap } from "./area-calculations.js";
import { initialiseLayerMenu } from "./products-and-layers.js";
import { mapStyle, MapStyle, minZoom, maxZoom, CursorMode } from "./config.js";
import { initialiseSavedAreas } from "./saved-areas.js";
import { initialiseSearchBar } from "./search-bar.js";

let cursorMode;
let darkMode = sessionStorage.getItem("dark") == "true" ?? true;
setDarkMode(darkMode);
const styleMenuButtonEle = document.querySelector("#style-menu-button");
const styleMenuItemsContainerEle = document.querySelector("#style-menu-items-container");
const styleMenuButtonTextEle = document.querySelector("#style-menu-button-text");
let styleMenuOpen = false;

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
  //Polygon style properties
  const draw = new MapboxDraw({
    //USED FOR DRAW POLYGON
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
      //polygon: true,
      //trash: true,
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    defaultMode: "simple_select",
    userProperties: true,
    styles: [
      {
        id: "gl-draw-polygon-fill-inactive",
        type: "fill",
        filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.1 },
      },
      {
        id: "gl-draw-polygon-fill-active",
        type: "fill",
        filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
        paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.1 },
      },
      {
        id: "gl-draw-polygon-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: { "circle-radius": 3, "circle-color": "#ffffff" },
      },
      {
        id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
        type: "circle",
        filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
        paint: { "circle-radius": 3, "circle-color": "#ffffff" },
      },
      {
        id: "gl-draw-polygon-stroke-inactive",
        type: "line",
        filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ff0000", "line-width": 2 },
      },
      {
        id: "gl-draw-polygon-stroke-active",
        type: "line",
        filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ff0000", "line-width": 2, "line-opacity": 0.5 },
      },
      {
        id: "gl-draw-line-inactive",
        type: "line",
        filter: ["all", ["==", "active", "false"], ["==", "$type", "LineString"], ["!=", "mode", "static"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#3bb2d0", "line-width": 2 },
      },
      {
        id: "gl-draw-line-active",
        type: "line",
        filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ff0000", "line-width": 2, "line-opacity": 0.5 },
      },
      {
        id: "gl-draw-point-point-stroke-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["!=", "mode", "static"],
        ],
        paint: { "circle-radius": 5, "circle-opacity": 1, "circle-color": "#fff" },
      },
      {
        id: "gl-draw-point-stroke-active",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "active", "true"], ["!=", "meta", "midpoint"]],
        paint: { "circle-radius": 5, "circle-color": "#ffffff" },
      },
      {
        id: "gl-draw-point-active",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["!=", "meta", "midpoint"], ["==", "active", "true"]],
        paint: { "circle-radius": 3, "circle-color": "#ff0000" },
      },
    ],
  });

  window.map.addControl(draw);

  let polygonButton = document.getElementById("polygon-button");
  polygonButton.addEventListener("click", () => drawPoly(draw));

  let infoCloseButton = document.getElementById("area-selection-info-close-button");
  infoCloseButton.addEventListener("click", closeInfo);

  let infoMoveButton = document.getElementById("move-button");
  infoMoveButton.addEventListener("click", () => moveMap(draw));

  initialiseStyleMenu();
  initialiseLayerMenu();
  initialiseCursorButtons();
  initialiseZoomButtons();
  initialiseSearchBar();
  initialiseSavedAreas(draw);
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
  document.getElementById("area-selection-info-container").classList.add("hidden");
}

function initialiseStyleMenu() {
  document.querySelector("#dark-item").onclick = darkStyle;
  document.querySelector("#light-item").onclick = lightStyle;
  document.querySelector("#satellite-item").onclick = satelliteStyle;
  document.querySelector("#topo-item").onclick = topoStyle;

  document.querySelector("#theme-button").onclick = () => setDarkMode(!darkMode);
  darkStyle();
}

function closeStyleMenu() {
  styleMenuOpen = false;
  styleMenuItemsContainerEle.classList.add("hidden");
}

function openStyleMenu() {
  styleMenuOpen = true;
  styleMenuItemsContainerEle.classList.remove("hidden");
  styleMenuItemsContainerEle.focus();
}

styleMenuButtonEle.onclick = () => {
  if (!styleMenuOpen) {
    openStyleMenu();
  } else {
    closeStyleMenu();
  }
};
styleMenuItemsContainerEle.focusout = closeStyleMenu;

const darkStyle = () => {
  mapStyle.currentStyle = MapStyle.Dark;
  styleMenuButtonTextEle.textContent = "Dark";
  closeStyleMenu();
  window.map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
};

const lightStyle = () => {
  mapStyle.currentStyle = MapStyle.Light;
  styleMenuButtonTextEle.textContent = "Light";
  closeStyleMenu();
  window.map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
};

const satelliteStyle = () => {
  mapStyle.currentStyle = MapStyle.Satellite;
  styleMenuButtonTextEle.textContent = "Satellite";
  closeStyleMenu();
  window.map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
};

const topoStyle = () => {
  mapStyle.currentStyle = MapStyle.Outdoors;
  styleMenuButtonTextEle.textContent = "Topology";
  closeStyleMenu();
  window.map.setStyle(`mapbox://styles/mapbox/${mapStyle.currentStyle}`);
};

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

function initialiseZoomButtons() {
  zoomScrollButtonEle.onmousedown = dragMouseDown;

  document.querySelector("#zoom-in-button").onclick = () => window.map.zoomIn();
  document.querySelector("#zoom-out-button").onclick = () => window.map.zoomOut();
}
