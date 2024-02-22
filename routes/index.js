var express = require("express");
var router = express.Router();
const saveTo = require("../js/savePolysToSession.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  const i = saveTo();
  res.render("index", { title: "Express", files: i });
});

router.post("/", function (req, res, next) {
  req.session.id;
});

module.exports = router;