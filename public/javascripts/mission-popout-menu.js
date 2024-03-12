export function displayMissionMenu(missionProduct) {
  console.log("displayMissionMenu");
  console.log(missionProduct);
  let missionMenu = document.getElementById("flyto-mission-info-container");
  missionMenu.style.display = null;

  document.getElementById("flyto-mission-mission-name").innerHTML = missionProduct.title.split(" ")[0];
  document.getElementById("flyto-mission-scene-name").innerHTML = missionProduct.title.split(" ")[1];
  document.getElementById("flyto-mission-mission-id").innerHTML = missionProduct.identifier;
  document.getElementById("flyto-mission-creator").innerHTML = missionProduct.creator;

  // Add event listener to button
  let button = document.getElementById("flyto-mission-info-close-button");
  button.addEventListener("click", yourButtonClickHandler);
}

function yourButtonClickHandler() {
  // Handle button click event here
  // console.log("Button clicked!");
  document.getElementById("flyto-mission-info-container").style.display = "none";
}
