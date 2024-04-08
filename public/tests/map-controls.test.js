import { initialiseControls, renderOverlaysZoom, fileDisplayMode } from "./map-controls";

describe("map-controls", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="map"></div>
      <button id="polygon-button"></button>
      <button id="move-button"></button>
      <button id="zoom-scroll-button"></button>
      <button id="zoom-in-button"></button>
      <button id="zoom-out-button"></button>
      <button id="files-all-display-button"></button>
      <button id="files-activities-display-button"></button>
      <button id="files-geojson-display-button"></button>
    `;

    // Mock any necessary dependencies
    window.MapboxDraw = jest.fn(() => ({
      addControl: jest.fn(),
    }));
    window.map = {
      addControl: jest.fn(),
      setZoom: jest.fn(),
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      getZoom: jest.fn(() => 10),
    };
  });

  afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks();
  });

  test("initialiseControls should initialize the controls correctly", () => {
    initialiseControls();

    // Assert that the necessary functions are called and event listeners are attached
    expect(window.MapboxDraw).toHaveBeenCalled();
    expect(window.map.addControl).toHaveBeenCalled();
    expect(document.getElementById("polygon-button").addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
    expect(document.getElementById("move-button").addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
  });

  test("renderOverlaysZoom should update the zoom scroll button position", () => {
    const zoomScrollButtonEle = document.getElementById("zoom-scroll-button");
    window.map.getZoom.mockReturnValue(12);

    renderOverlaysZoom();

    expect(zoomScrollButtonEle.style.top).toBe("20%");
  });

  test("file display buttons should update fileDisplayMode correctly", () => {
    const displayAllButtonEle = document.getElementById("files-all-display-button");
    const displayActivitiesButtonEle = document.getElementById("files-activities-display-button");
    const displayGeojsonButtonEle = document.getElementById("files-geojson-display-button");

    displayAllButtonEle.click();
    expect(fileDisplayMode).toBe(0);

    displayActivitiesButtonEle.click();
    expect(fileDisplayMode).toBe(1);

    displayGeojsonButtonEle.click();
    expect(fileDisplayMode).toBe(2);
  });
});
