let allProducts = [];
let renderedProducts = [];

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

mapboxgl.accessToken = "pk.eyJ1IjoiZ3JhY2VmcmFpbiIsImEiOiJjbHJxbTJrZmgwNDl6MmtuemszZWtjYWh5In0.KcHGIpkGHywtjTHsL5PQDQ";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/dark-v11", // style URL
  center: [-5, 55], // starting position
  zoom: 5, // starting zoom
});

//Functionality - add event listeners aka filtersPanel.on change etc to relevant functions &
//this will determine all calls for any functions not to be triggered on instant load of page
map.on("load", () => {
  renderOverlays();
  initialiseProducts();
});


const coordEle = document.querySelector("#coords");

function renderOverlays() {
  const {lng, lat} = map.getCenter();
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
}

map.on("move", (ev) => {
  renderOverlays();
})

export async function initialiseProducts() {
  const response = await fetch("/api/getProducts");
  allProducts = await response.json();
  renderedProducts = allProducts;
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
  renderedProducts.forEach(renderProductToMap);
}

//Draw the polygon of the product, then fill the polygon, then outline the polygon
async function renderProductToMap(product) {
  //Add a data source containing GeoJSON data.
  addPolygon(product.title, product.footprint);
  fillPolygon(product.title, product.type);
  outlinePolygon(product.title, product.type);
}

function addPolygon(title, footprint) {
  map.addSource(title, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: footprint,
    },
  });
}

function fillPolygon(title, productType) {
  map.addLayer({
    id: title + "fill",
    type: "fill",
    source: title, // reference the data source
    layout: {},
    paint: {
      "fill-color": productFillColours[productType],
      "fill-opacity": 0.2,
    },
  });
}

function outlinePolygon(title, productType) {
  map.addLayer({
    id: title + "outline",
    type: "line",
    source: title,
    layout: {},
    paint: {
      "line-color": productOutlineColours[productType],
      "line-width": 1,
    },
  });
}

//-----------CUSTOM POLYGONS---------
