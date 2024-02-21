const fs = require("fs");

function saveTo() {
  console.log("HERE");
  const dir = "./localPolygons";
  let count = 1;
  fs.readdir(dir, (err, files) => {
    console.log(files);
  });
  return count;
}

module.exports = saveTo;
