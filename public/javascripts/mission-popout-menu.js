export function displayMissionMenu(currentProduct) {
  let missionMenu = document.getElementById("flyto-mission-info-container");
  missionMenu.style.display = null;
  document.getElementById("flyto-mission-mission-name").innerHTML = currentProduct.title.split(" ")[0];
  document.getElementById("flyto-mission-scene-name").innerHTML = currentProduct.title.split(" ")[1];
  document.getElementById("flyto-mission-mission-id").innerHTML = currentProduct.identifier;
  document.getElementById("flyto-mission-creator").innerHTML = currentProduct.creator;

  // for (let i = 0; i <= sceneIDs.length - 1; i++) {
  //   console.log(`sceneID: ${sceneIDs[i]}`);
  // }

  let button = document.getElementById("flyto-mission-info-close-button");
  button.addEventListener("click", closedisplayMissionMenu);
}

function closedisplayMissionMenu() {
  document.getElementById("flyto-mission-info-container").style.display = "none";
}
