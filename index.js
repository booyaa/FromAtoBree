#!/usr/bin/env node

var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

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
      var level = 69;

      var minLevel = 0;
      if (typeof(stables[loc].d[dest].l) !== "undefined") {
        minLevel = stables[loc].d[dest].l;
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


var graph = CreateGraph()
// var path = find_path(graph, "Thorin's Gate", "Rivendell");
var path = find_path(graph, "Thorin's Gate", "Durin's Threshold");
// var path = find_path(graph, "Thorin's Gate", "Mekhem-bizru");
console.log("your route: ", path);

console.log('--------');
console.dir(GetPathCost(path));

var place = /Ost/;
Object.keys(graph).forEach(function(name) {
  if (place.test(name)) {
    console.log('found! ' + name);
  }
  // console.log(name);
});  
