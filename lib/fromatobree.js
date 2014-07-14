/*jslint node: true, laxcomma: true, loopfunc: true*/
// http://www.jshint.com/docs/options/
var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

// private
var stables = require('./stable_raw').stables;
var reqs = require('./stable_raw').reqs;
// methods
function createGraph(options) {
  var graph = {};

  // v--- wtf?
  var weighted = false;
  if (typeof(options) !== "undefined" && options.hasOwnProperty("weighting")) {
    weighted = true;
  }
  var weighting = 0;

  for(var loc in stables) {
    graph[loc] = {};
    var destinations = {};

    for (var dest in stables[loc].d) {
      // optional weighting, favour swift travel over normal
      // var stCost = typeof(stables[loc].d[dest].st) !== "undefined" ? 1 : 5;
      var stCost = 0;

      if (weighted) {
        // reqs
        var reqCost = 0;
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
        var level = options.level;
        var minLevel = 0;
        if (typeof(stables[loc].d[dest].l) !== "undefined") {
          minLevel = Math.abs(stables[loc].d[dest].l); 
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
}

// Constructor
function FATB(options) {
  this.version = "2.0.2";
  this.options = options;
  this.graph = createGraph(options);
  this.stables = stables;
}

// properties
FATB.prototype.GetPlacesByRegion = function(region) {
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

FATB.prototype.GetRegions = function() {
 var regions = [];

  for (var place in stables) {
    var area = stables[place].z;

    if (regions.indexOf(area) === -1) {
      regions.push(area);
    }
  }
 
  return regions.sort();
};

FATB.prototype.FindPath = function(start, finish) {
  var graph = this.graph;
  var route = [];
  
  try {
    route=find_path(graph, start,finish);
    // console.log("find_path: %j", route);
  } catch(e) {
    console.log("whoops: %j", e);
    route = [];
  }

  var current=0;
  var next=current+1;

  var weightCost = 0;
  for(var i=0, size=route.length; i<size; i++) {
    var currentPlace = route[i];
    var nextPlace = route[next];
    placeCost = graph[currentPlace][nextPlace];
    weightCost += typeof(placeCost) === "undefined" ? 0: placeCost;

    if (start === "Galtrev") {
      // console.log("%d 1 current: (%s) next: %d (%s)", i, currentPlace, next, nextPlace);
      // console.log("%d 2 from %s cost for places %j", i, currentPlace, graph[currentPlace]);
      // console.log("\n------\n%s => %s\n\t%j\n--------\n", currentPlace, nextPlace, this.stables[currentPlace].d);
    }
    // console.log("%d 3 cost: %d", i, placeCost);

    next++;
  }

  // console.log("total: %s => %s %d", start, finish, weightCost);


  if (weightCost > 100) {
    // var msg = ["No path found from ", start, " to ", finish, " because you have not met the minimum requirements."].join(''); 
    // throw new Error(msg);
    route = [];
  }

  return route;
};

FATB.prototype.GetPlace = function(place) {
  var graph = FATB.createGraph(); //FIXME WTF?
  var regex = new RegExp("^"+place,"i");

  var found = [];
  Object.keys(graph).forEach(function(name) {
    if (regex.test(name)) {
      found.push(name);
    }
  });

  return found;
};

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
