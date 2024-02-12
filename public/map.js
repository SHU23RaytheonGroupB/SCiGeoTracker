import { grabAPIdata } from "./product-requests.js";

//Functionality - add event listeners to relevant functions &
//this will determine all calls for any functions not to be triggered on instant load of page
mapTestfunction();

export async function mapTestfunction() {
  const allProductMetaData = await grabAPIdata();
  //pass relevant API metadata to addAPIPolygon()
  await addAPIPolygon();
}

async function addAPIPolygon() {
  map.on("load", () => {
    //Add a data source containing GeoJSON data.
    map.addSource("newPoly", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-0.156727, 51.489649],
              [-0.156727, 51.508804],
              [-0.115185, 51.508804],
              [-0.115185, 51.489649],
              [-0.156727, 51.489649],
            ],
          ],
        },
      },
    });
    map.addLayer({
      id: "newPoly",
      type: "fill",
      source: "newPoly", // reference the data source
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
      source: "newPoly",
      layout: {},
      paint: {
        "line-color": "#111111",
        "line-width": 3,
      },
    });
  });
}
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
