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

function populateFrameDropdown(sceneName, frames, frameSelect) {
  const filteredFrames = frames.filter((frame) => frame.title.includes(sceneName));

  // Sort filtered frames based on the number after "F"
  filteredFrames.sort((a, b) => {
    const numA = parseInt(a.title.split("F")[1]);
    const numB = parseInt(b.title.split("F")[1]);
    return numA - numB;
  });

  filteredFrames.forEach((frame) => {
    const option = document.createElement("option");
    option.value = frame.identifier;
    option.textContent = `F${frame.title.split("F")[1]}`;
    frameSelect.appendChild(option);
  });

  frameSelect.disabled = false;
}

function closedisplayMissionMenu() {
  document.getElementById("flyto-mission-info-container").style.display = "none";
  hideFrames();
}

export async function viewSelectedMission(missionID) {
  try {
    const response = await fetch("/api/getMissionFrames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionID }),
    });
    const data = await response.json();
    await addSelectedMissionFramesToMap(data);
    return data;
  } catch (error) {
    console.error("Error:", error);
  }


function closeMissionInfo() {
  missionMenu.classList.add("hidden");
}
}