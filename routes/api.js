var express = require("express");
const ProductService = require("../js/product-requests.js");
const TokenService = require("../js/token-service.js");
const Cache = require("../js/cache.js");
var router = express.Router();

const HOSTNAME = "https://hallam.sci-toolset.com/";
const TOKEN_PATH = "api/v1/token";
const USERNAME = "hallam1";
const PASSWORD = "!H%j50H2";
const CLIENT_ID = "sci-toolset";
const CLIENT_SECRET = "st";
const ts = new TokenService(HOSTNAME, TOKEN_PATH, USERNAME, PASSWORD, CLIENT_ID, CLIENT_SECRET);
const refreshTime = 600000; //10 Minutes

async function getAuthToken() {
  const cache = Cache.getInstance();
  if (!cache.get("accessToken")) {
    try {
      const token = await ts.generateToken();
      success = cache.set("accessToken", token);
      if (!success) {
        throw error;
      }
      cache.ttl("accessToken", token.expires_in);
    } catch (error) {
      console.error("Error generating token");
    }
  }
  return cache.get("accessToken");
}

/* getProducts. */
router.get("/getProducts", async function (req, res) {
  const token = await getAuthToken();
  if (!token) {
    console.error("ERROR 401: Authentication token is missing or invalid.");
    return res.status(401).send("Authentication token is missing or invalid.");
  }
  try {
    const cache = Cache.getInstance();
    if (!cache.has("allProducts")) {
      const ps = new ProductService(token.access_token);
      const allProductMetaData = await ps.getAllProducts();
      cache.set("allProducts", allProductMetaData);
      res.json(allProductMetaData);
    } else {
      res.json(cache.get("allProducts"));
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products.");
  }
});

async function getFramesData(selectedMissionInfo) {
  let selectedMissionFrames = [];
  const cache = Cache.getInstance();
  const { id: missionID, scenes } = selectedMissionInfo;
  const token = await getAuthToken();
  if (!token) {
    console.error("ERROR 401: Authentication token is missing or invalid.");
    return res.status(401).send("Authentication token is missing or invalid.");
  }
  const ps = new ProductService(token.access_token);
  for (let i = 0; i < scenes.length; i++) {
    selectedMissionFrames.push(await ps.getFrameData(missionID, scenes[i].id));
    console.log("return mission frames");
    console.log(selectedMissionFrames[i]);
  }
  cache.set("selectedMissionFrames", selectedMissionFrames);
  return selectedMissionFrames;
}

router.post("/getMissionInfo", async function (req, res) {
  const { missionID } = req.body;
  const token = await getAuthToken();
  if (!token) {
    console.error("ERROR 401: Authentication token is missing or invalid.");
    return res.status(401).send("Authentication token is missing or invalid.");
  }
  const ps = new ProductService(token.access_token);
  let selectedMissionInfo = await ps.getMissionFootprint(missionID); //await ps.getMissionInfo(missionID);

  console.log("response:");
  console.log(selectedMissionInfo);
  //const framesData = await getFramesData(selectedMissionInfo);
  res.json(selectedMissionInfo);
});

router.get("/getFramesData", getFramesData);

async function refreshCache() {
  const token = await getAuthToken();
  const cache = Cache.getInstance();
  const ps = new ProductService(token.access_token);
  const allProductMetaData = await ps.getAllProducts();
  cache.set("allProducts", allProductMetaData);
}

setInterval(refreshCache, refreshTime);

module.exports = router;
