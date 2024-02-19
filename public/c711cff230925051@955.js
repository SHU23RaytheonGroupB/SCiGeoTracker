function _1(md){return(
md`# Zoomable Timeline with Items`
)}

function _years(Inputs){return(
Inputs.range([1, 20], { value: 10, step: 1, label: "Years" })
)}

function _timeline(Timeline,myData,oneYearAgo,oneYearFromNow){return(
Timeline(myData, {
  from: oneYearAgo,
  until: oneYearFromNow
})
)}

function _4(timeline){return(
timeline.element
)}

function _oneYearAgo(){return(
new Date().setFullYear(new Date().getFullYear() - 1)
)}

function _oneYearFromNow(){return(
new Date().setFullYear(new Date().getFullYear() + 1)
)}

function _Timeline(d3,width){return(
function Timeline(data, options) {
  const axis = {};
  const nodes = {};
  let _data = data;

  const { from, until, margin, height, onClickItem, onZoomEnd, zoomFilter } = {
    from: new Date().setFullYear(new Date().getFullYear() + 1),
    until: new Date().setFullYear(new Date().getFullYear() + 1),
    margin: { top: 80, right: 20, bottom: 20, left: 20 },
    height: 200,
    onClickItem: () => {},
    onZoomEnd: () => {},
    zoomFilter: () => {},
    ...options
  };

  const MS_PER_HOUR = 60 * 60 * 1000;
  //const MS_PER_SECOND = 10000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_YEAR = 365.24 * MS_PER_DAY; // include leap year

  const parts = ["yearly", "daily", "weekly", "grid", "yearlyGrid"];

  let scaleX = d3
    .scaleUtc()
    .domain([from, until])
    .range([margin.left, width - margin.right]);

  const originalScaleX = scaleX.copy();

  const density = Math.abs(scaleX.invert(0) - scaleX.invert(1)) / MS_PER_HOUR; // in pixels per hour

  const zoomScaleExtent = [1, Math.round(MS_PER_YEAR * 10)];

  const findDensityConfig = (map, value) => {
    for (const [limit, config] of map) {
      if (value < limit) {
        return config;
      }
    }

    return [];
  };

  const ensureTimeFormat = (value = "") => {
    return typeof value !== "function" ? d3.utcFormat(value) : value;
  };

  axis["yearly"] = (parentNode, density) => {
    const densityMap = [
      [0.0005, [d3.utcHour, "%B %-d, %Y %H:%M"]],
      [0.05, [d3.utcDay, "%B %-d, %Y"]],
      [
        3,
        [
          d3.utcMonth,
          (d) => {
            const startOfTheYear =
              d.getUTCMonth() === 0 && d.getUTCDate() === 1;
            const format = startOfTheYear ? "%Y – %B" : "%B";
            console.log(d);

          }
        ]
      ],
      [Infinity, [d3.utcYear, "%Y"]]
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top - 48})`)
      .call(
        d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0)
      );

    el.select(".domain").remove();

    el.selectAll("text")
      .attr("y", 0)
      .attr("x", 6)
      .style("text-anchor", "start");

    el.selectAll("line").attr("y1", -7).attr("y2", 6);
  };

  axis["daily"] = (parentNode, density) => {
    const densityMap = [
      [0.0005, [d3.utcMinute, "%M"]],
      [0.05, [d3.utcHour, "%H"]],
      [1, [d3.utcDay, "%-d"]],
      [3, [d3.utcDay, ""]],
      [8, [d3.utcMonth, "%B"]],
      [13, [d3.utcMonth, "%b"]],
      [22, [d3.utcMonth, (d) => d3.utcFormat("%B")(d).charAt(0)]],
      [33, [d3.utcMonth.every(3), "Q%q"]],
      [Infinity, [d3.utcMonth.every(3), ""]]
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top - 28})`)
      .call(
        d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0)
      );

    el.select(".domain").remove();

    el.selectAll("text")
      .attr("y", 0)
      .attr("x", 6)
      .style("text-anchor", "start");

    el.selectAll("line").attr("y1", -7).attr("y2", 0);
  };

  axis["weekly"] = (parentNode, density) => {
    const densityMap = [
      [10, [d3.timeMonday, (d) => +d3.utcFormat("%-W")(d) + 1]], // monday as first of week and zero based
      [33, [d3.timeMonday, ""]],
      [Infinity, [d3.timeMonday.every(4), ""]]
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top - 8})`)
      .call(
        d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0)
      );

    el.select(".domain").remove();
    el.selectAll("line").style(
      "visibility",
      density > densityMap[0][0] ? "visible" : "hidden"
    );

    el.selectAll("text")
      .attr("y", 0)
      .attr("x", 6)
      .style("text-anchor", "start");

    el.selectAll("line").attr("y1", -7).attr("y2", 0);
  };

  axis["grid"] = (parentNode, density) => {
    const densityMap = [
      [0.001, [d3.utcMinute]],
      [0.025, [d3.utcMinute.every(30)]],
      [0.05, [d3.utcHour]],
      [0.5, [d3.utcHour.every(6)]],
      [1, [d3.utcDay]],
      [8, [d3.timeMonday]],
      [22, [d3.utcMonth]],
      [Infinity, [d3.utcMonth.every(3)]]
    ];

    const [interval] = findDensityConfig(densityMap, density);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(scaleX).ticks(interval).tickSizeOuter(0));

    el.select(".domain").remove();
    el.selectAll("text").remove();

    el.selectAll("line")
      .attr("stroke-width", 0.5)
      .attr("y1", 0)
      .attr("y2", height - margin.top - margin.bottom);
  };

  axis["yearlyGrid"] = (parentNode, density) => {
    const densityMap = [
      [3, [d3.utcMonth, "%B"]],
      [Infinity, [d3.utcYear, "%Y"]]
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top})`)
      .call(
        d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0)
      );

    el.select(".domain").remove();
    el.selectAll("text").remove();

    el.selectAll("line")
      .attr("y1", 0)
      .attr("y2", height - margin.top - margin.bottom);
  };

  const setup = () => {
    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const element = svg.node();

    const rootNode = svg.append("g").classed("timeline-axis", true);

    parts.forEach((part) => {
      nodes[part] = rootNode.append("g").classed(part, true);
    });

    const radius = 4;
    const padding = 1;

    // Given an array of x-values and a separation radius, returns an array of y-values.
    const dodge = (X, radius) => {
      const Y = new Float64Array(X.length);
      const radius2 = radius ** 2;
      const epsilon = 1e-3;
      let head = null,
        tail = null;

      // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
      const intersects = (x, y) => {
        let a = head;
        while (a) {
          const ai = a.index;
          if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2)
            return true;
          a = a.next;;
        }
        return false;
      };

      // Place each circle sequentially.
      for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {
        // Remove circles from the queue that can’t intersect the new circle b.
        while (head && X[head.index] < X[bi] - radius2) head = head.next;

        // Choose the minimum non-intersecting tangent.
        if (intersects(X[bi], (Y[bi] = 0))) {
          let a = head;
          Y[bi] = Infinity;
          do {
            const ai = a.index;
            let y1 = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
            let y2 = Y[ai] - Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
            if (Math.abs(y1) < Math.abs(Y[bi]) && !intersects(X[bi], y1))
              Y[bi] = y1;
            if (Math.abs(y2) < Math.abs(Y[bi]) && !intersects(X[bi], y2))
              Y[bi] = y2;
            a = a.next;
          } while (a);
        }

        // Add b to the queue.
        const b = { index: bi, next: null };
        if (head === null) head = tail = b;
        else tail = tail.next = b;
      }

      return Y;
    };

    const bind = (data) => {
      const I = d3.range(data.length);
      const X = data.map((d) => scaleX(d.start));
      const Y = dodge(X, radius * 2 + padding);
      const items = svg
        .selectAll("circle")
        .data(data)
        .join(
          (enter) =>
            enter
              .append("circle")
              .on("click", onClickItem)
              .style("stroke", "white")
              .style("stroke-width", 1)
              .style("fill", "blue")
              .style("cursor", "pointer")
              .attr("r", 4)
              .attr("cx", (d, i) => X[i])
              .attr("cy", (d, i) => Y[i] + 120)
              .append("title")
              .text((d) => d.id),
          (update) =>
            update.attr("cx", (d, i) => X[i]).attr("cy", (d, i) => Y[i] + 130)
        );

      const density =
        Math.abs(scaleX.invert(0) - scaleX.invert(1)) / MS_PER_HOUR; // in pixels per hour

      parts.forEach((part) => {
        nodes[part].call(axis[part], density);
      });
      return items;
    };

    const getBounds = () => {
      return { start: scaleX.domain()[0], end: scaleX.domain()[1] };
    };

    const items = bind(data);

    const zoom = d3
      .zoom()
      .scaleExtent(zoomScaleExtent)
      .extent([
        [margin.left, 0],
        [width - margin.right, 0]
      ])
      .translateExtent([
        [margin.left, 0],
        [width - margin.right, 0]
      ])
      .on("zoom", ({ transform }) => {
        scaleX = transform.rescaleX(originalScaleX);
        //console.log(scaleX.domain());
        /*(2) [Sat Nov 25 2023 17:24:40 GMT+0000 (Greenwich Mean Time), Sat Jun 22 2024 16:36:08 GMT+0100 (British Summer Time)]
        0:Sat Nov 25 2023 17:24:40 GMT+0000 (Greenwich Mean Time) {}
        1:Sat Jun 22 2024 16:36:08 GMT+0100 (British Summer Time) {}
        length:2
       [[Prototype]]:Array(0)*/
       document.getElementById("test").innerHTML = scaleX.domain();
        bind(_data);
        element.value = {
          start: scaleX.domain()[0],
          end: scaleX.domain()[1]
        };
        element.dispatchEvent(new CustomEvent("input"));
      });
    svg.call(zoom);

    const update = (data) => {
      _data = data;
      bind(_data);
    };

    return {
      element,
      update,
      items,
      getBounds
    };
  };

  return setup();
}
)}

function _8(htl){return(
htl.html`<h2>Items</h2>`
)}

function _myData(){return(
Array.from({ length: 500 }, (x, i) => ({
  id: i,
  start: new Date(
    new Date().getTime() + Math.random() * 100000000000 - 50000000000
  )
}))
)}

function _10(html){return(
html`
<style type="text/css">
  .timeline-axis {
    --daily-gridline-color: rgb(194, 199, 200);
    --yearly-gridline-color: rgb(81, 93, 93);
    --yearly-tick-color: rgb(81, 93, 93);
    --yearly-label-color: rgb(60, 79, 81);
    --daily-tick-color: rgb(161, 173, 173);
    --daily-label-color: rgb(60, 79, 81);
    --weekly-tick-color: rgb(161, 173, 173);
    --weekly-label-color: rgb(60, 79, 81);
  }

  .timeline-axis line {
    shape-rendering: geometricPrecision;
    stroke-width: 0.5;
  }

  .timeline-axis .yearly line {
    stroke: var(--yearly-tick-color);
  }

  .timeline-axis .yearly text {
    color: var(--yearly-label-color);
  }

  .timeline-axis .daily line {
    stroke: var(--daily-tick-color);
  }

  .timeline-axis .daily text {
    color: var(--daily-label-color);
  }

  .timeline-axis .weekly line {
    stroke: var(--weekly-tick-color);
  }

  .timeline-axis .weekly text {
    color: var(--weekly-label-color);
  }

  .timeline-axis .grid line {
    stroke: var(--daily-gridline-color);
  }

  .timeline-axis .yearlyGrid line {
    stroke: var(--yearly-gridline-color);
  }
</style>
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  //main.variable(observer()).define(["md"], _1);
  //main.variable(observer("viewof years")).define("viewof years", ["Inputs"], _years);
  //main.variable(observer("years")).define("years", ["Generators", "viewof years"], (G, _) => G.input(_));
  main.variable(observer("timeline")).define("timeline", ["Timeline","myData","oneYearAgo","oneYearFromNow"], _timeline);
  main.variable(observer()).define(["timeline"], _4);
  main.variable(observer("oneYearAgo")).define("oneYearAgo", _oneYearAgo);
  main.variable(observer("oneYearFromNow")).define("oneYearFromNow", _oneYearFromNow);
  main.variable(observer("Timeline")).define("Timeline", ["d3","width"], _Timeline);
  //main.variable(observer()).define(["htl"], _8);
  main.variable(observer("myData")).define("myData", _myData);
  //main.variable(observer()).define(["html"], _10);
  return main;
}
