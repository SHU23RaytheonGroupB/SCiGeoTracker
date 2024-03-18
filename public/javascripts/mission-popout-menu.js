export function displayMissionMenu(missionProduct, prodOrCust) {
  console.log("displayMissionMenu");
  console.log(missionProduct);
  let missionMenu = document.getElementById("flyto-mission-info-container");
  missionMenu.style.display = null;
  if(prodOrCust){
    document.getElementById("flyto-mission-title").innerHTML = "Mission Data";
    document.getElementById("flyto-mission-scene-title").innerHTML = "Scene Name";
    document.getElementById("flyto-mission-mission-title").innerHTML = "Mission Name";
    document.getElementById("flyto-mission-id-title").innerHTML = "Mission ID";
    document.getElementById("flyto-mission-creator-title").innerHTML = "Creator";
       
    document.getElementById("flyto-mission-mission-name").innerHTML = missionProduct.title.split(" ")[0];
    document.getElementById("flyto-mission-scene-name").innerHTML = missionProduct.title.split(" ")[1];
    document.getElementById("flyto-mission-mission-id").innerHTML = missionProduct.identifier;
    document.getElementById("flyto-mission-creator").innerHTML = missionProduct.creator;
  }
  else{
    document.getElementById("flyto-mission-title").innerHTML = "Custom Polygon Data";
    document.getElementById("flyto-mission-scene-title").innerHTML = "Scene Name";
    document.getElementById("flyto-mission-mission-title").innerHTML = "Mission Name";
    document.getElementById("flyto-mission-id-title").innerHTML = "Mission ID";
    document.getElementById("flyto-mission-creator-title").innerHTML = "Creator";
       
    document.getElementById("flyto-mission-mission-name").innerHTML = missionProduct.title.split(" ")[0];
    document.getElementById("flyto-mission-scene-name").innerHTML = missionProduct.title.split(" ")[1];
    document.getElementById("flyto-mission-mission-id").innerHTML = missionProduct.identifier;
    document.getElementById("flyto-mission-creator").innerHTML = missionProduct.creator;
  }
  // Add event listener to button
  let button = document.getElementById("flyto-mission-info-close-button");
  button.addEventListener("click", yourButtonClickHandler);
}

function yourButtonClickHandler() {
  // Handle button click event here
  // console.log("Button clicked!");
  document.getElementById("flyto-mission-info-container").style.display = "none";
}
