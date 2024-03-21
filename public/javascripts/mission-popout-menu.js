import { addSelectedMissionFramesToMap, hideFrames } from "./products-and-layers.js";

export function displayMissionMenu(currentProduct, scenes, frames) {
  let missionMenu = document.getElementById("flyto-mission-info-container");
  missionMenu.style.display = null;
  document.getElementById("flyto-mission-title").innerHTML = "Mission Data - " + currentProduct.title.split(" ")[0];
  document.getElementById("flyto-mission-scene-name").innerHTML = currentProduct.title.split(" ")[1];
  document.getElementById("flyto-mission-mission-id").innerHTML = currentProduct.identifier;
  document.getElementById("flyto-mission-creator").innerHTML = currentProduct.creator;

  let button = document.getElementById("flyto-mission-info-close-button");
  button.addEventListener("click", closedisplayMissionMenu);

  console.log("frames");
  console.log(frames);

  const sceneSelect = document.getElementById("flyto-mission-scene-select");
  const frameSelect = document.getElementById("flyto-mission-frame-select");

  // Populate scene dropdown
  scenes.forEach((scene) => {
    const option = document.createElement("option");
    option.value = scene.identifier;
    option.textContent = scene.title.split(" ")[1];
    sceneSelect.appendChild(option);
  });

  // Event listener for scene selection
  sceneSelect.addEventListener("change", () => {
    const selectedSceneId = sceneSelect.value;
    const selectedScene = scenes.find((scene) => scene.identifier === selectedSceneId);
    console.log("Selected scene:", selectedScene.title);

    // Clear previous frame options
    frameSelect.innerHTML = "<option>Select Frame within Scene</option>";
    frameSelect.disabled = true;

    if (selectedScene) {
      // Populate frame dropdown based on selected scene
      const filteredFrames = frames.filter((frame) => frame.title.includes(selectedScene.title.split(" ")[1]));
      filteredFrames.forEach((frame) => {
        const option = document.createElement("option");
        option.value = frame.identifier;
        option.textContent = frame.title.split(" ")[3];
        frameSelect.appendChild(option);
      });
      frameSelect.disabled = false;
    }
  });

  // Event listener for frame selection
  frameSelect.addEventListener("change", () => {
    const selectedFrameId = frameSelect.value;
    console.log("Selected frame:", selectedFrameId);
  });
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
}
