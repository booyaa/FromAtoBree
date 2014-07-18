// initialisation
var FW = {}; 

var fatb = new FATB();

// events
function onChangeRegion(evt) {
  // var region = evt.srcElement.value;
  var region = evt.target.value;
  // var source = /^(start|finish)Region/.exec(evt.srcElement.id)[1]; 
  var source = /^(start|finish)Region/.exec(evt.target.id)[1]; 
  var places = fatb.GetPlacesByRegion(region);
  var selPlace = document.getElementById(source+"Place");

  for(var i=selPlace.options.length; i >= 0; i--) {
    selPlace.remove(i);
  }

  for(i=0; i<places.length; i++) {
    selPlace.options[selPlace.options.length] = new Option(places[i], places[i]);
  }

  if (source === "start") {
    start = places[0];
  } else {
    finish = places[0];
  }

  console.log("start: %s finish: %s", start, finish);
}

function onFindPathClick(evt) { // Show me the way button
  var useWeighting = document.getElementById("weighting").checked;
  var options = {};
  var route = [];
  var routeCost = {};

  if (useWeighting) {
    standingList = [];
     
    var elReqsChildren = document.getElementById("reqs").children;
    for (var i=0; i < elReqsChildren.length; i++) {
      var labelKids = elReqsChildren[i].children;
      for (var j=0; j < labelKids.length; j++) {
        if (labelKids[j].type === "checkbox" && labelKids[j].checked) {
          standingList.push(labelKids[j].id);
        }
      }
    }
    
    options = { weighting : true, level : parseInt(document.getElementById("levelMeter").value), standing : standingList };
  }

  fatb = new FATB(options); // meh maybe we need the other functions before here to be class level vs instance

  //testing
  // start = "Needlehole";
  // finish = "Suri-kyla";
  route = fatb.FindPath(start, finish); //FIXME: global
  routeCost = fatb.GetPathCostObject(route); //FIXME: global
  var message = "";
  
  for(var i=0, max=route.length; i<max; i++) {
    if (i===0) { 
      message += '<span class="icon-map-marker"></span>&nbsp;Starting from: ';
      } else  
        if (i===max-1) {
          message += '<span class="icon-map-marker"></span>&nbsp;Destination: '; 
        } else { 
        message += '<span class="icon-arrow-right"></span>&nbsp;via: ';
        }

        var viaProps =  routeCost[route[i]];

        var info = "";

        if (viaProps.hasOwnProperty("st")) {
          info += '<acronym title="swift travel"><span class="icon-forward"></span></acronym>&nbsp;&nbsp;';
        }

        var restrictions = "";
        if (viaProps.hasOwnProperty("l")) {
          restrictions += "minimum level is " + viaProps.l + '\n';
        }

        if (viaProps.hasOwnProperty("r")) {
          restrictions += "requires rep/quest " + viaProps.r + '\n';
        }

        if (restrictions !== "") {  
          info += '<acronym title="' + restrictions + '"><span class="icon-key"></span></acronym>&nbsp;';
        }

        // console.log(route[i], Object.keys(viaProps));

        message += route[i] + "&nbsp;&nbsp;" + info  + "<br /><br />";
  }


  if (route.length === 0) {
    message += "No viable route found!";
  } else {
    message += "It'll take you ";
    var travelTime = fatb.GetTotalTime(route);
    var travelTimeMins = 0;
    if (travelTime > 60) {
      travelTimeMins = (travelTime / 60).toFixed(0);
      travelTime = travelTime % 60;
      message += travelTimeMins + " minutes and " + travelTime + " seconds.<br />";
    } else {
      message += travelTime + " seconds.</br >";
    }
  }
  document.getElementById("results").innerHTML = message;
}
// wire up dynamic form elements
function setupRegions() {
  var regions = fatb.GetRegions();

  var selStartRegion = document.getElementById("startRegion");
  var selFinishRegion = document.getElementById("finishRegion");

  // populate region select
  for(var i=0; i<regions.length; i++) {
    selStartRegion.options[selStartRegion.options.length] = new Option(regions[i], regions[i]);
    selFinishRegion.options[selFinishRegion.options.length] = new Option(regions[i], regions[i]);
  }

  selStartRegion.addEventListener("change", onChangeRegion); 
  selFinishRegion.addEventListener("change", onChangeRegion); 

  FW.regions = regions;
  // FW.selStartRegion = selStartRegion;
  // FW.selFinishRegion = selFinishRegion;
}

function setupPlaces() {
  var startRegion = FW.regions[0]; // angmar
  var places = fatb.GetPlacesByRegion(startRegion);

  var selStartPlace = document.getElementById("startPlace");
  var selFinishPlace = document.getElementById("finishPlace");

  // clear down before initialising places
  for(var i=selStartPlace.options.length; i >= 0; i--) {
    selStartPlace.remove(i);
    selFinishPlace.remove(i);
  }

  // populate place select
  for(var i=0, max=places.length; i < max; i++) {
    selStartPlace.options[selStartPlace.options.length] = new Option(places[i], places[i]);
    selFinishPlace.options[selFinishPlace.options.length] = new Option(places[i], places[i]);
  }

  //this may break... was further down after FindPath code
  selStartPlace.addEventListener("change", function(evt) {
    start = evt.target.value; //FIXME: global
  });

  // var selFinishPlace = document.getElementById("finishPlace");
  selFinishPlace.addEventListener("change", function(evt) {
    finish = evt.target.value; //FIXME: global

  });
  FW.places = places;
}

function setupStanding() {
  var reqs = fatb.GetRequirements();
  var elReqs = document.getElementById("reqs");

  var i = 0;
  for(var code in reqs) {

    var label = document.createElement("label");
    label.htmlFor = code;
    label.className = "foo topcoat-checkbox";
    label.appendChild(document.createTextNode(reqs[code]));

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = code;
    checkbox.value = code;

    var topcoat = document.createElement("div");
    topcoat.className = "topcoat-checkbox__checkmark";
    
    label.appendChild(checkbox);
    label.appendChild(topcoat);
    elReqs.appendChild(label);


    // split checkbox across screen
    //FIXME: should use mediaqueries to be responsive
    i++;
    if (i>=3) {
      // console.log("%d break", i);
      elReqs.appendChild(document.createElement("br"));
      i=0;
    }
  }
}


function setupLevel() {
  var inputLevel = document.getElementById("level");
  inputLevel.addEventListener("change", function(evt) {
    // update span text for visual feedback
    // levelMeter = document.getElementById("levelMeter").value = evt.srcElement.value; 
    levelMeter = document.getElementById("levelMeter").value = evt.target.value; 
  });
}

function setupFindPath() {
  var button = document.getElementById("FindRoute");
  button.addEventListener("click", onFindPathClick);
}

//------------------------------
var start, finish;

setupRegions();
setupPlaces();
setupStanding();
setupLevel();
setupFindPath();


//TODO: find out if should this be handled by a on load/ready event?
start = FW.places[0];
finish = FW.places[1];
console.log("%s %s is loaded.", new Date(), FATB.version);
