let allProducts = [];

let productFillColours = {
  SCENE: "#6E6E6E", //GREY
  DOCUMENT: "#219BF5", //blue
  IMAGERY: "#0085EC", //slightly darker blue
  VIDEO: "#008907", //green
};

let productOutlineColours = {
  SCENE: "#000000", //BLACK
  DOCUMENT: "#219BF5", //blue
  IMAGERY: "#0085EC", //slightly darker blue
  VIDEO: "#008907", //green
};

const minZoom = 4;
const maxZoom = 12;

mapboxgl.accessToken = "pk.eyJ1IjoiZ3JhY2VmcmFpbiIsImEiOiJjbHJxbTJrZmgwNDl6MmtuemszZWtjYWh5In0.KcHGIpkGHywtjTHsL5PQDQ";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/dark-v11", // style URL
  center: [-5, 55], // starting position
  zoom: 5, // starting zoom
  minZoom: minZoom,
  maxZoom: maxZoom,
});

//Functionality - add event listeners aka filtersPanel.on change etc to relevant functions &
//this will determine all calls for any functions not to be triggered on instant load of page
map.on("load", () => {
  renderOverlaysMove();
  renderOverlaysZoom();
  initialiseProducts();
});

const coordEle = document.querySelector("#coords");
const zoomScrollEle = document.querySelector("#zoom-scroll-button");

function renderOverlaysMove() {
  const { lng, lat } = map.getCenter();
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
}

function renderOverlaysZoom() {
  const zoomPercentage = ((map.getZoom() - minZoom) / (maxZoom - minZoom)) * 100;
  zoomScrollEle.style.top = `${100 - zoomPercentage}%`;
}

map.on("move", (ev) => {
  renderOverlaysMove();
});

map.on("zoom", (ev) => {
  renderOverlaysZoom();
});

export async function initialiseProducts() {
  const response = await fetch("/api/getProducts");
  allProducts = await response.json();
  await addProductsToMap();
  //filtersPanel.on("change", filterProductsByType);
}

function filterProductsByType() {
  //PSEUDOCODE IDEA
  //let type = dropdown.value
  //filteredProducts = allProducts.where( p => p.type == type)
  //map.allLayers.forEach(remove)
  //addProductsToMap()
}

//Draw every product to the screen
export async function addProductsToMap() {
  //Define polygon & point mapbox sources
  let polygonFeatureCollection = {
    type: "FeatureCollection",
    features: allProducts.map((product) => ({
      type: "Feature",
      geometry: product.footprint,
      attributes: {
        id: product.identifier,
        type: product.type,
        title: product.title,
        mission_id: product.missionid,
        date_created:	product.datecreated,
        date_start: product.objectstartdate,
        date_end: product.objectenddate,
      },
    })),
  };
  let pointFeatureCollection = {
    type: "FeatureCollection",
    features: allProducts.map((product) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: product.centre != null ? product.centre.split(",").reverse() : [],
      },
      attributes: {
        id: product.identifier,
        type: product.type,
        title: product.title,
        mission_id: product.missionid,
        date_created:	product.datecreated,
        date_start: product.objectstartdate,
        date_end: product.objectenddate,
      },
    })),
  };
  // SOURCES
  addSource("product-polygons", polygonFeatureCollection);
  addSource("product-points", pointFeatureCollection);
  // FRAMES LAYER
  addFramesLayers("product-polygons");
  // HEATMAP LAYER
  addHeatmapLayer("product-points");
}

function addSource(title, data) {
  map.addSource(title, {
    type: "geojson",
    data: data,
    tolerance: 3,
    // buffer: 512,
  });
}

function addFramesLayers(title) {
  map.addLayer({
    id: `${title}-frames-fill`,
    type: "fill",
    source: title,
    layout: {},
    paint: {
      "fill-color": productFillColours["SCENE"],
      "fill-opacity": 0.2,
    },
  });
  map.addLayer({
    id: `${title}-frames-outline`,
    type: "line",
    source: title,
    layout: {},
    paint: {
      "line-color": productOutlineColours["SCENE"],
      "line-width": 1,
    },
  });
}

function addHeatmapLayer(title, productType) {
  map.addLayer({
    id: `${title}-heatmap`,
    type: "heatmap",
    source: title,
  });
}

//-----------CUSTOM POLYGONS---------
