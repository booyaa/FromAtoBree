#!/usr/bin/env node

var fatb = require('../lib/fromatobree'),
    path = require('path');

if (process.argv.length < 3) {
  console.log("usage:");
  console.log("%s <place> - lookup place", path.basename(process.argv[1]));
  console.log("%s <start> <finish> - plan route", path.basename(process.argv[1]));
  return;
}

var startArg = process.argv[2];
var finishArg = process.argv[3];

var start = fatb.GetPlace(startArg)[0]; // get first
var finish = fatb.GetPlace(finishArg)[0]; // get first

if (typeof(finishArg) === "undefined") {
  console.log("Matches for %s %s", startArg, JSON.stringify(fatb.GetPlace(startArg)))
  return;
}
console.log("GetPlace start: %s / finish: %s", start, finish);

if (typeof start === "undefined" || typeof finish === "undefined") {
  console.log("No matches for either start (%s) or finish (%s) locations", startArg, finishArg);
  return;
}

var route  = fatb.FindPath(start, finish);
console.log("your route: ", route);

var routeCost = fatb.GetPathCostObject(route); 

var cost = fatb.GetTotalCost(routeCost);
var time = fatb.GetTotalTime(routeCost);

console.log("Total cost for route %d, the journey will take time %d seconds or  %d mins", cost, time, Math.round(time/60));
