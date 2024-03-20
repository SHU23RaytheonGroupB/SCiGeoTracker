
//add elements here to drag divs, make sure tailwind margis are not set. 'm'
dragElement(document.getElementById("timeline-container"));  
dragElement(document.getElementById("histogram-popout-container"));
dragElement(document.getElementById("saved-areas-container"));
dragElement(document.getElementById("flyto-mission-info-container"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // Get all divs with ids containing 'header'
    const divs = document.querySelectorAll("div[id*='header']");
    //console.log(divs);

    // Set all divs class property to 'z-30'
    divs.forEach(div => {
        //console.log(div);
        div.parentElement.classList.replace('z-40', 'z-30');
       // console.log(div.parentElement);
    });

    // Set selected div class property to 'z-40'
    console.log(e.target.parentElement);
    e.target.parentElement.classList.add('z-40');
    e.target.parentElement.classList.replace('z-30', 'z-40');
    
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}