var express = require("express");
const ProductService = require("../js/product-requests.js");
const TokenService = require("../js/token-service.js");
var router = express.Router();

const HOSTNAME = "https://hallam.sci-toolset.com/";
const TOKEN_PATH = "api/v1/token";
const USERNAME = "hallam1";
const PASSWORD = "!H%j50H2";
const CLIENT_ID = "sci-toolset";
const CLIENT_SECRET = "st";
const ts = new TokenService(HOSTNAME, TOKEN_PATH, USERNAME, PASSWORD, CLIENT_ID, CLIENT_SECRET);

async function getAuthToken(req) {
  if (!req.session.token) {
    req.session.token = await ts.generateToken();
    req.session.token.expires_in = TokenService.convertExpiryTime(req.session.token);
  } else if (!TokenService.isSessionValid(req.session.token)) {
    console.log("token refresh");
    const refreshedToken = await ts.refreshAccessToken(req.session.token);
    req.session.token.expires_in = TokenService.convertExpiryTime(refreshedToken);
    req.session.token.access_token = refreshedToken.access_token;
  }
  return req.session.token.access_token;
}

/* getProducts. */
router.get("/getProducts", async function (req, res, next) {
  const accessToken = await getAuthToken(req);
  if (!accessToken) {
    console.error("ERROR 401: Authentication token is missing or invalid.");
    return res.status(401).send("Authentication token is missing or invalid.");
  }
  try {
    const ps = new ProductService(accessToken);
    const allProductMetaData = await ps.getAllProducts();
    res.json(allProductMetaData);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products.");
  }
});

module.exports = router
