// ATTRIBUTION: Julien Colot
// https://observablehq.com/@jcolot/zoomable-timeline-with-items@955

import { allProducts } from "./products-and-layers.js";
import { displayMissionMenu, viewSelectedMission } from "./mission-popout-menu.js";
import { mapFlyTo } from "./map.js";

let missionID;
let scenes = [];

export function Timeline(options) {
  const axis = {};
  const nodes = {};
  let myData = window.map.getSource("product-polygons")._data.features;

  myData = Array.from({ length: myData.length }, (x, i) => ({
    title:
      "Mission: " +
      myData[i].properties.title.split(" ")[0] +
      "\n" +
      "Scene: " +
      myData[i].properties.title.split(" ")[1] +
      "\n" +
      "Publisher: " +
      myData[i].properties.pub +
      "\n",
    id: myData[i].properties.id,
    start: new Date(myData[i].properties.date_start),
    end: new Date(myData[i].properties.date_end),
    missionName: myData[i].properties.title.split(" ")[0],
    missionID: myData[i].properties.missionid,
    sceneName: myData[i].properties.title.split(" ")[1],
  }));

  const { from, until, margin, width, height, onClickItem, onZoomEnd, zoomFilter } = {
    from: new Date().setFullYear(new Date().getFullYear() + 1),
    until: new Date().setFullYear(new Date().getFullYear() + 1),
    margin: { top: 80, right: 20, bottom: 20, left: 20 },
    width: 800,
    height: 120,
    onClickItem: () => {},
    onZoomEnd: () => {},
    zoomFilter: () => {},
    ...options,
  };

  const MS_PER_HOUR = 60 * 60 * 1000;
  const MS_PER_SECOND = 1000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_YEAR = 365.24 * MS_PER_DAY; // include leap year

  const parts = ["yearly", "daily", "weekly", "grid", "yearlyGrid"];

  let scaleX = d3
    .scaleUtc()
    .domain([from, until])
    .range([margin.left, width - margin.right]);

  const originalScaleX = scaleX.copy();

  let xsize = 0;

  const density = Math.abs(scaleX.invert(0) - scaleX.invert(1)) / MS_PER_HOUR; // in pixels per hour

  const zoomScaleExtent = [1, Math.round(MS_PER_YEAR * 10)];
  //.log("zoomScaleExtent", zoomScaleExtent);
  //console.log("zoomScaleExtent", zoomScaleExtent);

  const findDensityConfig = (myData, value) => {
    for (const [limit, config] of myData) {
      if (value < limit) {
        xsize = value;
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
            const startOfTheYear = d.getUTCMonth() === 0 && d.getUTCDate() === 1;
            const format = startOfTheYear ? "%Y – %B" : "%B";

            return d3.utcFormat(format)(d);
          },
        ],
      ],
      [Infinity, [d3.utcYear, "%Y"]],
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top - 48})`)
      .call(d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0));

    el.select(".domain").remove();

    el.selectAll("text").attr("y", 0).attr("x", 6).style("text-anchor", "start");

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
      [Infinity, [d3.utcMonth.every(3), ""]],
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top - 28})`)
      .call(d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0));

    el.select(".domain").remove();

    el.selectAll("text").attr("y", 0).attr("x", 6).style("text-anchor", "start");

    el.selectAll("line").attr("y1", -7).attr("y2", 0);
  };

  axis["weekly"] = (parentNode, density) => {
    const densityMap = [
      [10, [d3.timeMonday, (d) => +d3.utcFormat("%-W")(d) + 1]], // monday as first of week and zero based
      [33, [d3.timeMonday, ""]],
      [Infinity, [d3.timeMonday.every(4), ""]],
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top - 8})`)
      .call(d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0));

    el.select(".domain").remove();
    el.selectAll("line").style("visibility", density > densityMap[0][0] ? "visible" : "hidden");

    el.selectAll("text").attr("y", 0).attr("x", 6).style("text-anchor", "start");

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
      [Infinity, [d3.utcMonth.every(3)]],
    ];

    const [interval] = findDensityConfig(densityMap, density);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(scaleX).ticks(interval).tickSizeOuter(0));

    el.select(".domain").remove();
    el.selectAll("text").remove();

    el.selectAll("line")
      .attr("stroke-width", 10)
      .attr("y1", 0)
      .attr("y2", height - margin.top - margin.bottom);
  };

  axis["yearlyGrid"] = (parentNode, density) => {
    const densityMap = [
      [3, [d3.utcMonth, "%B"]],
      [Infinity, [d3.utcYear, "%Y"]],
    ];

    let [interval, format] = findDensityConfig(densityMap, density);
    format = ensureTimeFormat(format);

    const el = parentNode
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(scaleX).ticks(interval).tickFormat(format).tickSizeOuter(0));

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

    const radius = 1;

    //letradius = (1/xsize)*10;

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
          if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
          a = a.next;
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
            if (Math.abs(y1) < Math.abs(Y[bi]) && !intersects(X[bi], y1)) Y[bi] = y1;
            if (Math.abs(y2) < Math.abs(Y[bi]) && !intersects(X[bi], y2)) Y[bi] = y2;
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

    const bind = (myData) => {
      const I = d3.range(myData.length);
      const X = myData.map((d) => scaleX(d.start));
      const Y = dodge(X, radius * 2 + padding);
      //const Y = dodge(X, radius * 2 + padding*(1/xsize)*10);
      //let rescaleX = (50/(Math.log(xsize) - 20));
      //let rescaleX = (1/xsize)*100;
      let rescaleX = 4;
      if (xsize < 0.08005333333333334) {
        rescaleX = 14;
      }
      //rescaleX = 4;
      const items = svg
        .selectAll("circle")
        .data(myData)
        .join(
          (enter) =>
            enter
              .append("circle")
              .on("click", onClickItem)
              .style("fill", "red")
              .style("fill-opacity", 0.4)
              .style("cursor", "pointer")
              .on("click", function (event, d) {
                circleLinkZoom(d.id, d.missionID);
              })
              .attr("r", 4)
              .attr("mission", (d) => d.missionName)
              .attr("scene", (d) => d.sceneName)
              .attr("cx", (d, i) => X[i])
              .attr("cy", (d, i) => Y[i] + 100)
              .attr("mission", (d) => d.missionGroup)
              .append("title")
              .text((d) => d.title),
          (update) => update.attr("cx", (d, i) => X[i]).attr("cy", (d, i) => Y[i] + 100)
        );

      const density = Math.abs(scaleX.invert(0) - scaleX.invert(1)) / MS_PER_HOUR; // in pixels per hour

      parts.forEach((part) => {
        nodes[part].call(axis[part], density);
      });
      return items;
    };

    const getBounds = () => {
      return { start: scaleX.domain()[0], end: scaleX.domain()[1] };
    };

    const items = bind(myData);

    const zoom = d3
      .zoom()
      .scaleExtent(zoomScaleExtent)
      .extent([
        [margin.left, 0],
        [width - margin.right, 0],
      ])
      .translateExtent([
        [margin.left, 0],
        [width - margin.right, 0],
      ])
      .on("zoom", ({ transform }) => {
        scaleX = transform.rescaleX(originalScaleX);
        bind(myData);
        element.value = {
          start: scaleX.domain()[0],
          end: scaleX.domain()[1],
        };
        element.dispatchEvent(new CustomEvent("input"));
      });
    svg.call(zoom);

    const update = (data) => {
      mapData = data;
      bind(myData);
    };

    return {
      element,
      update,
      items,
      getBounds,
    };
  };

  return setup();
}
const timelineContainerEle = document.getElementById("timeline-container");
let timelineVisible = false;

function setTimelineVisibility(enabled) {
  timelineVisible = enabled;
  if (enabled) {
    timelineContainerEle.classList.remove("hidden");
  } else {
    timelineContainerEle.classList.add("hidden");
  }
}

function toggleTimelineVisiblity() {
  setTimelineVisibility(!timelineVisible);
}

setTimelineVisibility(true);

document.getElementById("timeline-button").addEventListener("click", toggleTimelineVisiblity);
document.getElementById("timeline-popout-close-button").addEventListener("click", () => setTimelineVisibility(false));
let viewMissionButton = document.getElementById("flyto-mission-info-view-button");
//viewMissionButton.addEventListener("click", async () => viewSelectedMission(missionID));

async function circleLinkZoom(productID, missionID) {
  let reset = document.querySelectorAll("circle");
  reset.forEach((reset) => {
    reset.style.fill = "red";
  });

  let missionName;
  let currentProduct;
  allProducts.forEach((product) => {
    if (product.identifier === productID) {
      missionName = product.title.split(" ")[0];
      missionID = product.missionid;
      currentProduct = product;
      mapFlyTo(product);
    }
    if (product.missionid === missionID) {
      scenes.push(product);
    }
  });
  let circleGroup = document.querySelectorAll('circle[mission="' + missionName + '"]');
  circleGroup.forEach((circle) => {
    circle.style.fill = "blue";
  });
  console.log("scenes");
  console.log(scenes);
  const frames = await viewSelectedMission(missionID);
  //console.log(frames);
  displayMissionMenu(currentProduct, scenes, frames);
}
