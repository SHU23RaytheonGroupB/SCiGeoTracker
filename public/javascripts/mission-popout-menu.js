import { mapFlyTo } from "./map.js";
import { addSelectedMissionFramesToMap, hideFrames, highlightSelectedFrame } from "./products-and-layers.js";

const missionMenu = document.getElementById("flyto-mission-info-container");

export function displayMissionMenu(currentProduct, scenes, frames) {
  missionMenu.classList.remove("hidden");

  document.getElementById("flyto-mission-title").innerHTML = "Mission Data - " + currentProduct.title.split(" ")[0];
  document.getElementById("flyto-mission-scene-name").innerHTML = currentProduct.title.split(" ")[1];
  document.getElementById("flyto-mission-mission-id").innerHTML = currentProduct.identifier;
  document.getElementById("flyto-mission-creator").innerHTML = currentProduct.creator;
  let button = document.getElementById("flyto-mission-info-close-button");
  button.addEventListener("click", closeMissionInfo);
  console.log("frames");
  console.log(frames);
  const sceneSelect = document.getElementById("flyto-mission-scene-select");
  const frameSelect = document.getElementById("flyto-mission-frame-select");

  // Clear previous scene options
  sceneSelect.innerHTML = "<option value='' disabled selected hidden>Select Scene</option>";

  // Clear previous frame options
  frameSelect.innerHTML = "<option value='' disabled selected hidden>Select Frame within Scene</option>";
  frameSelect.disabled = true;

  // Populate scene dropdown
  scenes.forEach((scene) => {
    const option = document.createElement("option");
    option.value = scene.identifier;
    option.textContent = scene.title.split(" ")[1];

    // Set the selected attribute if the scene matches the current product's scene
    if (scene.title.split(" ")[1] === currentProduct.title.split(" ")[1]) {
      option.selected = true;
    }

    sceneSelect.appendChild(option);
  });

  // Populate frame dropdown for the initially selected scene
  populateFrameDropdown(currentProduct.title.split(" ")[1], frames, frameSelect);

  // Event listener for scene selection
  sceneSelect.addEventListener("change", () => {
    const selectedSceneId = sceneSelect.value;
    const selectedScene = scenes.find((scene) => scene.identifier === selectedSceneId);

    mapFlyTo(selectedScene);
    // Update the flyto-mission-scene-name element with the selected scene name
    document.getElementById("flyto-mission-scene-name").innerHTML = selectedScene.title.split(" ")[1];

    // Clear previous frame options
    frameSelect.innerHTML = "<option value='' disabled selected hidden>Select Frame within Scene</option>";
    frameSelect.disabled = true;
    populateFrameDropdown(selectedScene.title.split(" ")[1], frames, frameSelect);
  });

  // Event listener for frame selection
  frameSelect.addEventListener("change", () => {
    const selectedFrameId = frameSelect.value;
    highlightSelectedFrame(selectedFrameId);
  });
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

function closeMissionInfo() {
  missionMenu.classList.add("hidden");
  hideFrames();
}
