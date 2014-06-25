#!/usr/bin/env node

//---------- path finding proof of concept -------
var Locs2 = {
  "Thorin's Gate" : { "Gondamon":1, "Duill":1, "Celondim":1, "Michel Delving":1, "West Bree":1, "Ettenmoors":1, "Noglond":1, "Combe":1 },
  "Noglond" : { "Thorin's Gate":1, "Gondamon":1 },
  "Gondamon" : { "Thorin's Gate":1, "Duill":1, "Noglond":1, "Thrasi's Lodge":1 }
};

var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

path = find_path(Locs2, "Thorin's Gate", "Thrasi's Lodge");
// console.log(path);

//--------------- stable parser -----------------
// How to reproduce stable_raw.js
// * stripped just Locs out of TR_Data.lua
// * pipe Stables.lua to stable_raw.js

var stables = require('./stable_raw.js');
console.dir(stables["Adso's Camp"]);

var graph = {};

for(var loc in stables) {
  console.log(loc);

  graph[loc] = {};
  var destinations = {};

  // console.dir(stables[loc].d);
  for (var dest in stables[loc].d) {
    destinations[dest] = 1
    console.log("\t" + dest);
  }
  
  graph[loc] = destinations;
}

console.dir(graph);
var dijkstra = require('dijkstrajs')
  , find_path = dijkstra.find_path;

var path = find_path(graph, "Thorin's Gate", "Rivendell");
console.dir(path);

