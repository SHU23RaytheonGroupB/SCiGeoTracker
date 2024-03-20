import { allProducts } from "./products-and-layers.js";
import { calculateMissionCoverage } from "./area-calculations.js";

export function createHistogramChart() {
  console.log("Creating histogram chart");

  let data =  allProducts.map((feature) => {
    return feature;
  }); 

  let objectstartdate = data.map((feature) => {
    return feature.objectstartdate;
  });


  for (let i = 0; i < objectstartdate.length; i++) {
    if (typeof objectstartdate[i] === null) {
      data.splice(i, 1);
      objectstartdate.splice(i, 1);
      i--;
    }
  }

  const startTime = Math.min(...objectstartdate);
  const endTime = Math.max(...objectstartdate);

  const binSize = 24*60*60*1000; // 1 day in milliseconds
  const bins = Math.ceil((endTime - startTime) / binSize);

  console.log("bins: ", bins);

  const histogram = new Array(bins).fill(0);

  let featureObjects = new Array(bins).fill().map(() => []);

  for (let i = 0; i < objectstartdate.length; i++) {
    const bin = Math.floor((objectstartdate[i] - startTime) / binSize);
    if (featureObjects[bin]) {
      histogram[bin]++;
      featureObjects[bin].push(data[i]);
    }
  }

  const UKmapdata = window.map.getSource("uk-land");
  console.log("UKmapdata: ", UKmapdata);
  let polyCoordinates = [];

  for (let i = 0; i < UKmapdata.features[0].geometry.coordinates.length; i++) {
    //bcs the uk is a multigon we need to iterate through each island
    for (let k = 0; k < UKmapdata.features[0].geometry.coordinates[i][0].length; k++) {
      polyCoordinates.push(UKmapdata.features[0].geometry.coordinates[i][0][k]);
    }
  }

  let percentageCoverage = new Array(bins).fill(0);

  for (let i = 0; i < featureObjects.length; i++) {
    if (featureObjects[i].length !== 0) {
      percentageCoverage[i] = calculateMissionCoverage(featureObjects[i], polyCoordinates);
    }
    else {
      percentageCoverage[i] = 0;
    }
  }

  console.log("percentageCoverage: ", percentageCoverage);

  console.log("featureObjects: ", featureObjects);

  for (let i = 1; i < histogram.length; i++) {
    histogram[i] = histogram[i-1] + histogram[i];
  }

  console.log("histogram: ", histogram);

  const ctx = document.getElementById("histogram-chart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: new Array(bins).fill().map((_, i) => new Date( startTime + i * binSize)),
      datasets: [
        {
          label: "Number of Products",
          data: histogram,
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 1,
          barPercentage: 1.0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

const closeButton = document.getElementById("histogram-popout-close-button");

closeButton.addEventListener("click", () => {
  const chart = document.getElementById("histogram-popout-container");
  chart.style.display = chart.style.display === "none" ? "block" : "none";
});

const menuButton = document.getElementById("histogram-button");

menuButton.addEventListener("click", () => {
  const chart = document.getElementById("histogram-popout-container");
  chart.style.display = chart.style.display === "none" ? "block" : "none";
});





