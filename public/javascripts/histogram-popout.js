import { allProducts } from "./products-and-layers.js";
import { calculateMissionCoverage } from "./area-calculations.js";

var HistCreated = false;

export function createHistogramChart() {

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


  const histogram = new Array(bins).fill(0);

  let featureObjects = new Array(bins).fill().map(() => []);
  let count = 0;

  for (let i = 0; i < objectstartdate.length; i++) {
    const bin = Math.floor((objectstartdate[i] - startTime) / binSize);
    if (featureObjects[bin]) {
      histogram[bin]++;
      featureObjects[bin].push(data[i]);
    }
  }


  const UKmapdata = window.map.getSource("uk-land")._data;
  let polyCoordinates = []; 

  for (let i = 0; i < UKmapdata.features[0].geometry.coordinates.length; i++) {
    //bcs the uk is a multigon we need to iterate through each island
    for (let k = 0; k < UKmapdata.features[0].geometry.coordinates[i][0].length; k++) {
      polyCoordinates.push(UKmapdata.features[0].geometry.coordinates[i][0][k]);
    }
  }

  let percentageCoverage = new Array(bins).fill(0);

  for (let i = 0; i < featureObjects.length; i++) {
    if (featureObjects[i].length != 0) {
      percentageCoverage[i] = calculateMissionCoverage(featureObjects[i], [polyCoordinates]);
    }
    else {
    }
  }

  if (window.map.getSource('mission-area-within-poly') != undefined) {
    window.map.removeLayer('mission-area-within-polyfill');
    window.map.removeSource('mission-area-within-poly');
  } 

  for (let i = 1; i < percentageCoverage.length; i++) {
    percentageCoverage[i] = percentageCoverage[i-1] + percentageCoverage[i];
  }

  const ukArea = 244820;
  for (let i = 0; i < percentageCoverage.length; i++) {
    percentageCoverage[i] = percentageCoverage[i] / ukArea * 100;
  }

  const ctx = document.getElementById("histogram-chart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: new Array(bins).fill().map((_, i) => new Date( startTime + i * binSize)),
      datasets: [
        {
          label: "Uk Coverage %",
          data: percentageCoverage,
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 1,
          barPercentage: 1.0,
        }
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
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Percentage (%) of UK Covered",
          }
        },
      },
    },
  });
  HistCreated = true;
}

let histogramOpen = false;
const closeButton = document.getElementById("histogram-popout-close-button");
const chartEle = document.getElementById("histogram-popout-container");

function openHistogram() {
  histogramOpen = true;
  chartEle.classList.remove("hidden");
}

function closeHistogram() {
  histogramOpen = false;
  chartEle.classList.add("hidden");
}

closeButton.addEventListener("click", closeHistogram);
document.getElementById("histogram-button").addEventListener("click", () => {
  if (!HistCreated) {
    createHistogramChart();
  }
  if (histogramOpen) {
    closeHistogram();
  } else {
    openHistogram();
  }
});




