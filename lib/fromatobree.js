var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;
var options = { level : 69, swiftTravel : true };

exports.VERSION = "0.0.1";

CreateGraph = function() {
  //--------------- stable parser -----------------
  // How to reproduce stable_raw.js
  // * stripped just Locs out of TR_Data.lua
  // * pipe Stables.lua to stable_raw.js

  var stables = require('./stable_raw.js');

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


var graph = CreateGraph(); 

exports.FATB = graph;

exports.GetPathCostObject = function(path) {
  var start = path[0];
  var next = start;
  var costObject = {"start": start};

  console.log("Start: %j", start);
  var keyname = "via ";
  for(var i=1; i<path.length; i++) {
    var dest = path[i];

    var via = stables[next].d[dest];
    costObject[keyname + dest] = via;
 
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
// var graph = CreateGraph();
// var path = require('path');
// 
// if (process.argv.length < 3) {
//   console.log("usage:");
//   console.log("%s <place> - lookup place", path.basename(process.argv[1]));
//   console.log("%s <start> <finish> - plan route", path.basename(process.argv[1]));
//   return;
// }
// 
// var startArg = process.argv[2];
// var finishArg = process.argv[3];
// 
// console.log("args start %s finish %s", startArg, finishArg);
// 
// var start = GetPlace(startArg)[0]; // get first
// var finish = GetPlace(finishArg)[0]; // get first
// 
// if (typeof(finishArg) === "undefined") {
//   console.log("Matches for %s %s", startArg, JSON.stringify(GetPlace(startArg)))
//   return;
// }
// console.log("GetPlace start %s finish %s", start, finish);
// 
// if (typeof start !== "undefined" && typeof finish !== "undefined") {
//   var path = find_path(graph, start, finish);
//   console.log("your route: ", path);
// 
//   console.log('--------');
//   var costObject = GetPathCostObject(path); 
//   console.dir(costObject);
// 
//   var cost = 0;
//   var time = 0;
// 
//   for (var place in costObject ) {
//     var hasCost = costObject[place].hasOwnProperty("c");
//     var hasSTCost = costObject[place].hasOwnProperty("s");
//     var hasTime = costObject[place].hasOwnProperty("t");
//     var hasSTTime = costObject[place].hasOwnProperty("st");
// 
//     console.log("place %s cost %d obj %j", place, hasCost, costObject[place]);
// 
//     cost += hasCost ? parseInt(costObject[place].c) : 0;
//     cost += hasSTCost ? parseInt(costObject[place].s) : 0;
// 
//     time += hasTime ? parseInt(costObject[place].t) : 0;
//     time += hasSTTime ? parseInt(costObject[place].st) : 0;
//   }
// 
//   console.log("cost %d time %s", cost, time);
// 
// } else {
//   console.log("No matches for either start (%s) or finish (%s) locations", startArg, finishArg);
// }
