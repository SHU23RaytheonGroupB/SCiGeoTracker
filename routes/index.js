var express = require("express");
const saveTo = require("../js/savePolysToSession");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const i = saveTo();
  res.render("index", { title: "Express", files: i });
});

router.post("/", function (req, res, next) {
  req.session.id;
});

module.exports = router;
