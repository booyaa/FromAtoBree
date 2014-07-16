/*jslint node: true, laxcomma: true, loopfunc: true*/
// http://www.jshint.com/docs/options/
var dijkstra = require('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

// private variables
var stables = require('./stable_raw').stables;
var reqs = require('./stable_raw').reqs;

// private functions
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

function GetPathCostObject(path) {
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

///////////////////////////////////////////////////////////////////
// Constructor
///////////////////////////////////////////////////////////////////
function FATB(options) {
  this.options = options;
  this.graph = createGraph(options);
  this.stables = stables;
  this.reqs = reqs;
}

FATB.version = "2.1.3";
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
  var graph = this.graph;
  var regex = new RegExp("^"+place,"i");

  var found = [];
  Object.keys(graph).forEach(function(name) {
    if (regex.test(name)) {
      found.push(name);
    }
  });

  return found;
};


FATB.prototype.GetTotalCost = function(path) {
  var route = GetPathCostObject(path);
  var cost = 0;

  for (var place in route ) {
    // console.log("%s %j", place, route[place]);
    var hasCost = route[place].hasOwnProperty("c");
    var hasSTCost = route[place].hasOwnProperty("s");

    cost += hasCost ? parseInt(route[place].c) : 0;
    cost += hasSTCost ? parseInt(route[place].s) : 0;
  }

  return cost;
};

FATB.prototype.GetTotalTime = function(path) {
  var route = GetPathCostObject(path);
  var time = 0;

  for (var place in route ) {
    // console.log("%s %j", place, route[place]);
    var hasTime = route[place].hasOwnProperty("t");
    var hasSTTime = route[place].hasOwnProperty("st");

    time += hasTime ? parseInt(route[place].t) : 0;
    time += hasSTTime ? parseInt(route[place].st) : 0;
  }

  return time;
};

FATB.prototype.GetRequirements = function(term) {
  if (typeof(term) === "undefined") {
    return this.reqs;
  }

  var found = {};

  for (var code in this.reqs) {
    var termRegex = new RegExp(term, "i");
    if (termRegex.test(this.reqs[code])) {
      found[code] = this.reqs[code];
    }
  }
  return found;
};
module.exports = FATB;
