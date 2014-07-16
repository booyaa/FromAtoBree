#!/usr/bin/env node


var FATB = require('../lib/fromatobree');
var path = require('path');
var whodis = path.basename(process.argv[1]);

console.log("From A to Bree v%s\n", FATB.version);

if (process.argv.length < 3) {
  console.log("usage:");
  console.log("%s <start> <finish>    - plan route", whodis);
  console.log("%s lookup <place>      - lookup place", whodis);
  console.log("%s listregions         - lists regions", whodis);
  console.log("%s listplaces <region> - list places for a given region", whodis);
  console.log("%s listreqs <term> - list codes for factions or quests", whodis);
  console.log("\nto impose restrictions, create a config file called .fromatobree.json in your");
  console.log("home directory. The format is:");
  var exampleConfig = { weighting: true, level: 40, standing: ["Q1", "R1"] };
  console.log("%s", JSON.stringify(exampleConfig, null, 2));
  console.log("key:");
  console.log("weighting - use weighted route, this means some destinations will become");
  console.log("            unavailable because you lack the requirements.");
  console.log("level     - your current level in the game.");
  console.log("standing  - any faction reputation or quests you may have completed. use");
  console.log("            the 'listreqs' command  to see a list of codes");
  
  return;
}

function getConfig() {
  var tilde = process.env[(process.platform === 'win32') ? "USERPROFILE" : "HOME"];
  var dotFileName = path.join(tilde, '.fromatobree.json');
  var opts_from_file = {};
  try {
    var fs = require('fs');
    var dotfile = JSON.parse(fs.readFileSync(dotFileName));
    opts_from_file.weighting = dotfile.weighting;
    opts_from_file.level = dotfile.level;
    opts_from_file.standing = dotfile.standing;
  } catch(e) {
    // no config file, use optimist defaults
    if (e.errno !== 34) {
      console.log(e);
    } 
  }

  return opts_from_file;
}
var options = getConfig();
// local testing { weighting: true, level: 50, standing: ["Q1"]};

var fatb = new FATB(options); 
var startArg = process.argv[2];
var finishArg = process.argv[3];


if (startArg === "listplaces") {
  console.log("Regions in the %s:", finishArg);
  fatb.GetPlacesByRegion(finishArg).forEach(function(place) {
    console.log("\t%s", place);
  });
  return;
}

if (startArg === "listregions") {
  console.log("List regions");

  fatb.GetRegions().forEach(function(region) {
    console.log("\t%s", region);
  });
  return; 
}

if (startArg === "listreqs") {
  console.log("List standing/quest requirement codes");
  if (typeof(finishArg) !== "undefined") {
    console.log("\nMatching term: %s", finishArg);
  }


  var reqs = fatb.GetRequirements(finishArg);
  if (Object.keys(reqs).length === 0) {
    console.log("\nNothing found!");
    return;
  }
  console.log("\nCode\tDescription");
  for(var code in reqs) {
    console.log("%s\t%s", code, reqs[code]);
  }
  return;
}

if (startArg === "lookup") {
  console.log("Matches for %s:\n\t%s", finishArg, JSON.stringify(fatb.GetPlace(finishArg)));
  return;
}

var start = fatb.GetPlace(startArg)[0]; // get first
var finish = fatb.GetPlace(finishArg)[0]; // get first

console.log("From: %s To: %s\n", start, finish);

if (typeof start === "undefined" || typeof finish === "undefined") {
  console.log("No matches for either start (%s) or finish (%s) locations", startArg, finishArg);
  return;
}

var route  = fatb.FindPath(start, finish);
console.log("Your route:");
route.forEach(function(name) {
  console.log("\t%s", name);
});


var cost = fatb.GetTotalCost(route);
var time = fatb.GetTotalTime(route);

console.log("\nTotal cost for route %d in silver, and the journey will take %s.\n", cost, time > 60 ? Math.round(time/60) + " mins" : time + " seconds");


