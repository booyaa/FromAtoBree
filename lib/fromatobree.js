var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

var options = { level : 69, swiftTravel : true };
var data = require('./stable_raw.js');
var stables = data.stables;
var requirements = data.reqs;

exports.VERSION = "1.0.2";

exports.STABLES = stables;

exports.GetPlacesByRegion = function(region) {
  var places = [];

  for (var place in stables) {
    var area = stables[place].z;
    var regexp = new RegExp(region, "i");
    if (regexp.test(area)) {
      places.push(place);
    }
  }
  return places;
}

exports.GetRegions = function() {
 var regions = [];

  for (var place in stables) {
    var area = stables[place].z;

    if (regions.indexOf(area) === -1) {
      regions.push(area);
    }
  }
 
  return regions.sort();
}

CreateGraph = function() {
  //--------------- stable parser -----------------
  // How to reproduce stable_raw.js
  // * stripped just Locs out of TR_Data.lua
  // * pipe Stables.lua to stable_raw.js

  var graph = {};

  for(var loc in stables) {

    graph[loc] = {};
    var destinations = {};

    for (var dest in stables[loc].d) {

      //i swift travel (parameter)
      var stCost = typeof(stables[loc].d[dest].st) !== "undefined" ? 1 : 5;

      // level costing (parameter)
      var level = options.level;
      
      // TODO: standing or reqs costs

      var minLevel = 0;
      if (typeof(stables[loc].d[dest].l) !== "undefined") {
        minLevel = stables[loc].d[dest].l;
        // console.log("dest %s\n\tl %d + ml %d = %d", dest, level, minLevel, (level + minLevel));        
        // console.log("\tl < ml %s st %d string %s", (level < minLevel), stCost, minLevel.toString());
      }

      var levelCost = level < minLevel ? 5 : 0; // zero otherwise we'll penalise the route unecessarily because of the previous swift travel weighting

      var weighting = stCost + levelCost;

      destinations[dest] = weighting;
    }
    graph[loc] = destinations;
  }

  return graph;
}


//FIXME: does this graph need to public?
var graph = CreateGraph(); 

exports.FATB = graph;

exports.GetPathCostObject = function(path) {
  var start = path[0];
  var next = start;
  var costObject = {};
  costObject[start] = {};

  // var keyname = "via ";
  for(var i=1; i<path.length; i++) {
    var dest = path[i];

    var via = stables[next].d[dest];
    costObject[dest] = via;
 
    next = dest;
  }

  return costObject;
}

exports.FindPath = function(start, finish) {
  return find_path(graph, start,finish);
}

exports.GetPlace = function(place) {
  var regex = new RegExp("^"+place,"i");

  var found = [];
  Object.keys(graph).forEach(function(name) {
    if (regex.test(name)) {
      found.push(name);
    }
  });

  return found;
}

exports.GetTotalCost = function(route) {
  var cost = 0;

  for (var place in route ) {
    var hasCost = route[place].hasOwnProperty("c");
    var hasSTCost = route[place].hasOwnProperty("s");

    cost += hasCost ? parseInt(route[place].c) : 0;
    cost += hasSTCost ? parseInt(route[place].s) : 0;
  }

  return cost;
}

exports.GetTotalTime = function(route) {
  var time = 0;

  for (var place in route ) {
    var hasTime = route[place].hasOwnProperty("t");
    var hasSTTime = route[place].hasOwnProperty("st");

    time += hasTime ? parseInt(route[place].t) : 0;
    time += hasSTTime ? parseInt(route[place].st) : 0;
  }

  return time;
}

exports.GetMetaData = function(place) {
  var metadata = {};
  for (var prop in stables[place]) {
    // // exclude destination and area data
    if (prop !== "d" && prop !== "z" && prop !== "a") {
      var key = "";
      if (prop === "l") key = "gps coords";
      if (prop === "ml") key = "min level";
      if (prop === "t") key = "time";
      if (prop === "td") key = "reqs";
      if (key === "") key = prop;

      metadata[key] = stables[place][prop];
    }
  }
  return metadata;
}
