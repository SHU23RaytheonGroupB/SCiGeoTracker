const darkTheme_ProductFillColours = {
  SCENE: "#fc685d", //LIGHT RED
  BORDER: "#cc0000", //DARK RED
  CLUSTER: "#f2f0df", //GREY/WHITE
  FRAME: "#ffffff", //WHITE
};

const outdoorsTheme_ProductFillColours = {
  SCENE: "#00ff00", //LIGHT GREEN
  BORDER: "#6a329f", //PURPLE
  CLUSTER: "#00ff00", //LIGHT GREEN
  FRAME: "#ffffff", //WHITE
};

const satelliteTheme_ProductFillColours = {
  SCENE: "#ffffff", //wHITE
  BORDER: "#fc685d", //LIGHT RED
  CLUSTER: "#ffffff", //WHITE
  FRAME: "#6a329f", //PURPLE
};

export const productFillColours = {
  "dark-v11": darkTheme_ProductFillColours,
  "satellite-streets-v12": satelliteTheme_ProductFillColours,
  "outdoors-v11": outdoorsTheme_ProductFillColours,
  "light-v11": outdoorsTheme_ProductFillColours,
};

export const productOutlineColours = {
  SCENE: "#000000", //BLACK
  DOCUMENT: "#000000", //BLACK
};

export const MapStyle = {
  Dark: "dark-v11",
  Light: "light-v11",
  Satellite: "satellite-streets-v12",
  Outdoors: "outdoors-v11",
};

export const CursorMode = {
  Move: "Move",
  Rectangle: "Rectangle",
  Polygon: "Polygon",
};

export const minZoom = 4;
export const maxZoom = 12;
export let mapStyle = { currentStyle: MapStyle.Dark };
