const missionMenu = document.getElementById("flyto-mission-info-container");

export function displayMissionMenu(missionProduct, prodOrCust) {
  console.log("displayMissionMenu");
  console.log(missionProduct);
  missionMenu.classList.remove("hidden");
  document.getElementById("flyto-mission-mission-name").innerHTML = missionProduct.title.split(" ")[0];
  document.getElementById("flyto-mission-scene-name").innerHTML = missionProduct.title.split(" ")[1];
  document.getElementById("flyto-mission-mission-id").innerHTML = missionProduct.identifier;
  document.getElementById("flyto-mission-creator").innerHTML = missionProduct.creator;

  document.getElementById("flyto-mission-info-close-button").addEventListener("click", closeMissionInfo);
}

function closeMissionInfo() {
  missionMenu.classList.add("hidden");
}
