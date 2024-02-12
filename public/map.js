import { grabAPIdata } from "./product-requests.js";

let allProducts = [];
let renderedProducts = [];

let productTypeColours = {
  SCENE: "#C63CBF",
  DOCUMENT: "#219BF5",
  IMAGERY: "#0085EC",
  VIDEO: "#008907",
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
map.on("load", initialiseProducts);

export async function initialiseProducts() {
  allProducts = await grabAPIdata();
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
export async function addProductsToMap() {
  renderedProducts.forEach(renderProductToMap);
}

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
      "fill-color": productTypeColours[productType],
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
      "line-color": productTypeColours[productType],
      "line-width": 3,
    },
  });
}

//-----------CUSTOM POLYGONS---------

//CreateSquarePolygon("1",-6.116, 55.650, -6.108, 55.651, -6.112, 55.695, -6.120, 55.695, -6.116, 55.650);
//CreateSquarePolygon("2",-6.088, 55.651, -6.08, 55.651, -6.083, 55.696, -6.091, 55.696, -6.088, 55.651);

function CreateSquarePolygon(Name, N1, W1, N2, W2, N3, W3, N4, W4, N5, W5) {
  map.addSource(Name, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [N1, W1],
            [N2, W2],
            [N3, W3],
            [N4, W4],
            [N5, W5],
          ],
        ],
      },
    },
  });
  // Add a new layer to visualize the polygon.
  map.addLayer({
    id: Name,
    type: "fill",
    source: Name, // reference the data source
    layout: {},
    paint: {
      "fill-color": "#000000",
      "fill-opacity": 0.2,
    },
  });
  // Add a black outline around the polygon.
  map.addLayer({
    id: "outline",
    type: "line",
    source: Name,
    layout: {},
    paint: {
      "line-color": "#111111",
      "line-width": 3,
    },
  });
}
