const fs = require("fs");

function saveTo() {
  const dir = "./localPolygons";
  var fileFind = []
  fs.readdir(dir, (err, files) => {
    fileFind = files;
  });
  return fileFind;
}

module.exports = saveTo;
