const fs = require("fs");
var selectedItems = [];

function saveTo() {
  const dir = "./js/localPolygons";
  var fileFind = [];
  fileFind = fs.readdirSync(dir, (err, files) => {
    if (err) {
      console.log(err);
    }
  });
  console.log("TEST");
  console.log(fileFind);
  return fileFind;
}

function itemChange(value, item){
  if(value == true){
    selectedItems.push(item);
    console.log("Item added");
    console.log(selectedItems);
  }
  else{
    if(selectedItems.includes(item)){
      selectedItems.splice(selectedItems.indexOf(item), 1)
    }
    console.log("Item removed");
    console.log(selectedItems);
  }
}

module.exports = saveTo, itemChange;
