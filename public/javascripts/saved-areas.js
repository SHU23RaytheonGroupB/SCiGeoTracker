import { polygonData, updateArea, updateActivty } from "./area-calculations.js";
import { productFillColours, productOutlineColours, mapStyle } from "./config.js";
import { allProducts } from "./products-and-layers.js";
import { fileDisplayMode } from "./map-controls.js";

class Activity {
  constructor(Name, Deadline, PolygonArr, Comments) {
    //user generated
    this.name = Name;
    this.deadline = Deadline.toLocaleString();
    this.areaPoly = PolygonArr;
    //auto generated
    this.createdDate = new Date().toLocaleString();
    this.comments = Comments;
    this.relatedMissions = [];
    this.author = "Data analyst (PLACEHOLDER)";
  }
}

function activitieCreation(name, deadline, comments, polygonData) {
  var featureHallam = polygonData.features[0];
  var FCfeatureHallam = [];
  FCfeatureHallam.push(featureHallam);
  savedActivties.push(new Activity(name, new Date(deadline), FCfeatureHallam, comments));

  updateActivties();
  closeNameBoxActivity();
}

//very temp!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!e
//sessionStorage.removeItem("savedActivties");

let selectedAreas = [];
let selectedActivties = [];

let savedAreas = JSON.parse(sessionStorage.getItem("savedAreas") ?? "[]");
let savedActivties = JSON.parse(sessionStorage.getItem("savedActivties") ?? "[]");

const saveSavedAreas = () => {
  sessionStorage.setItem("savedAreas", JSON.stringify(savedAreas));
};

const updateActivties = () => {
  sessionStorage.setItem("savedActivties", JSON.stringify(savedActivties));
};

export function displayAllFiles() {
  saveSavedAreas();
  updateActivties();
  if (savedAreasOpen) {
    openSavedAreas();
  }
  document.querySelector("#files-all-display-button");
}

export function displayActivitiesFiles() {
  updateActivties();
  if (savedAreasOpen) {
    openSavedAreas();
  }
  document.querySelector("#files-all-display-button");
}

export function displaygeojsonFiles() {
  saveSavedAreas();
  if (savedAreasOpen) {
    openSavedAreas();
  }
  document.querySelector("#files-all-display-button");
}

const areaSelectionInfoCloseButtonEle = document.querySelector("#area-selection-info-close-button");
const activitySelectionInfoCloseButtonEle = document.querySelector("#activity-selection-info-close-button");
const savedAreasUpload = document.querySelector("#saved-areas-upload");

export function initialiseSavedAreas(draw) {
  const filesSearch = document.querySelector("#file-search");

  filesSearch.addEventListener("change", savedSearchChanged);

  savedAreasUpload.oninput = importFiles;
  document.querySelector("#saved-areas-export-button").onclick = exportFiles;

  document.querySelector("#saved-areas-close-button").onclick = closeSavedAreas;
  document.querySelector("#folder-button").onclick = () => {
    //console.log(savedAreasOpen);
    if (!savedAreasOpen) openSavedAreas();
    else closeSavedAreas();
  };

  document.querySelector("#area-selection-info-activity-button").onclick = saveNewActivity;
  document.querySelector("#area-selection-info-save-button").onclick = saveNewPolygon;
  document.querySelector("#name-new-area-close-button").onclick = closeNameBox;
  document.querySelector("#name-new-activity-close-button").onclick = closeNameBoxActivity;

  let nameTextBox = document.getElementById("name-area-textbox");
  let createPoly = document.getElementById("confirm-name-button");
  createPoly.addEventListener("click", () => createNewPoly(nameTextBox.value, polygonData));

  let createActivity = document.getElementById("confirm-activity-button");
  let nameTextBoxActivity = document.getElementById("name-activity-textbox");
  let dateTextBoxActivity = document.getElementById("date-activity-textbox");
  let commentsTextBoxActivity = document.getElementById("comments-activity-textbox");
  createActivity.addEventListener("click", () =>
    activitieCreation(nameTextBoxActivity.value, dateTextBoxActivity.value, commentsTextBoxActivity.value, polygonData)
  );

  document.querySelector("#saved-areas-import-button").onclick = openFile;

  areaSelectionInfoCloseButtonEle.onclick = () => closeSelectionInfo(draw);
  activitySelectionInfoCloseButtonEle.onclick = () => closeactSelectionInfo();
}

function closeSelectionInfo(draw) {
  //console.log("fjf");
  draw.deleteAll();
  document.getElementById("area-selection-info-container").classList.add("hidden");
  //console.log("fjfdasd");
  document.getElementById("name-area-container").classList.add("hidden");
  // let text = document.getElementById("name-area-textbox");
  // text.value = "";
  //document.getElementById("area-selection-info-save-button").classList.add("hidden");
  if (map.getLayer("mission-area-within-polyfill") != undefined) {
    window.map.setLayoutProperty("mission-area-within-polyfill", "visibility", "none");
  }
}

var currentActivity;

function closeactSelectionInfo() {
  //console.log("fjf");
  var source = window.map.getSource(currentActivity.name + "-CUSTOM");
  if (source != undefined) {
    window.map.removeLayer(currentActivity.name + "-CUSTOM-frames-fill");
    window.map.removeLayer(currentActivity.name + "-CUSTOM-frames-outline");
    window.map.removeSource(currentActivity.name + "-CUSTOM");
  }
  document.getElementById("activity-selection-info-container").classList.add("hidden");
  //console.log("fjfdasd");
  //document.getElementById("name-area-container").classList.add("hidden");
  // let text = document.getElementById("name-area-textbox");
  // text.value = "";
  //document.getElementById("area-selection-info-save-button").classList.add("hidden");
  if (map.getLayer("mission-area-within-polyfill") != undefined) {
    window.map.setLayoutProperty("mission-area-within-polyfill", "visibility", "none");
  }
}

//if no saved areas make some temp ones for demo
if (savedAreas.length == 0) {
  var coordCol = [
    [
      [-5.976526999921077, 55.056598000097665],
      [-5.993442000248081, 55.059413999556511],
      [-6.020147999730341, 55.057172999634304],
      [-6.042815000012183, 55.05566700033188],
      [-6.055729000193139, 55.068872000442525],
      [-6.036681000427791, 55.106579000020872],
      [-6.028465000159599, 55.161832000246648],
      [-6.067552000424428, 55.196554999813429],
      [-6.139336000356082, 55.224305999822093],
      [-6.235589000032292, 55.205505999802085],
      [-6.335820999739326, 55.239054000042131],
      [-6.370510000436127, 55.244235999791613],
      [-6.407193999603351, 55.233462000271174],
      [-6.456692999782092, 55.245420999579494],
      [-6.479918999761992, 55.251032000226701],
      [-6.52495299998094, 55.23440399964494],
      [-6.538654999628477, 55.220199000183754],
      [-6.713415999948381, 55.191651000293461],
      [-6.737975000246024, 55.170759000027886],
      [-6.881336999602809, 55.16938899980255],
      [-6.959173999880136, 55.193067999988273],
      [-6.964190000068413, 55.161832000246648],
      [-6.994062999907499, 55.109956000169348],
      [-7.018503000113299, 55.099046999819222],
      [-7.018396999721688, 55.074802999658743],
      [-7.047597000001474, 55.052161999676571],
      [-7.149065000049688, 55.043380000286845],
      [-7.151069999880519, 55.056491999706054],
      [-7.180065999746034, 55.060331999622122],
      [-7.223772999923938, 55.058123000276282],
      [-7.248128999853407, 55.04687599962773],
      [-7.256067999938182, 55.067035000265093],
      [-7.28844199999827, 55.051857000000609],
      [-7.348738999904867, 55.045491999656122],
      [-7.390325000298503, 55.018304999576117],
      [-7.405780999893182, 54.94964199967859],
      [-7.445468999994318, 54.923837000377318],
      [-7.449488000071085, 54.86733700020244],
      [-7.48446599970606, 54.826811000127634],
      [-7.539319000371506, 54.794015000391994],
      [-7.549746000077789, 54.74664400032043],
      [-7.641523000186282, 54.747392999787166],
      [-7.749423000071374, 54.708833000442667],
      [-7.829879999762113, 54.731520999894258],
      [-7.85003500021503, 54.723912999785171],
      [-7.911490999609896, 54.693026999996107],
      [-7.900202999768567, 54.666390000098488],
      [-7.85003500021503, 54.63863399985928],
      [-7.80955699965574, 54.637917000069535],
      [-7.752427000105911, 54.622993999873245],
      [-7.714067000091916, 54.628021999715543],
      [-7.703410999717789, 54.608287999791401],
      [-7.786456000044325, 54.580860000288851],
      [-7.85003500021503, 54.536827000365804],
      [-7.937037999603945, 54.534277999729966],
      [-7.99931399994108, 54.543801000016174],
      [-8.015892000015754, 54.525688000201114],
      [-8.048482000144134, 54.490078000199617],
      [-8.160230000314243, 54.464765000204636],
      [-8.149254999618506, 54.451175000326032],
      [-8.151423999817666, 54.436907999804419],
      [-8.097684000116487, 54.40539099969493],
      [-8.054375000305981, 54.367982000369068],
      [-8.002792000250565, 54.355553000070927],
      [-7.981521999640506, 54.336077000353328],
      [-7.951698000262468, 54.308769000089342],
      [-7.872486000428523, 54.290337999998769],
      [-7.854620000312707, 54.222321000214038],
      [-7.845706000231701, 54.213514999717518],
      [-7.813182000448933, 54.202740000150925],
      [-7.692732000081719, 54.204695000374045],
      [-7.674049000061245, 54.184721000174079],
      [-7.632595000358947, 54.170182999745691],
      [-7.612389000252108, 54.146029000138299],
      [-7.578668000128062, 54.13974499993185],
      [-7.554732999828047, 54.12465800026655],
      [-7.525894000008066, 54.133443999840779],
      [-7.481296000110262, 54.123880000361794],
      [-7.450347000113936, 54.147810999578041],
      [-7.41368200002421, 54.155023000311246],
      [-7.421016000088287, 54.140018999976917],
      [-7.381919000261632, 54.13881300011991],
      [-7.388001000146005, 54.123928999923464],
      [-7.361840999762308, 54.129110999672946],
      [-7.318662999697608, 54.116369000229213],
      [-7.280684000166445, 54.12436200010626],
      [-7.256038000353385, 54.154755999689712],
      [-7.250752000304544, 54.171229000318192],
      [-7.256825999819966, 54.188144999791973],
      [-7.239410999817721, 54.205863000277304],
      [-7.147417999640936, 54.227412000263655],
      [-7.148215999568663, 54.257348000310003],
      [-7.174557000205368, 54.273561999786523],
      [-7.177051000103518, 54.28551799985587],
      [-7.208331000075532, 54.298746000127835],
      [-7.180517999905703, 54.313941000276998],
      [-7.187971000061566, 54.336077000353328],
      [-7.150911999788889, 54.338151999815011],
      [-7.116254999668456, 54.352476000267245],
      [-7.060524999928759, 54.404978000434426],
      [-7.028070999776787, 54.418111999968858],
      [-6.922943000019416, 54.378534999590613],
      [-6.902265999776034, 54.353723000216348],
      [-6.870294000267847, 54.336077000353328],
      [-6.864229000268097, 54.330165000214663],
      [-6.854627999982142, 54.291135999926496],
      [-6.874565000274515, 54.278118000345501],
      [-6.832252999676143, 54.262826000219775],
      [-6.814943000019412, 54.226112999715212],
      [-6.794335000259991, 54.210012000053837],
      [-6.737425000063638, 54.183784000131539],
      [-6.696959000057745, 54.199402000002351],
      [-6.643908999800431, 54.180019000076868],
      [-6.6333339995644, 54.151171999887936],
      [-6.657432000186589, 54.11856099969043],
      [-6.649057999826766, 54.099479000155782],
      [-6.657496000440005, 54.081049000111307],
      [-6.662600000189798, 54.069901000430889],
      [-6.627767000046958, 54.041656000124362],
      [-6.594991000334346, 54.044673999905228],
      [-6.579256999610777, 54.054729999589881],
      [-6.51132700024084, 54.056055000437993],
      [-6.474531000405307, 54.072741000097153],
      [-6.456692999782092, 54.066218999707132],
      [-6.438672999759092, 54.059630999870819],
      [-6.395823999577885, 54.061483999886718],
      [-6.364012000253581, 54.081049000111307],
      [-6.359749999762641, 54.112176000222291],
      [-6.342991000334337, 54.110466999652374],
      [-6.32395999955429, 54.093085000272595],
      [-6.291914000230861, 54.111576999578915],
      [-6.268014999792342, 54.102336999752765],
      [-6.202752000204612, 54.097981000322989],
      [-6.182183999591871, 54.081049000111307],
      [-6.168641000082062, 54.069901000430889],
      [-6.096336000406041, 54.060290999729887],
      [-6.085302999733585, 54.050848000434939],
      [-6.095733999624315, 54.038987000249904],
      [-6.065447999625462, 54.02787300033873],
      [-6.019127000310789, 54.040960000403743],
      [-5.965708000124039, 54.069901000430889],
      [-5.946683999666789, 54.081049000111307],
      [-5.896606999813116, 54.110395999975481],
      [-5.87518300019525, 54.165088000410947],
      [-5.884167999953206, 54.206620000112991],
      [-5.857342000333006, 54.228664000443302],
      [-5.821331999871859, 54.244332999968037],
      [-5.735461999671486, 54.251382000379067],
      [-5.689045999573182, 54.247657000370339],
      [-5.655600999586397, 54.234165999661229],
      [-5.637363000302173, 54.252725000258636],
      [-5.607450000417145, 54.25660999955187],
      [-5.562596999551829, 54.291780999993193],
      [-5.544172999784053, 54.291144000295446],
      [-5.540148000329907, 54.319455000048265],
      [-5.546337999798823, 54.336077000353328],
      [-5.558875999727547, 54.369747999970286],
      [-5.581118000195488, 54.379684999563153],
      [-5.644391999790912, 54.368088999907457],
      [-5.668015000092112, 54.37228400000663],
      [-5.642226999776199, 54.411784000431339],
      [-5.637345000371397, 54.437801999662611],
      [-5.64603800015351, 54.459030000134476],
      [-5.650490999559906, 54.486881000257995],
      [-5.668781000342847, 54.501140000410771],
      [-5.663360000363696, 54.517656000324223],
      [-5.703190999864717, 54.538779999597352],
      [-5.680932000411417, 54.578339000044878],
      [-5.558910000396168, 54.523782999585819],
      [-5.541871999792932, 54.492384999568117],
      [-5.536075999607647, 54.451934000253971],
      [-5.570825000373418, 54.420157999891842],
      [-5.574921000403776, 54.404255000368039],
      [-5.527923999592872, 54.349024000257486],
      [-5.504634000258875, 54.338737999858836],
      [-5.484941000426772, 54.375071999972874],
      [-5.464642999674652, 54.38945000021738],
      [-5.474094000237869, 54.428317000229413],
      [-5.443264000333329, 54.45519899973408],
      [-5.438172000237557, 54.483504000109576],
      [-5.466448000175035, 54.507975999992482],
      [-5.48365300038563, 54.567995999715663],
      [-5.520392000290542, 54.600973999750352],
      [-5.540837999773828, 54.64938400007162],
      [-5.587299000148676, 54.674761000319961],
      [-5.626600000389658, 54.677265999826091],
      [-5.675320999764267, 54.666352000144741],
      [-5.744721000373829, 54.674392000390583],
      [-5.803518000355382, 54.658741999943402],
      [-5.855335999556701, 54.633770000385255],
      [-5.912930999865694, 54.648037000007605],
      [-5.894119000191665, 54.673312000048838],
      [-5.868339000244646, 54.688769999735769],
      [-5.712333999714247, 54.747603999624914],
      [-5.7085509997288, 54.751853999562456],
      [-5.694810000081418, 54.77000500023064],
      [-5.693322999856491, 54.800030999930755],
      [-5.717090999649884, 54.836763999558968],
      [-5.760285999599148, 54.854475999767601],
      [-5.781583999701752, 54.84865800036647],
      [-5.77245000026727, 54.824576999628903],
      [-5.800107999584441, 54.828479999752233],
      [-5.806663999743762, 54.858282999960522],
      [-5.836205999607159, 54.888962000096285],
      [-5.878289000436951, 54.912093000191874],
      [-5.922658999713008, 54.961063000257298],
      [-5.978950000142333, 54.984516999959624],
      [-5.9692040003643, 55.03689399975832],
      [-5.976526999921077, 55.056598000097665],
    ],
  ];

  for (let i = 0; i < 10; i++) {
    savedAreas.push({
      type: "FeatureCollection",
      properties: { name: "Test File " + i },
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: coordCol,
          },
        },
      ],
    });
    saveSavedAreas();
  }
}

//if no activites make some temp ones for demo
if (savedActivties.length == 0) {
  var featureHallam = {
    type: "FeatureCollection",
    properties: { name: "hallam" },
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-1.479, 53.374],
              [-1.466, 53.383],
              [-1.46, 53.379],
              [-1.47, 53.371],
              [-1.479, 53.374],
            ],
          ],
        },
      },
    ],
  };
  var FCfeatureHallam = [];
  FCfeatureHallam.push(featureHallam);
  console.log(FCfeatureHallam[0]);
  console.log(0);

  savedActivties.push(
    new Activity("Mission over Sheff Hallam Uni", new Date("2024-03-22"), FCfeatureHallam, "Client meeting :)")
  );

  var featureLondon = {
    type: "Feature",
    properties: { name: "london" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-1.479, 53.374],
          [-1.466, 53.383],
          [-1.46, 53.379],
          [-1.47, 53.371],
          [-1.479, 53.374],
        ],
      ],
    },
  };
  var FCfeatureLondon = [];
  FCfeatureLondon.push(featureLondon);
  savedActivties.push(
    new Activity("Incident in London", new Date("2025-12-04"), FCfeatureLondon, "something has happend")
  );

  updateActivties();
}

const filesContainerEle = document.querySelector("#file-container");
const filesListEle = document.querySelector("#file-list");
const filesSearch = document.querySelector("#file-search");

let searchedAreas = savedAreas;

const savedSearchChanged = () => {
  if (filesSearch.value.length == 0) {
    searchedAreas = savedAreas;
    openSavedAreas();
  } else {
    let tempArray = [];
    savedAreas.forEach((area) => {
      if (area.name.includes(filesSearch.value) == true) {
        tempArray.push(area);
      }
    });
    if (tempArray != searchedAreas) {
      searchedAreas = tempArray;
      openSavedAreas();
    }
  }
};

let savedAreasOpen = false;
const openSavedAreas = () => {
  savedAreasOpen = true;
  filesListEle.replaceChildren(); //remove everything
  //console.log(fileDisplayMode);
  if (fileDisplayMode == 1) {
    //Activities
    savedActivties.forEach((savedActivty) => {
      displaySavedActivty(savedActivty);
    });
  } else if (fileDisplayMode == 2) {
    //GeoJSONS
    searchedAreas.forEach((savedArea) => {
      displaySavedArea(savedArea);
    });
  } else {
    //All
    savedActivties.forEach((savedActivty) => {
      displaySavedActivty(savedActivty);
    });
    searchedAreas.forEach((savedArea) => {
      displaySavedArea(savedArea);
    });
  }
  filesContainerEle.classList.remove("hidden");
  filesContainerEle.focus();
};

function displaySavedActivty(savedActivty) {
  var tempContent = "";
  const filesContainerEle = document.createElement("div");
  filesContainerEle.className =
    "p-1.5 rounded-md dark:bg-neutral-800 ring-1 ring-neutral-600/50 ring-neutral-700/50 bg-neutral-300/90 flex flex-row gap-1 flex";
  const savedActivtyCheckboxEle = document.createElement("input");
  savedActivtyCheckboxEle.type = "checkbox";
  savedActivtyCheckboxEle.name = "saved-Activty-checkbox";
  savedActivtyCheckboxEle.className =
    "w-4 h-4 my-auto text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600";
  filesContainerEle.append(savedActivtyCheckboxEle);
  const fileNameEle = document.createElement("span");
  fileNameEle.className = "grow my-auto";
  fileNameEle.textContent = savedActivty.name;
  filesContainerEle.append(fileNameEle);

  //create all buttons
  const activityMarkEle = document.createElement("button");
  const savedAreaViewButtonEle = document.createElement("button");
  const savedAreaEditButtonEle = document.createElement("button");
  const savedAreaDeleteButtonEle = document.createElement("button");

  //name all buttons
  activityMarkEle.name = "activity-mark-Ele";
  savedAreaViewButtonEle.name = "activity-view-button";
  savedAreaEditButtonEle.name = "activity-edit-button";
  savedAreaDeleteButtonEle.name = "activity-delete-button";

  //style all buttons
  const buttonClasses =
    "ml-auto my-auto p-1 rounded-md bg-neutral-100/90 hover:bg-neutral-100 dark:bg-neutral-700/70 dark:hover:bg-neutral-700 ring-1 ring-neutral-600/50";
  activityMarkEle.className = buttonClasses;
  savedAreaViewButtonEle.className = buttonClasses;
  savedAreaEditButtonEle.className = buttonClasses;
  savedAreaDeleteButtonEle.className = buttonClasses;

  //add images to all buttons
  activityMarkEle.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
  <text x="4" y="25" font-size="30" fill="white">A</text>
  </svg> `;
  savedAreaViewButtonEle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
<path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
</svg>`;
  savedAreaEditButtonEle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
<path d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z"></path>
</svg>`;
  savedAreaDeleteButtonEle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4 fill-red-600">
<path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z M 12 13 C 12.25575 13 12.511531 13.097469 12.707031 13.292969 L 15 15.585938 L 17.292969 13.292969 C 17.683969 12.901969 18.316031 12.901969 18.707031 13.292969 C 19.098031 13.683969 19.098031 14.316031 18.707031 14.707031 L 16.414062 17 L 18.707031 19.292969 C 19.098031 19.683969 19.098031 20.316031 18.707031 20.707031 C 18.512031 20.902031 18.256 21 18 21 C 17.744 21 17.487969 20.902031 17.292969 20.707031 L 15 18.414062 L 12.707031 20.707031 C 12.512031 20.902031 12.256 21 12 21 C 11.744 21 11.487969 20.902031 11.292969 20.707031 C 10.901969 20.316031 10.901969 19.683969 11.292969 19.292969 L 13.585938 17 L 11.292969 14.707031 C 10.901969 14.316031 10.901969 13.683969 11.292969 13.292969 C 11.488469 13.097469 11.74425 13 12 13 z"></path>
</svg>`;
  //     savedAreaDeleteButtonEle.innerHTML = `
  // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4 fill-red-600">
  //   <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
  // </svg>`;

  savedActivtyCheckboxEle.onclick = () => {
    if (selectedActivties.includes(savedActivty)) {
      selectedActivties.splice(selectedActivties.indexOf(savedActivty), 1);
    } else {
      selectedActivties.push(savedActivty);
    }
  };
  savedAreaViewButtonEle.onclick = () => {
    if (fileNameEle.contentEditable == "true") {
      fileNameEle.contentEditable = "false";
      savedAreaViewButtonEle.src = "images/icons8-edit-90.png";
      savedAreaViewButtonEle.src = "images/icons8-map-90.png";
      fileNameEle.textContent = tempContent;
    } else {
      var mapSource = window.map.getSource(savedActivty.name + "-CUSTOM");
      if (mapSource == undefined) {
        console.log(savedActivty);
        window.map.addSource(savedActivty.name + "-CUSTOM", {
          type: "geojson",
          data: savedActivty.areaPoly[0].geometry,
        });
        window.map.addLayer({
          id: savedActivty.name + "-CUSTOM-frames-fill",
          type: "fill",
          source: savedActivty.name + "-CUSTOM",
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": productFillColours[mapStyle.currentStyle]["SCENE"],
            "fill-opacity": 0.2,
          },
        });
        window.map.addLayer({
          id: savedActivty.name + "-CUSTOM-frames-outline",
          type: "line",
          source: savedActivty.name + "-CUSTOM",
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": productOutlineColours["SCENE"],
            "line-width": 1,
          },
        });
      } else {
        if (map.getLayoutProperty(savedActivty.name + "-CUSTOM-frames-fill", "visibility") == "none") {
          window.map.setLayoutProperty(savedActivty.name + "-CUSTOM-frames-fill", "visibility", "visible");
          window.map.setLayoutProperty(savedActivty.name + "-CUSTOM-frames-outline", "visibility", "visible");
        } else {
          window.map.setLayoutProperty(savedActivty.name + "-CUSTOM-frames-fill", "visibility", "none");
          window.map.setLayoutProperty(savedActivty.name + "-CUSTOM-frames-outline", "visibility", "none");
        }
      }
      let infoCloseButton = document.getElementById("area-selection-info-close-button");
      infoCloseButton.addEventListener("click", closeInfoListener);

      function closeInfoListener() {
        window.map.setLayoutProperty(savedActivty.name + "-CUSTOM-frames-fill", "visibility", "none");
        window.map.setLayoutProperty(savedActivty.name + "-CUSTOM-frames-outline", "visibility", "none");
      }

      closeSavedAreas();
      //try{
      var xCoords = 0;
      var arrCount = 0;
      var yCoords = 0;
      for (var a = 0; a < savedActivty.areaPoly[0].geometry.coordinates[0].length; a++) {
        xCoords += savedActivty.areaPoly[0].geometry.coordinates[0][a][0];
        arrCount++;
        yCoords += savedActivty.areaPoly[0].geometry.coordinates[0][a][1];
      }

      var savedActivtyAsFC = {
        type: "FeatureCollection",
        properties: { name: savedActivty.name },
        features: [savedActivty.areaPoly[0]],
      };

      //var savedActivtyAsFC = savedActivty.areaPoly[0]
      const activityNameContainerEle = document.querySelector("#activity-Discription-name-value");
      const activitySetDateContainerEle = document.querySelector("#activity-Discription-set-date-value");
      const activityDeadLineContainerEle = document.querySelector("#activity-Discription-deadline-value");
      const activityAuthorContainerEle = document.querySelector("#activity-Discription-author-value");
      const activityCommentsContainerEle = document.querySelector("#activity-Discription-comments-value");

      activityNameContainerEle.textContent = savedActivty.name;
      activitySetDateContainerEle.textContent = savedActivty.createdDate;
      activityDeadLineContainerEle.textContent = savedActivty.deadline;
      activityAuthorContainerEle.textContent = savedActivty.author;
      activityCommentsContainerEle.textContent = savedActivty.comments;
      currentActivity = savedActivty;
      updateActivty(allProducts, savedActivtyAsFC);
      //var centerOfActity = turf.center(savedActivty.areaPoly[0]);
      //var dist = getDistance(centerOfActity[0][0], centerOfActity[0][1]); //use savedActivty's center
      //var zoom = getZoomFromDistance(dist);

      const boundingBox = turf.bbox(savedActivty.areaPoly[0]);
      const bounds = [boundingBox.slice(0, 2), boundingBox.slice(2, 4)];
      window.map.fitBounds(bounds, {
        padding: 50,
      });

      // map.flyTo({
      //   center: [xAverage, yAverage],
      //   zoom: 7.5,
      //   essential: true,
      // });
      //}
      //catch{}
    }
  };
  savedAreaEditButtonEle.onclick = () => {
    if (fileNameEle.contentEditable == "false" || fileNameEle.contentEditable == "inherit") {
      tempContent = fileNameEle.textContent;
      fileNameEle.contentEditable = "true";
      fileNameEle.focus();
      //fileNameEle.select(); either highlight or put cursor at end
      savedAreaEditButtonEle.src = "images/icons8-tick-30.png";
      savedAreaEditButtonEle.src = "images/icons8-cross-30.png";
    } else {
      fileNameEle.contentEditable = "false";
      savedAreaEditButtonEle.src = "images/icons8-edit-90.png";
      savedAreaEditButtonEle.src = "images/icons8-map-90.png";
      fileNameEle.textContent = fileNameEle.textContent.trim();
      if (fileNameEle.textContent.length != 0) {
        savedActivty.name = fileNameEle.textContent;
        saveSavedAreas();
      } else {
        fileNameEle.textContent = tempContent;
      }
    }
  };
  savedAreaDeleteButtonEle.onclick = () => {
    var message = "Confirm deletion?";
    if (selectedActivties.length != 0) {
      message += " Multiple items selected.";
    }

    if (confirm(message) == true) {
      selectedActivties.push(savedActivty);
      selectedActivties.forEach((Activty) => {
        selectedActivties.splice(selectedActivties.indexOf(Activty), 1);
      });
      selectedActivties = [];
      refreshSavedScreen();
    }
  };
  filesContainerEle.append(activityMarkEle);
  filesContainerEle.append(savedAreaViewButtonEle);
  filesContainerEle.append(savedAreaEditButtonEle);
  filesContainerEle.append(savedAreaDeleteButtonEle);
  filesListEle.append(filesContainerEle);
}

function displaySavedArea(savedArea) {
  var tempContent = "";
  const filesContainerEle = document.createElement("div");
  filesContainerEle.className =
    "p-1.5 rounded-md dark:bg-neutral-800 ring-1 ring-neutral-600/50 ring-neutral-700/50 bg-neutral-300/90 flex flex-row gap-1 flex";
  const savedAreaCheckboxEle = document.createElement("input");
  savedAreaCheckboxEle.type = "checkbox";
  savedAreaCheckboxEle.name = "saved-area-checkbox";
  savedAreaCheckboxEle.className =
    "w-4 h-4 my-auto text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600";
  filesContainerEle.append(savedAreaCheckboxEle);
  const fileNameEle = document.createElement("span");
  fileNameEle.className = "grow my-auto";
  console.log(savedArea);
  fileNameEle.textContent = savedArea.properties.name;
  filesContainerEle.append(fileNameEle);
  const savedAreaViewButtonEle = document.createElement("button");
  const savedAreaEditButtonEle = document.createElement("button");
  const savedAreaDeleteButtonEle = document.createElement("button");
  savedAreaViewButtonEle.name = "saved-area-view-button";
  savedAreaEditButtonEle.name = "saved-area-edit-button";
  savedAreaDeleteButtonEle.name = "saved-area-delete-button";
  const buttonClasses =
    "ml-auto my-auto p-1 rounded-md bg-neutral-100/90 hover:bg-neutral-100 dark:bg-neutral-700/70 dark:hover:bg-neutral-700 ring-1 ring-neutral-600/50";
  savedAreaViewButtonEle.className = buttonClasses;
  savedAreaEditButtonEle.className = buttonClasses;
  savedAreaDeleteButtonEle.className = buttonClasses;
  savedAreaViewButtonEle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
<path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
</svg>`;
  savedAreaEditButtonEle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
<path d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z"></path>
</svg>`;
  savedAreaDeleteButtonEle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4 fill-red-600">
<path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z M 12 13 C 12.25575 13 12.511531 13.097469 12.707031 13.292969 L 15 15.585938 L 17.292969 13.292969 C 17.683969 12.901969 18.316031 12.901969 18.707031 13.292969 C 19.098031 13.683969 19.098031 14.316031 18.707031 14.707031 L 16.414062 17 L 18.707031 19.292969 C 19.098031 19.683969 19.098031 20.316031 18.707031 20.707031 C 18.512031 20.902031 18.256 21 18 21 C 17.744 21 17.487969 20.902031 17.292969 20.707031 L 15 18.414062 L 12.707031 20.707031 C 12.512031 20.902031 12.256 21 12 21 C 11.744 21 11.487969 20.902031 11.292969 20.707031 C 10.901969 20.316031 10.901969 19.683969 11.292969 19.292969 L 13.585938 17 L 11.292969 14.707031 C 10.901969 14.316031 10.901969 13.683969 11.292969 13.292969 C 11.488469 13.097469 11.74425 13 12 13 z"></path>
</svg>`;
  //     savedAreaDeleteButtonEle.innerHTML = `
  // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4 fill-red-600">
  //   <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
  // </svg>`;

  savedAreaCheckboxEle.onclick = () => {
    if (selectedAreas.includes(savedArea)) {
      selectedAreas.splice(selectedAreas.indexOf(savedArea), 1);
    } else {
      selectedAreas.push(savedArea);
    }
  };
  savedAreaViewButtonEle.onclick = () => {
    if (fileNameEle.contentEditable == "true") {
      fileNameEle.contentEditable = "false";
      savedAreaViewButtonEle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
      <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
      </svg>`;
      savedAreaEditButtonEle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
      <path d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z"></path>
      </svg>`;
      fileNameEle.textContent = tempContent;
    } else {
      var mapSource = map.getSource(savedArea.properties.name + "-CUSTOM");
      console.log(savedArea);
      if (mapSource == undefined) {
        map.addSource(savedArea.properties.name + "-CUSTOM", {
          type: "geojson",
          data: savedArea.features[0].geometry,
        });
        map.addLayer({
          id: savedArea.properties.name + "-CUSTOM-frames-fill",
          type: "fill",
          source: savedArea.properties.name + "-CUSTOM",
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": productFillColours[mapStyle.currentStyle]["SCENE"],
            "fill-opacity": 0.2,
          },
        });
        map.addLayer({
          id: savedArea.properties.name + "-CUSTOM-frames-outline",
          type: "line",
          source: savedArea.properties.name + "-CUSTOM",
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": productOutlineColours["SCENE"],
            "line-width": 1,
          },
        });

      } else {
        if (map.getLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-fill", "visibility") == "none") {

          window.map.setLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-fill", "visibility", "visible");
          window.map.setLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-outline", "visibility", "visible");
        } else {
          window.map.setLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-fill", "visibility", "none");
          window.map.setLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-outline", "visibility", "none");
        }
      }

      let infoCloseButton = document.getElementById("area-selection-info-close-button");
      infoCloseButton.addEventListener("click", closeInfoListener);

      function closeInfoListener() {
        window.map.setLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-fill", "visibility", "none");
        window.map.setLayoutProperty(savedArea.properties.name + "-CUSTOM-frames-outline", "visibility", "none");
      }

      closeSavedAreas();
      //try{
      var xCoords = 0;
      var arrCount = 0;
      var yCoords = 0;
      for (var a = 0; a < savedArea.features[0].geometry.coordinates[0].length; a++) {
        xCoords += savedArea.features[0].geometry.coordinates[0][a][0];
        arrCount++;
        yCoords += savedArea.features[0].geometry.coordinates[0][a][1];
      }
      var xAverage = xCoords / arrCount;
      var yAverage = yCoords / arrCount;

      savedArea.type = "FeatureCollection";
      updateArea(allProducts, savedArea);
      map.flyTo({
        center: [xAverage, yAverage],
        zoom: 7.5,
        essential: true,
      });

      const boundingBox = turf.bbox(savedArea.features[0]);
      const bounds = [boundingBox.slice(0, 2), boundingBox.slice(2, 4)];
      window.map.fitBounds(bounds, {
        padding: 50,
      });

      //}
      //catch{}
    }
  };
  savedAreaEditButtonEle.onclick = () => {
    console.log(fileNameEle.contentEditable);
    if (fileNameEle.contentEditable == "false" || fileNameEle.contentEditable == "inherit") {
      tempContent = fileNameEle.textContent;
      fileNameEle.contentEditable = "true";
      fileNameEle.focus();
      //fileNameEle.select(); either highlight or put cursor at end
      savedAreaViewButtonEle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
      <path d="M 7.9785156 5.9804688 A 2.0002 2.0002 0 0 0 6.5859375 9.4140625 L 12.171875 15 L 6.5859375 20.585938 A 2.0002 2.0002 0 1 0 9.4140625 23.414062 L 15 17.828125 L 20.585938 23.414062 A 2.0002 2.0002 0 1 0 23.414062 20.585938 L 17.828125 15 L 23.414062 9.4140625 A 2.0002 2.0002 0 0 0 21.960938 5.9804688 A 2.0002 2.0002 0 0 0 20.585938 6.5859375 L 15 12.171875 L 9.4140625 6.5859375 A 2.0002 2.0002 0 0 0 7.9785156 5.9804688 z"></path>
      </svg>`;
      
      savedAreaEditButtonEle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
      <path d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z"></path>
      </svg>`;
      
    } else {
      fileNameEle.contentEditable = "false";
      savedAreaViewButtonEle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
      <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
      </svg>`;
      savedAreaEditButtonEle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="h-4 w-4">
      <path d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z"></path>
      </svg>`;
      fileNameEle.textContent = fileNameEle.textContent.trim();
      if (fileNameEle.textContent.length != 0) {
        savedArea.properties.name = fileNameEle.textContent;
        saveSavedAreas();
      } else {
        fileNameEle.textContent = tempContent;
      }
    }
  };
  savedAreaDeleteButtonEle.onclick = () => {
    var message = "Confirm deletion?";
    if (selectedAreas.length != 0) {
      message += " Multiple items selected.";
    }

    if (confirm(message) == true) {
      selectedAreas.push(savedArea);
      selectedAreas.forEach((area) => {
        savedAreas.splice(savedAreas.indexOf(area), 1);
      });
      selectedAreas = [];
      refreshSavedScreen();
    }
  };
  filesContainerEle.append(savedAreaViewButtonEle);
  filesContainerEle.append(savedAreaEditButtonEle);
  filesContainerEle.append(savedAreaDeleteButtonEle);
  filesListEle.append(filesContainerEle);
}

const importFiles = () => {
  var files = [];
  const filesUploaded = document.getElementById("saved-areas-upload").files;
  for (var x = 0; x < filesUploaded.length; x++) {
    files.push(filesUploaded[x]);
  }
  if (files.length != 0) {
    var successes = 0;
    files.forEach((file) => {
      if (file.name.endsWith(".geojson")) {
        var reader = new FileReader();
        reader.onload = function () {
          var name = file.name.slice(0, file.name.length - 8);
          var tempName = name;
          var extra = 0;
          for (var x = 0; x < savedAreas.length; x++) {
            if (tempName == savedAreas[x].name) {
              extra++;
              tempName = name + "(" + extra + ")";
              x = 0;
            }
          }
          savedAreas.push({
            properties: {
              name: tempName 
            },
            type: "geojson",
            geometry: JSON.parse(reader.result),
          });
          refreshSavedScreen();
        };
        reader.readAsText(file);
        successes++;
      }
    });
    if (successes != files.length) {
      alert("Some or all files uploaded were not compatible.\nPlease only upload GEOJSON files.");
    }
  }
};

const exportFiles = () => {
  if (selectedAreas.length == 0) {
    alert("No areas selected"); //maybe change this for something less intrusive
  } else {
    console.log(selectedAreas);
    selectedAreas.forEach((area) => {

      var file = new File([JSON.stringify(area.features[0].geometry)], area.properties.name + ".geojson", { type: "geojson" });

      window.saveAs(file);
    });
  }
};

function saveNewPolygon() {
  let namingBox = document.getElementById("name-area-container");
  let namingTextBox = document.getElementById("name-area-textbox");
  if (namingBox.classList.contains("hidden")) {
    namingBox.classList.remove("hidden");
    namingTextBox.textContent = "";
  }
}

function saveNewActivity() {
  let namingBox = document.getElementById("activity-creator-container");
  if (namingBox.classList.contains("hidden")) {
    namingBox.classList.remove("hidden");
    document.getElementById("name-activity-textbox").textContent = "";
    document.getElementById("author-activity-textbox").textContent = "";
    document.getElementById("date-activity-textbox").textContent = "";
    document.getElementById("comments-activity-textbox").textContent = "";
  }
}

function createNewPoly(nameStr, coords) {
  if (nameStr.length != 0 && coords != "") {
    var tempNum = 0;
    var tempName = nameStr;
    for (var x = 0; x < savedAreas.length; x++) {
      if (tempName == savedAreas[x].name) {
        tempNum++;
        tempName = nameStr + "(" + tempNum + ")";
        x = -1;
      }
    }
    if (tempName != nameStr) {
      nameStr = tempName;
    }
    savedAreas.push({
      type: "FeatureCollection",
      properties: { name: nameStr },
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: coords.features[0].geometry.coordinates,
          },
        },
      ],
    });
    saveSavedAreas();
    closeNameBox();
  }
}

function closeNameBox() {
  let box = document.getElementById("name-area-container");
  box.classList.add("hidden");
  let text = document.getElementById("name-area-textbox");
  text.value = "";
}

function closeNameBoxActivity() {
  let box = document.getElementById("activity-creator-container");
  box.classList.add("hidden");
  document.getElementById("name-activity-textbox").value = "";
  document.getElementById("author-activity-textbox").value = "";
  document.getElementById("date-activity-textbox").value = "";
  document.getElementById("comments-activity-textbox").value = "";
}

const refreshSavedScreen = () => {
  saveSavedAreas();
  updateActivties();
  openSavedAreas();
};

const closeSavedAreas = () => {
  savedAreasOpen = false;
  filesContainerEle.classList.add("hidden");
};

function openFile() {
  savedAreasUpload.click();
}
