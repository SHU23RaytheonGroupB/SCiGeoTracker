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
  const {lng, lat} = map.getCenter();
  coordEle.textContent = `${lng.toFixed(3)}, ${lat.toFixed(3)}`;
}

function renderOverlaysZoom() {
  const zoomPercentage = (map.getZoom() - minZoom) / (maxZoom - minZoom) * 100;
  zoomScrollEle.style.top = `${100 - zoomPercentage}%`;
}

map.on("move", (ev) => {
  renderOverlaysMove();
})

map.on("zoom", (ev) => {
  renderOverlaysZoom();
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
  let productsByType = {};
  renderedProducts.forEach((product) => {
    if (productsByType[product.type] == undefined)
      productsByType[product.type] = [];
    productsByType[product.type].push(product);
  }); 
  for (const [type, products] of Object.entries(productsByType)) {
    await addProductsTypeToMap(products, type);
    // FRAMES
    fillPolygon(`${type}-polygons`, type);
    outlinePolygon(`${type}-polygons`, type);
    // HEATMAP
    addHeatmapLayer(`${type}-points`, type);
  }
}

async function addProductsTypeToMap(products, type) {
  let polygonFeatureCollection = {
    type: "FeatureCollection",
    features: products.map((product) => ({
      type: "Feature",
      geometry: product.footprint,
    }))
  };
  let pointFeatureCollection = {
    type: "FeatureCollection",
    features: products.map((product) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: product.centre != null ? product.centre.split(",").reverse() : [],
      },
    }))
  };
  addSource(`${type}-polygons`, polygonFeatureCollection);
  addSource(`${type}-points`, pointFeatureCollection);
}

function addSource(title, data) {
  map.addSource(title, {
    type: "geojson",
    data: data,
    tolerance: 3,
    // buffer: 512,
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

function addHeatmapLayer(title, productType) {
  map.addLayer({
    id: `${title}-heatmap`,
    type: "heatmap",
    source: title,
    // maxzoom: 9,
    // paint: {
    //   // Increase the heatmap weight based on frequency and property magnitude
    //   'heatmap-weight': [
    //       'interpolate',
    //       ['linear'],
    //       ['get', 'mag'],
    //       0,
    //       0,
    //       6,
    //       1
    //   ],
    //   // Increase the heatmap color weight weight by zoom level
    //   // heatmap-intensity is a multiplier on top of heatmap-weight
    //   'heatmap-intensity': [
    //       'interpolate',
    //       ['linear'],
    //       ['zoom'],
    //       0,
    //       1,
    //       9,
    //       3
    //   ],
    //   // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    //   // Begin color ramp at 0-stop with a 0-transparancy color
    //   // to create a blur-like effect.
    //   'heatmap-color': [
    //       'interpolate',
    //       ['linear'],
    //       ['heatmap-density'],
    //       0,
    //       'rgba(33,102,172,0)',
    //       0.2,
    //       'rgb(103,169,207)',
    //       0.4,
    //       'rgb(209,229,240)',
    //       0.6,
    //       'rgb(253,219,199)',
    //       0.8,
    //       'rgb(239,138,98)',
    //       1,
    //       'rgb(178,24,43)'
    //   ],
    //   // Adjust the heatmap radius by zoom level
    //   'heatmap-radius': [
    //       'interpolate',
    //       ['linear'],
    //       ['zoom'],
    //       0,
    //       2,
    //       9,
    //       20
    //   ],
    //   // // Transition from heatmap to circle layer by zoom level
    //   // 'heatmap-opacity': [
    //   //     'interpolate',
    //   //     ['linear'],
    //   //     ['zoom'],
    //   //     7,
    //   //     1,
    //   //     9,
    //   //     0
    //   // ]
    // }
  })
   


}

//-----------CUSTOM POLYGONS---------
