#!/usr/bin/env node

var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;
var options = { level : 69, swiftTravel : true };

function CreateGraph() {
  //--------------- stable parser -----------------
  // How to reproduce stable_raw.js
  // * stripped just Locs out of TR_Data.lua
  // * pipe Stables.lua to stable_raw.js

  var stables = require('./stable_raw.js');
  // console.dir(stables["Adso's Camp"]);

  var graph = {};

  for(var loc in stables) {
    // console.log(loc);

    graph[loc] = {};
    var destinations = {};

    // console.dir(stables[loc].d);
    for (var dest in stables[loc].d) {

      // basic route weighting, swift travel will cost less over regular travel
      // var weighting = typeof(stables[loc].d[dest].st) !== "undefined" ? 5 : 10;

      //swift travel (parameter)
      var stCost = typeof(stables[loc].d[dest].st) !== "undefined" ? 1 : 5;

      // level costing (parameter)
      var level = options.level;
      

      var minLevel = 0;
      if (typeof(stables[loc].d[dest].l) !== "undefined") {
        minLevel = stables[loc].d[dest].l;
        console.log("dest %s\n\tl %d + ml %d = %d", dest, level, minLevel, (level + minLevel));        
        console.log("\tl < ml %s st %d string %s", (level < minLevel), stCost, minLevel.toString());
      }

      var levelCost = level < minLevel ? 5 : 0; // 1

      var weighting = stCost + levelCost;



      // console.log("%s l %s ml %s w %s", dest, level, minLevel, weighting);
      destinations[dest] = weighting;
    }
    graph[loc] = destinations;
  }

  return graph;
}

// console.log("%s Aldburg %s South Gate %s"
//                   , (new Date).getMilliseconds()
//                   , JSON.stringify(stables["South Bree"].d["Aldburg"], null, 2)
//                   , JSON.stringify(graph["South Bree"], null, 2));

function GetPathCost(path) {
  var start = path[0];
  var next = start;
  var cost = [ {"start": start}];
  console.log("Start: %j", start);
  var keyname = "via ";
  for(var i=1; i<path.length; i++) {
    var dest = path[i];
    var via = stables[next].d[dest];

    // console.log("%s - %j", dest, via);

    // console.log("dest=%s cost=%j", dest, stableCost);

    cost[keyname + dest] = via;

    // console.log(i,path.length);
    if (i===(path.length-1)) {
      // console.log('woof');
    } else {
      next = dest;
    } 
  }

  return cost;
}


function GetPlace(place) {
  var regex = new RegExp("^"+place,"i");

  var found = [];
  Object.keys(graph).forEach(function(name) {
    if (regex.test(name)) {
      found.push(name);
      // console.log('found! ' + name);
    }
    // console.log(name);
  });

  return found;
}


var graph = CreateGraph();
var path = require('path');
// var path = find_path(graph, "Thorin's Gate", "Rivendell");

console.log("args: %d", process.argv.length);

if (process.argv.length < 3) {
  console.log("usage:");
  console.log("%s <place> - lookup place", path.basename(process.argv[1]));
  console.log("%s <start> <finish> - plan route", path.basename(process.argv[1]));
  return;
}

var startArg = process.argv[2];
var finishArg = process.argv[3];

console.log("args start %s finish %s", startArg, finishArg);

var start = GetPlace(startArg)[0]; // get first
var finish = GetPlace(finishArg)[0]; // get first

if (typeof(finishArg) === "undefined") {
  console.log("Matches for %s %s", startArg, JSON.stringify(GetPlace(startArg)))
  return;
}
console.log("GetPlace start %s finish %s", start, finish);

if (typeof start !== "undefined" && typeof finish !== "undefined") {
  var path = find_path(graph, start, finish);
  // var path = find_path(graph, "Thorin's Gate", "Mekhem-bizru");
  console.log("your route: ", path);

  console.log('--------');
  console.dir(GetPathCost(path));
} else {
  console.log("No matches for either start (%s) or finish (%s) locations", startArg, finishArg);
}
// if (found.length > 0) {
//   console.dir(found);
// } else {
//   console.log("No match found for: %s", place);
// }
// 
