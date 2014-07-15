#!/usr/bin/env node


var path = require('path');
var whodis = path.basename(process.argv[1]);

if (process.argv.length < 3) {
  console.log("usage:");
  console.log("%s <start> <finish> - plan route", whodis);
  console.log("%s lookup <place> - lookup place", whodis);
  console.log("%s listregions - lists regions", whodis);
  console.log("%s listplaces <region> - list places for a given region", whodis);
  return;
}

var FATB = require('../lib/fromatobree');
var fatb = new FATB(); //FIXME: how do we plan on handling options?
var startArg = process.argv[2];
var finishArg = process.argv[3];

//FIXME: use a better args parser!
if (startArg === "listplaces") {
  console.log("Regions in the %j:\n", finishArg, fatb.GetPlacesByRegion(finishArg));
  return;
}

if (startArg === "listregions") {
  console.log("list regions");

  console.log("%j", fatb.GetRegions());
  return; 
}

if (startArg === "lookup") {
  console.log("Matches for %s:\n\t%s", finishArg, JSON.stringify(fatb.GetPlace(finishArg)));
  return;
}

var start = fatb.GetPlace(startArg)[0]; // get first
var finish = fatb.GetPlace(finishArg)[0]; // get first

console.log("From A to Bree v%s\n", fatb.version);
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

console.log("Total cost for route %d in silver, and the journey will take %s.\n", cost, time > 60 ? Math.round(time/60) + " mins" : time + " seconds");


