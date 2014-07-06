#!/usr/bin/env node

var fatb = require('../lib/fromatobree'),
    path = require('path');

if (process.argv.length < 3) {
  var whodis = path.basename(process.argv[1]);
  console.log("usage:");
  console.log("%s <start> <finish> - plan route", whodis);
  console.log("%s lookup <place> - lookup place", whodis);
  console.log("%s listregions - lists regions", whodis);
  console.log("%s listplaces <region> - list places for a given region", whodis);
  return;
}

var startArg = process.argv[2];
var finishArg = process.argv[3];

//FIXME: use a better args parser!
if (startArg === "listplaces") {
  console.log("Regions in the %s:\n", finishArg, fatb.GetPlacesByRegion(finishArg));
  return;
}

if (startArg === "listregions") {
  console.log("list regions");

  console.log("%j", fatb.GetRegions());
  return; 
}

if (startArg === "lookup") {
  console.log("Matches for %s %s", finishArg, JSON.stringify(fatb.GetPlace(finishArg)));
  return;
}

var start = fatb.GetPlace(startArg)[0]; // get first
var finish = fatb.GetPlace(finishArg)[0]; // get first

console.log("Start: %s => Finish: %s", start, finish);

if (typeof start === "undefined" || typeof finish === "undefined") {
  console.log("No matches for either start (%s) or finish (%s) locations", startArg, finishArg);
  return;
}

var route  = fatb.FindPath(start, finish);
console.log("Your route: ", route);

var routeCost = fatb.GetPathCostObject(route); 

var cost = fatb.GetTotalCost(routeCost);
var time = fatb.GetTotalTime(routeCost);

console.log("Total cost for route %d, the journey will take time %d seconds or  %d mins", cost, time, Math.round(time/60));
