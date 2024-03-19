export function createHistogramChart(map_) {
  console.log("Creating histogram chart");

  console.log("map_: ", map_);

  let data =  map_.getSource("product-polygons")._data.features.map((feature) => {
    return feature.attributes.date_start;
  }); 

  for (let i = 0; i < data.length; i++) {
    if (data[i] === null) {
      data.splice(i, 1);
      i--;
    }
  }

  const startTime = Math.min(...data);
  const endTime = Math.max(...data);

  const binSize = 24*60*60*1000; // 1 day in milliseconds
  const bins = Math.ceil((endTime - startTime) / binSize);

  console.log("bins: ", bins);

  const histogram = new Array(bins).fill(0);

  for (let i = 0; i < data.length; i++) {
    const bin = Math.floor((data[i] - startTime) / binSize);
    histogram[bin]++; 
  }

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





