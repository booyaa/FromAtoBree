/*jslint node: true, laxcomma: true, loopfunc: true*/
// http://www.jshint.com/docs/options/
var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

var FATB = {};
var stables = require('./stable_raw').stables;
var reqs = require('./stable_raw').reqs;

FATB.VERSION = "2.0.0";
FATB.options = {};
FATB.graph = {};

FATB.setup = function(options) {
  FATB.options = typeof(options) !== "undefined" ? options : {};

  // initialise graph?
  return FATB.options;
};

FATB.createGraph = function(weighted) {
  var graph = {};

  if (typeof(weighted) === "undefined") {
    weighted = false;
  }

  var weighting = 0;
  console.log("weighted: %j", weighted);

  for(var loc in stables) {
    graph[loc] = {};
    var destinations = {};

    for (var dest in stables[loc].d) {
      // optional weighting, favour swift travel over normal
      // var stCost = typeof(stables[loc].d[dest].st) !== "undefined" ? 1 : 5;
      var stCost = 0;

      if (weighted) {
        var options = FATB.options;
        var level = options.level;
        
        var reqCost = 0;

        // reqs
        if (typeof(stables[loc].d[dest].r) !== "undefined") {
          var requirements = stables[loc].d[dest].r.split(',');
          
          var testReqs = [];

          if (options.hasOwnProperty("standing")) {
            requirements.forEach(function(req) {
              if (options.standing.indexOf(req) !== -1) {
                testReqs.push(req);
              }
            });
          }

          reqCost = (requirements.length !== testReqs.length) ? 100 : 0;
        }

        // level
        var minLevel = 0;
        if (typeof(stables[loc].d[dest].l) !== "undefined") {
          minLevel = Math.abs(stables[loc].d[dest].l); //FIXME: why do we have negative level numbers?
        }

        var levelCost = level < minLevel ? 100 : 0; // zero otherwise we'll penalise the route unecessarily because of the previous swift travel weighting
        weighting = 1 + stCost + levelCost + reqCost;
      } else {
        weighting = 1;
      }
      destinations[dest] = weighting;
    }
    graph[loc] = destinations;
  }

  return graph;
};

// var options = { level : 49, swiftTravel : true, standing: {} };
// var options = { level : 69, standing: [] };
// var data = require('./stable_raw.js');
// var stables = data.stables;
// var requirements = data.reqs;


// exports.VERSION = "1.0.5";
// 
// exports.STABLES = stables;
// 
FATB.GetPlacesByRegion = function(region) {
  var places = [];

  for (var place in stables) {
    var area = stables[place].z;
    var regexp = new RegExp(region, "i");
    if (regexp.test(area)) {
      places.push(place);
    }
  }
  return places;
};

FATB.GetRegions = function() {
 var regions = [];

  for (var place in stables) {
    var area = stables[place].z;

    if (regions.indexOf(area) === -1) {
      regions.push(area);
    }
  }
 
  return regions.sort();
};
// 
// CreateGraph = function() {
//   //--------------- stable parser -----------------
//   // How to reproduce stable_raw.js
//   // * stripped just Locs out of TR_Data.lua
//   // * pipe Stables.lua to stable_raw.js
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
//       var reqCost = 0;
// 
//       if (typeof(stables[loc].d[dest].r) !== "undefined") {
//         var requirements = stables[loc].d[dest].r.split(',');
//         
//         var testReqs = [];
// 
//         requirements.forEach(function(req) {
//           if (options.standing.indexOf(req) !== -1) {
//             console.log('added');
//             testReqs.push(req);
//           }
//         });
// 
//         // console.log("reqs %d testReqs %d", requirements.length, testReqs.length);
//         reqCost = (requirements.length !== testReqs.length) ? 100 : 0;
//       }
// 
//       var minLevel = 0;
//       if (typeof(stables[loc].d[dest].l) !== "undefined") {
//         minLevel = Math.abs(stables[loc].d[dest].l); //FIXME: why do we have negative level numbers?
//         // console.log("dest %s\n\tl %d + ml %d = %d", dest, level, minLevel, (level + minLevel));        
//         // console.log("\tl < ml %s st %d string %s", (level < minLevel), stCost, minLevel.toString());
//       }
// 
//       // console.log("%s ours %d >= min level %d %s", dest, level, minLevel, (level >= minLevel));
// 
// 
//       var levelCost = level < minLevel ? 100 : 0; // zero otherwise we'll penalise the route unecessarily because of the previous swift travel weighting
// 
//       var weighting = stCost + levelCost + reqCost;
// 
//       destinations[dest] = weighting;
//       // console.log("%s st %d lvl %d req %d total %d", dest, stCost, levelCost, reqCost, weighting);
//     }
//     graph[loc] = destinations;
//   }
// 
//   // console.dir(graph);
//   return graph;
// };
// 
// 
// //FIXME: does this graph need to public?
// var graph = CreateGraph(); 
// 
// exports.FATB = graph;
// 
// exports.GetPathCostObject = function(path) {
//   var start = path[0];
//   var next = start;
//   var costObject = {};
//   costObject[start] = {};
// 
//   // var keyname = "via ";
//   for(var i=1; i<path.length; i++) {
//     var dest = path[i];
// 
//     var via = stables[next].d[dest];
//     costObject[dest] = via;
//  
//     next = dest;
//   }
// 
//   return costObject;
// };
// 
// exports.FindPath = function(start, finish) {
//   var route =find_path(graph, start,finish);
// 
//   var current=0;
//   var next=current+1;
// 
//   var weightCost = 0;
//   for(var i=0, size=route.length; i<size; i++) {
//     var currentPlace = route[i];
//     var nextPlace = route[next];
//     // console.log("1 current: %d (%s) next: %d (%s)", i, currentPlace, next, nextPlace);
//     // console.log("2 from %s cost for places %j", currentPlace, graph[currentPlace]);
//     placeCost = graph[currentPlace][nextPlace];
//     // console.log("3 cost: ", placeCost);
//     weightCost += typeof(placeCost) === "undefined" ? 0: placeCost;
//     next++;
//   }
// 
//   // console.log("total: ", weightCost);
//   if (weightCost > 100) {
//     throw new Error("no suitable route found!");
//   }
// 
//   return route;
// };
// 
FATB.GetPlace = function(place) {
  var graph = FATB.createGraph(); //FIXME WTF?
  var regex = new RegExp("^"+place,"i");

  console.log("GetPlace: %j", FATB.createGraph());
  var found = [];
  Object.keys(graph).forEach(function(name) {
    console.log(name);
    if (regex.test(name)) {
      found.push(name);
    }
  });

  return found;
};
// 
// exports.GetTotalCost = function(route) {
//   var cost = 0;
// 
//   for (var place in route ) {
//     var hasCost = route[place].hasOwnProperty("c");
//     var hasSTCost = route[place].hasOwnProperty("s");
// 
//     cost += hasCost ? parseInt(route[place].c) : 0;
//     cost += hasSTCost ? parseInt(route[place].s) : 0;
//   }
// 
//   return cost;
// };
// 
// exports.GetTotalTime = function(route) {
//   var time = 0;
// 
//   for (var place in route ) {
//     var hasTime = route[place].hasOwnProperty("t");
//     var hasSTTime = route[place].hasOwnProperty("st");
// 
//     time += hasTime ? parseInt(route[place].t) : 0;
//     time += hasSTTime ? parseInt(route[place].st) : 0;
//   }
// 
//   return time;
// };
// 
// exports.GetMetaData = function(place) {
//   var metadata = {};
//   for (var prop in stables[place]) {
//     // // exclude destination and area data
//     if (prop !== "d" && prop !== "z" && prop !== "a") {
//       var key = "";
//       if (prop === "l") key = "gps coords";
//       if (prop === "ml") key = "min level";
//       if (prop === "t") key = "time";
//       if (prop === "td") key = "reqs";
//       if (key === "") key = prop;
// 
//       metadata[key] = stables[place][prop];
//     }
//   }
//   return metadata;
// };
module.exports = FATB;
