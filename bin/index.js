#!/usr/bin/env node

var fatb = require('../lib/fromatobree'),
    path = require('path');

// var dijkstra = require('dijkstrajs') // we have a winner
//   , find_path = dijkstra.find_path;
// var options = { level : 69, swiftTravel : true };
// 
// function CreateGraph() {
//   //--------------- stable parser -----------------
//   // How to reproduce stable_raw.js
//   // * stripped just Locs out of TR_Data.lua
//   // * pipe Stables.lua to stable_raw.js
// 
//   var stables = require('./stable_raw.js');
// 
//   var graph = {};
// 
//   for(var loc in stables) {
// 
//     graph[loc] = {};
//     var destinations = {};
// 
//     for (var dest in stables[loc].d) {
// 
//       //i swift travel (parameter)
//       var stCost = typeof(stables[loc].d[dest].st) !== "undefined" ? 1 : 5;
// 
//       // level costing (parameter)
//       var level = options.level;
//       
//       // TODO: standing or reqs costs
// 
//       var minLevel = 0;
//       if (typeof(stables[loc].d[dest].l) !== "undefined") {
//         minLevel = stables[loc].d[dest].l;
//         // console.log("dest %s\n\tl %d + ml %d = %d", dest, level, minLevel, (level + minLevel));        
//         // console.log("\tl < ml %s st %d string %s", (level < minLevel), stCost, minLevel.toString());
//       }
// 
//       var levelCost = level < minLevel ? 5 : 0; // zero otherwise we'll penalise the route unecessarily because of the previous swift travel weighting
// 
//       var weighting = stCost + levelCost;
// 
//       destinations[dest] = weighting;
//     }
//     graph[loc] = destinations;
//   }
// 
//   return graph;
// }
// 
// function GetPathCostObject(path) {
//   var start = path[0];
//   var next = start;
//   var costObject = {"start": start};
// 
//   console.log("Start: %j", start);
//   var keyname = "via ";
//   for(var i=1; i<path.length; i++) {
//     var dest = path[i];
// 
//     var via = stables[next].d[dest];
//     costObject[keyname + dest] = via;
//  
//     next = dest;
//   }
// 
//   return costObject;
// }
// 
// 
// function GetPlace(place) {
//   var regex = new RegExp("^"+place,"i");
// 
//   var found = [];
//   Object.keys(graph).forEach(function(name) {
//     if (regex.test(name)) {
//       found.push(name);
//     }
//   });
// 
//   return found;
// }
// 
// var graph = CreateGraph();
// var path = require('path');

if (process.argv.length < 3) {
  console.log("usage:");
  console.log("%s <place> - lookup place", path.basename(process.argv[1]));
  console.log("%s <start> <finish> - plan route", path.basename(process.argv[1]));
  return;
}

var startArg = process.argv[2];
var finishArg = process.argv[3];

console.log("args start %s finish %s", startArg, finishArg);

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
