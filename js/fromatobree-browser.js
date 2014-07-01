/*
   ,d8888b                                                                 
   88P'                                                       d8P          
d888888P                                                   d888888P        
  ?88'      88bd88b d8888b   88bd8b,d88b      d888b8b        ?88'   d8888b 
  88P       88P'  `d8P' ?88  88P'`?8P'?8b    d8P' ?88        88P   d8P' ?88
 d88       d88     88b  d88 d88  d88  88P    88b  ,88b       88b   88b  d88
d88'      d88'     `?8888P'd88' d88'  88b    `?88P'`88b      `?8b  `?8888P'
                                                                           
                                                                           
                                                                           
 d8b                             
 ?88                             
  88b                            
  888888b   88bd88b d8888b d8888b
  88P `?8b  88P'  `d8b_,dPd8b_,dP
 d88,  d88 d88     88b    88b    
d88'`?88P'd88'     `?888P'`?888P'
                                 
-=[ https://github.com/booyaa/FromAtoBree ]=-
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.fatb=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var dijkstra = _dereq_('dijkstrajs') // we have a winner
  , find_path = dijkstra.find_path;

var options = { level : 69, swiftTravel : true };
var stables = _dereq_('./stable_raw.js');

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
  var costObject = {"start": start};

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

},{"./stable_raw.js":2,"dijkstrajs":3}],2:[function(_dereq_,module,exports){
module.exports = stables = {
                  "Adso's Camp": {
                                      "d": {
                                                "Buckland": {
                                                                "c": 1,
                                                                "t": 144
                                                            },
                                               "West Bree": {
                                                                "c": 1,
                                                                "t": 67
                                                            }
                                           },
                                      "l": "29.2s,56.6w",
                                      "r": 1,
                                     "td": "R11",
                                      "z": "Bree-land"
                                 },
                      "Aldburg": {
                                      "a": "Eastfold",
                                      "d": {
                                                     "Beaconwatch": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 30,
                                                                         "t": 302
                                                                    },
                                                          "Edoras": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 25,
                                                                         "t": 331
                                                                    },
                                                        "Fenmarch": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 33,
                                                                         "t": 156
                                                                    },
                                                     "Helm's Deep": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 28,
                                                                         "t": 631
                                                                    },
                                                        "Isengard": {
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 21
                                                                    },
                                                      "South Bree": {
                                                                         "l": 75,
                                                                         "s": 71.5,
                                                                        "st": 24
                                                                    },
                                                           "Stoke": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 26,
                                                                         "t": 492
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "l": 75,
                                                                         "s": 71.5,
                                                                        "st": 28
                                                                    },
                                                       "Woodhurst": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 21,
                                                                         "t": 572
                                                                    }
                                           },
                                      "l": "68.7s,63.9w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                   "Amon Raith": {
                                      "d": {
                                                    "Esteldin": {
                                                                    "c": 15,
                                                                    "t": 190
                                                                },
                                               "Trestlebridge": {
                                                                    "c": 15,
                                                                    "t": 142
                                                                }
                                           },
                                      "l": "12.3s,52.5w",
                                      "r": 1,
                                     "td": "R12",
                                      "z": "North Downs"
                                 },
                 "Anazarmekhem": {
                                      "a": "The Flaming Deeps",
                                      "d": {
                                                      "Dolven-view": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 256
                                                                     },
                                                    "The Orc-watch": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 83
                                                                     },
                                               "The Rotting Cellar": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 164
                                                                     },
                                                "Twenty-first Hall": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 306
                                                                     }
                                           },
                                      "l": "13.2s,108.2w",
                                     "ml": 41,
                                      "r": 2,
                                      "t": 3,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                    "Annuminas": {
                                      "a": "Annuminas",
                                      "d": {
                                               "Tinnudir": {
                                                                "l": 35,
                                                                "r": "R6",
                                                                "s": 20,
                                                               "st": 40
                                                           }
                                           },
                                      "l": "19.1s,70.9w",
                                     "ms": 35,
                                      "r": 1,
                                      "t": 6,
                                     "td": "R6",
                                      "z": "Evendim"
                                 },
                     "Aughaire": {
                                      "d": {
                                                    "Esteldin": {
                                                                    "c": 25,
                                                                    "t": 220
                                                                },
                                                "Gabilshathur": {
                                                                     "r": "Q1",
                                                                     "s": 25,
                                                                    "st": 35
                                                                },
                                               "Gath Forthnir": {
                                                                     "r": "Q1R4",
                                                                     "s": 25,
                                                                    "st": 29
                                                                }
                                           },
                                      "l": "0.2s,39.3w",
                                     "ml": 15,
                                      "r": 1,
                                      "t": 20,
                                      "z": "Angmar"
                                 },
                      "Avardin": {
                                      "d": {
                                                 "Galtrev": {
                                                                 "c": 25,
                                                                 "l": -65,
                                                                 "s": 35,
                                                                "st": 16,
                                                                 "t": 123
                                                            },
                                               "Lhan Rhos": {
                                                                 "c": 25,
                                                                 "l": -65,
                                                                 "s": 35,
                                                                "st": 10,
                                                                 "t": 103
                                                            }
                                           },
                                      "l": "83.5s,20.5w",
                                     "ml": 47,
                                      "r": 1,
                                      "t": 12,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                     "Balewood": {
                                      "d": {
                                                    "Forlaw": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 21,
                                                                   "t": 190
                                                              },
                                               "High Knolls": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 20,
                                                                   "t": 150
                                                              },
                                                 "Whitshaws": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 20,
                                                                   "t": 160
                                                              }
                                           },
                                      "l": "35.4s,69.9w",
                                     "ml": 70,
                                      "n": "Cerdic's Camp",
                                      "r": 2,
                                      "t": 4,
                                      "z": "Wildermore"
                                 },
              "Barachen's Camp": {
                                      "d": {
                                               "Echad Candelleth": {
                                                                        "s": 25,
                                                                       "st": 23
                                                                   },
                                               "North Trollshaws": {
                                                                        "s": 25,
                                                                       "st": 13
                                                                   },
                                                      "Thorenhad": {
                                                                        "s": 25,
                                                                       "st": 13
                                                                   }
                                           },
                                      "l": "28.2s,15.3w",
                                      "r": 1,
                                     "td": "R7",
                                      "z": "Trollshaws"
                                 },
                     "Barnavon": {
                                      "d": {
                                                           "Galtrev": {
                                                                           "c": 25,
                                                                           "l": -65,
                                                                           "s": 35,
                                                                          "st": 18
                                                                      },
                                                         "Lhan Rhos": {
                                                                           "c": 25,
                                                                           "l": -65,
                                                                           "s": 35,
                                                                          "st": 12,
                                                                           "t": 162
                                                                      },
                                               "Rohirrim Scout-camp": {
                                                                           "c": 25,
                                                                           "l": -65,
                                                                           "s": 35,
                                                                          "st": 16,
                                                                           "t": 156
                                                                      }
                                           },
                                      "l": "84.7s,16.3w",
                                     "ml": 48,
                                      "r": 1,
                                      "t": 15,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                  "Beaconwatch": {
                                      "a": "Eastfold",
                                      "d": {
                                                "Aldburg": {
                                                                "c": 60,
                                                                "l": -85,
                                                                "s": 66,
                                                               "st": 30,
                                                                "t": 302
                                                           },
                                               "Fenmarch": {
                                                                "c": 60,
                                                                "l": -85,
                                                                "s": 66,
                                                               "st": 36,
                                                                "t": 87
                                                           }
                                           },
                                      "l": "69.6s,57.4w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 10,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
         "Bree-land Homesteads": {
                                     "l": "34.2s,45.7w",
                                     "z": "Bree-land"
                                 },
                  "Brockbridge": {
                                      "a": "Stonedeans",
                                      "d": {
                                                 "Gapholt": {
                                                                 "c": 60,
                                                                 "l": -85,
                                                                 "s": 66,
                                                                "st": 18,
                                                                 "t": 211
                                                            },
                                               "Woodhurst": {
                                                                 "c": 60,
                                                                 "l": -85,
                                                                 "s": 66,
                                                                "st": 17,
                                                                 "t": 62
                                                            }
                                           },
                                      "l": "50.8s,77.7w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R34",
                                      "z": "West Rohan"
                                 },
               "Brockenborings": {
                                     "d": {
                                               "Hobbiton": {
                                                               "c": 1,
                                                               "t": 104
                                                           },
                                              "Oatbarton": {
                                                                "c": 15,
                                                                "s": 25,
                                                               "st": 15,
                                                                "t": 77
                                                           },
                                                  "Stock": {
                                                               "c": 1,
                                                               "t": 128
                                                           }
                                          },
                                     "l": "27.4s,68.1w",
                                     "r": 1,
                                     "t": 14,
                                     "z": "the Shire"
                                 },
                  "Brown Lands": {
                                      "d": {
                                               "Parth Celebrant": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 11
                                                                  },
                                                      "Rushgore": {
                                                                       "c": 25,
                                                                       "l": -70,
                                                                       "s": 35,
                                                                      "st": 14,
                                                                       "t": 133
                                                                  },
                                                      "Stangard": {
                                                                       "c": 25,
                                                                       "l": -70,
                                                                       "s": 35,
                                                                      "st": 18,
                                                                       "t": 240
                                                                  },
                                                      "Thinglad": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 20
                                                                  },
                                                 "Wailing Hills": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 11
                                                                  }
                                           },
                                      "l": "31.2s,52.0w",
                                     "ml": 50,
                                      "r": 2,
                                      "t": 7,
                                     "td": "R26",
                                      "z": "Great River"
                                 },
                     "Buckland": {
                                     "d": {
                                              "Adso's Camp": {
                                                                 "c": 1,
                                                                 "t": 144
                                                             },
                                                    "Stock": {
                                                                 "c": 1,
                                                                 "t": 69
                                                             },
                                                "West Bree": {
                                                                 "c": 1,
                                                                 "t": 211
                                                             }
                                          },
                                     "l": "29.2s,56.6w",
                                     "r": 1,
                                     "t": 22,
                                     "z": "Bree-land"
                                 },
               "Caras Galadhon": {
                                      "d": {
                                                         "Cerin Amroth": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D14",
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 133
                                                                         },
                                                       "Echad Andestel": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D13",
                                                                              "s": 35,
                                                                             "st": 24,
                                                                              "t": 258
                                                                         },
                                                 "Inner Caras Galadhon": {
                                                                             "mt": 65,
                                                                              "r": "Q3"
                                                                         },
                                                         "Mekhem-bizru": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "s": 35,
                                                                             "st": 16,
                                                                              "t": 255
                                                                         },
                                               "The Vinyards of Lorien": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D15",
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 68
                                                                         }
                                           },
                                      "l": "16.7s,67.5w",
                                      "r": 2,
                                     "td": "R8",
                                      "z": "Lothlorien"
                                 },
                     "Celondim": {
                                     "d": {
                                                       "Combe": {
                                                                     "s": 1,
                                                                    "st": 18
                                                                },
                                                    "Duillond": {
                                                                    "c": 1,
                                                                    "t": 79
                                                                },
                                              "Michel Delving": {
                                                                    "S0": true,
                                                                     "s": 1,
                                                                    "st": 19
                                                                },
                                               "Thorin's Gate": {
                                                                    "S0": true,
                                                                     "s": 1,
                                                                    "st": 24
                                                                },
                                                   "West Bree": {
                                                                    "S0": true,
                                                                     "s": 1,
                                                                    "st": 20
                                                                }
                                          },
                                     "l": "28.1s,92.4w",
                                     "r": 1,
                                     "t": 11,
                                     "z": "Ered Luin"
                                 },
                 "Cerin Amroth": {
                                      "d": {
                                                       "Caras Galadhon": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D14",
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 133
                                                                         },
                                                       "Echad Andestel": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D13",
                                                                              "s": 35,
                                                                             "st": 24,
                                                                              "t": 140
                                                                         },
                                                         "Mekhem-bizru": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 238
                                                                         },
                                               "The Vinyards of Lorien": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D15",
                                                                              "s": 35,
                                                                             "st": 14,
                                                                              "t": 190
                                                                         }
                                           },
                                      "l": "11.7s,69.1w",
                                      "r": 2,
                                     "td": "R8",
                                      "z": "Lothlorien"
                                 },
    "Chamber of the Crossroads": {
                                      "a": "Durin's Way",
                                      "d": {
                                                     "Dolven-view": {
                                                                        "c": 35,
                                                                        "l": -45,
                                                                        "t": 94
                                                                    },
                                               "Durin's Threshold": {
                                                                        "c": 35,
                                                                        "l": -45,
                                                                        "t": 215
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "r": "Q4",
                                                                         "s": 35,
                                                                        "st": 20,
                                                                         "t": 190
                                                                    }
                                           },
                                      "l": "5.2s,112.1w",
                                     "ml": 36,
                                      "r": 2,
                                      "t": 5,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                      "Cliving": {
                                      "a": "Norcrofts",
                                      "d": {
                                                   "Eaworth": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 32,
                                                                   "t": 181
                                                              },
                                                "Elthengels": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 35,
                                                                   "t": 144
                                                              },
                                                   "Faldham": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 33,
                                                                   "t": 226
                                                              },
                                                   "Harwick": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 40,
                                                                   "t": 238
                                                              },
                                                   "Hytbold": {
                                                                   "c": 65,
                                                                   "l": -84,
                                                                   "r": "R29,Q6",
                                                                   "s": 71.5,
                                                                  "st": 48,
                                                                   "t": 300
                                                              },
                                               "Parth Galen": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 37,
                                                                   "t": 502
                                                              },
                                                 "Snowbourn": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 33,
                                                                   "t": 354
                                                              }
                                           },
                                      "l": "54.8s,57.2w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 3,
                                     "td": "R24",
                                      "z": "East Rohan"
                                 },
                        "Combe": {
                                     "d": {
                                                    "Celondim": {
                                                                     "s": 1,
                                                                    "st": 18
                                                                },
                                              "Michel Delving": {
                                                                     "s": 1,
                                                                    "st": 19
                                                                },
                                                  "South Bree": {
                                                                    "c": 1,
                                                                    "t": 90
                                                                },
                                               "Thorin's Gate": {
                                                                     "s": 1,
                                                                    "st": 24
                                                                }
                                          },
                                     "l": "28.6s,49.5w",
                                     "r": 1,
                                     "t": 5,
                                     "z": "Bree-land"
                                 },
                "Dagoras' Camp": {
                                      "d": {
                                                       "Galtrev": {
                                                                       "c": 25,
                                                                       "l": -65,
                                                                       "s": 35,
                                                                      "st": 20,
                                                                       "t": 396
                                                                  },
                                               "Grimbold's Camp": {
                                                                       "c": 25,
                                                                       "l": -65,
                                                                       "s": 35,
                                                                      "st": 15,
                                                                       "t": 67
                                                                  }
                                           },
                                      "l": "84.9s,3.5w",
                                     "ml": 50,
                                      "r": 1,
                                      "t": 0,
                                      "z": "Nan Curunir"
                                 },
                  "Dolven-view": {
                                      "a": "the Great Delving",
                                      "d": {
                                                            "Anazarmekhem": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 256
                                                                            },
                                               "Chamber of the Crossroads": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 94
                                                                            },
                                                       "Durin's Threshold": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 120
                                                                            },
                                                              "First Hall": {
                                                                                 "c": 35,
                                                                                 "l": -45,
                                                                                 "s": 45,
                                                                                "st": 47,
                                                                                 "t": 413
                                                                            },
                                                        "The Deep Descent": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 34
                                                                            },
                                                           "The Orc-watch": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 436
                                                                            },
                                                       "Twenty-first Hall": {
                                                                                 "c": 35,
                                                                                 "l": -45,
                                                                                 "s": 45,
                                                                                "st": 15,
                                                                                 "t": 254
                                                                            }
                                           },
                                      "l": "8.4s,112.4w",
                                     "ml": 35,
                                      "r": 2,
                                      "t": 6,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                     "Duillond": {
                                     "d": {
                                                           "Celondim": {
                                                                           "c": 1,
                                                                           "t": 79
                                                                       },
                                              "Falathlorn Homesteads": {
                                                                           "c": 5,
                                                                           "t": 100
                                                                       },
                                                           "Gondamon": {
                                                                           "c": 1,
                                                                           "t": 154
                                                                       },
                                                         "Needlehole": {
                                                                           "c": 5,
                                                                           "t": 150
                                                                       },
                                                      "Thorin's Gate": {
                                                                           "c": 1,
                                                                           "t": 307
                                                                       },
                                                     "Thrasi's Lodge": {
                                                                           "c": 1,
                                                                           "t": 84
                                                                       }
                                          },
                                     "l": "24.4s,93.2w",
                                     "r": 1,
                                     "t": 1,
                                     "z": "Ered Luin"
                                 },
            "Durin's Threshold": {
                                      "a": "the Great Delving",
                                      "d": {
                                               "Chamber of the Crossroads": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 215
                                                                            },
                                                             "Dolven-view": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 120
                                                                            },
                                                            "Echad Dunann": {
                                                                                "mt": 180
                                                                            },
                                                        "The Deep Descent": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 148
                                                                            }
                                           },
                                      "l": "7.9s,116.1w",
                                     "ml": 35,
                                      "r": 2,
                                      "t": 5,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                      "Dwaling": {
                                      "d": {
                                               "High King's Crossing": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 11,
                                                                            "t": 174
                                                                       },
                                                          "Oatbarton": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 10,
                                                                            "t": 68
                                                                       },
                                                          "Ost Forod": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 21,
                                                                            "t": 300
                                                                       },
                                                           "Tinnudir": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 32,
                                                                            "t": 288
                                                                       }
                                           },
                                      "l": "20.8s,64.7w",
                                     "ml": 10,
                                      "r": 1,
                                      "t": 14,
                                     "td": "R10",
                                      "z": "Evendim"
                                 },
                      "Eaworth": {
                                      "a": "Entwash Vale",
                                      "d": {
                                                   "Cliving": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 32,
                                                                   "t": 181
                                                              },
                                                  "Garsfeld": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 34,
                                                                   "t": 130
                                                              },
                                                   "Harwick": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 25,
                                                                   "t": 380
                                                              },
                                                   "Hytbold": {
                                                                   "c": 65,
                                                                   "l": -84,
                                                                   "r": "R31,Q6",
                                                                   "s": 71.5,
                                                                  "st": 44,
                                                                   "t": 292
                                                              },
                                               "Parth Galen": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 22,
                                                                   "t": 644
                                                              },
                                                 "Snowbourn": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 48,
                                                                   "t": 244
                                                              },
                                                 "Thornhope": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 27,
                                                                   "t": 117
                                                              }
                                           },
                                      "l": "47.7s,63.6w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 11,
                                     "td": "R27",
                                      "z": "East Rohan"
                                 },
               "Echad Andestel": {
                                      "d": {
                                                       "Caras Galadhon": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D14",
                                                                              "s": 35,
                                                                             "st": 24,
                                                                              "t": 258
                                                                         },
                                                         "Cerin Amroth": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D14",
                                                                              "s": 35,
                                                                             "st": 24,
                                                                              "t": 140
                                                                         },
                                                         "Mekhem-bizru": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "s": 35,
                                                                             "st": 24,
                                                                              "t": 133
                                                                         },
                                               "The Vinyards of Lorien": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D15",
                                                                              "s": 35,
                                                                             "st": 24,
                                                                              "t": 182
                                                                         }
                                           },
                                      "l": "14.4s,73.1w",
                                     "ml": 39,
                                      "r": 2,
                                      "t": 8,
                                     "td": "R8",
                                      "z": "Lothlorien"
                                 },
             "Echad Candelleth": {
                                      "d": {
                                               "Barachen's Camp": {
                                                                       "s": 25,
                                                                      "st": 23
                                                                  },
                                                 "Echad Eregion": {
                                                                      "c": 25,
                                                                      "l": 35,
                                                                      "t": 265
                                                                  },
                                                      "Gwingris": {
                                                                      "c": 25,
                                                                      "l": 40,
                                                                      "t": 162
                                                                  },
                                                     "Rivendell": {
                                                                       "c": 15,
                                                                       "l": 40,
                                                                       "s": 25,
                                                                      "st": 23,
                                                                       "t": 392
                                                                  },
                                                     "Thorenhad": {
                                                                       "c": 15,
                                                                       "l": 35,
                                                                       "s": 25,
                                                                      "st": 22,
                                                                       "t": 206
                                                                  }
                                           },
                                      "l": "36.8s,14.2w",
                                      "r": 1,
                                      "t": 20,
                                     "td": "R7",
                                      "z": "Trollshaws"
                                 },
               "Echad Daervunn": {
                                      "d": {
                                               "Echad Dagoras": {
                                                                     "c": 25,
                                                                     "l": 50,
                                                                     "s": 35,
                                                                    "st": 12,
                                                                     "t": 288
                                                                },
                                                  "Harndirion": {
                                                                     "c": 25,
                                                                     "l": -50,
                                                                     "r": "D7",
                                                                     "s": 35,
                                                                    "st": 12,
                                                                     "t": 189
                                                                },
                                                 "Lhan Tarren": {
                                                                     "c": 25,
                                                                     "l": 65,
                                                                     "s": 35,
                                                                    "st": 12,
                                                                     "t": 178
                                                                },
                                                     "Lhanuch": {
                                                                     "c": 25,
                                                                     "l": -50,
                                                                     "r": "D6",
                                                                     "s": 35,
                                                                    "st": 22,
                                                                     "t": 132
                                                                },
                                                 "Maur Tulhau": {
                                                                     "c": 25,
                                                                     "l": -50,
                                                                     "r": "D5",
                                                                     "s": 35,
                                                                    "st": 16,
                                                                     "t": 90
                                                                }
                                           },
                                      "l": "66.6s,21.5w",
                                     "ml": 40,
                                      "r": 1,
                                      "t": 0,
                                     "td": "R16",
                                      "z": "Enedwaith"
                                 },
                "Echad Dagoras": {
                                      "d": {
                                               "Echad Daervunn": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D6",
                                                                      "s": 35,
                                                                     "st": 12,
                                                                      "t": 288
                                                                 },
                                                 "Echad Dunann": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "s": 35,
                                                                     "st": 28,
                                                                      "t": 242
                                                                 },
                                                "Echad Mirobel": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "s": 35,
                                                                     "st": 42,
                                                                      "t": 292
                                                                 },
                                                   "Harndirion": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D7",
                                                                      "s": 35,
                                                                     "st": 17,
                                                                      "t": 303
                                                                 },
                                                      "Lhanuch": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D6",
                                                                      "s": 35,
                                                                     "st": 25,
                                                                      "t": 244
                                                                 },
                                                  "Maur Tulhau": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D5",
                                                                      "s": 35,
                                                                     "st": 28,
                                                                      "t": 305
                                                                 }
                                           },
                                      "l": "58.5s,14.5w",
                                     "ml": 40,
                                      "r": 1,
                                      "t": 2,
                                     "td": "R16",
                                      "z": "Enedwaith"
                                 },
                 "Echad Dunann": {
                                      "d": {
                                               "Durin's Threshold": {
                                                                        "mt": 180
                                                                    },
                                                   "Echad Dagoras": {
                                                                         "c": 25,
                                                                         "l": -50,
                                                                         "s": 35,
                                                                        "st": 28,
                                                                         "t": 242
                                                                    },
                                                   "Echad Eregion": {
                                                                         "c": 25,
                                                                         "l": -45,
                                                                         "r": "D2",
                                                                         "s": 35,
                                                                        "st": 22,
                                                                         "t": 180
                                                                    },
                                                   "Echad Mirobel": {
                                                                         "c": 25,
                                                                         "l": -45,
                                                                         "r": "D4",
                                                                         "s": 35,
                                                                        "st": 48,
                                                                         "t": 210
                                                                    },
                                                        "Gwingris": {
                                                                         "c": 25,
                                                                         "l": -45,
                                                                         "r": "D1",
                                                                         "s": 35,
                                                                        "st": 40,
                                                                         "t": 327
                                                                    },
                                                       "Rivendell": {
                                                                         "c": 25,
                                                                         "l": -45,
                                                                         "r": "D3",
                                                                         "s": 35,
                                                                        "st": 22,
                                                                         "t": 712
                                                                    }
                                           },
                                      "l": "50.6s,7.8w",
                                     "ml": 35,
                                      "r": 1,
                                      "t": 4,
                                      "z": "Eregion"
                                 },
                "Echad Eregion": {
                                      "d": {
                                               "Echad Candelleth": {
                                                                       "c": 25,
                                                                       "l": 35,
                                                                       "t": 265
                                                                   },
                                                   "Echad Dunann": {
                                                                        "c": 25,
                                                                        "l": -45,
                                                                        "r": "D3",
                                                                        "s": 35,
                                                                       "st": 22,
                                                                        "t": 180
                                                                   },
                                                  "Echad Mirobel": {
                                                                        "c": 25,
                                                                        "l": -45,
                                                                        "r": "D4",
                                                                        "s": 35,
                                                                       "st": 40,
                                                                        "t": 228
                                                                   },
                                                       "Gwingris": {
                                                                        "c": 25,
                                                                        "r": "D1",
                                                                        "s": 35,
                                                                       "st": 40,
                                                                        "t": 150
                                                                   },
                                                      "Rivendell": {
                                                                        "c": 25,
                                                                        "l": -40,
                                                                        "r": "D2",
                                                                        "s": 35,
                                                                       "st": 21,
                                                                        "t": 532
                                                                   }
                                           },
                                      "l": "47.0s,12.6w",
                                     "ml": 34,
                                      "r": 1,
                                      "t": 4,
                                      "z": "Eregion"
                                 },
                "Echad Mirobel": {
                                      "d": {
                                               "Echad Dagoras": {
                                                                     "c": 25,
                                                                     "l": -50,
                                                                     "s": 35,
                                                                    "st": 42,
                                                                     "t": 292
                                                                },
                                                "Echad Dunann": {
                                                                     "c": 25,
                                                                     "l": -45,
                                                                     "r": "D3",
                                                                     "s": 35,
                                                                    "st": 48,
                                                                     "t": 210
                                                                },
                                               "Echad Eregion": {
                                                                     "c": 25,
                                                                     "l": -45,
                                                                     "r": "D2",
                                                                     "s": 35,
                                                                    "st": 40,
                                                                     "t": 228
                                                                },
                                                    "Gwingris": {
                                                                     "c": 25,
                                                                     "l": -45,
                                                                     "r": "D1",
                                                                     "s": 35,
                                                                    "st": 62,
                                                                     "t": 378
                                                                },
                                                   "Rivendell": {
                                                                     "c": 25,
                                                                     "l": -45,
                                                                     "r": "D4",
                                                                     "s": 35,
                                                                    "st": 48,
                                                                     "t": 762
                                                                }
                                           },
                                      "l": "52.3s,17.0w",
                                     "ml": 35,
                                      "r": 1,
                                      "t": 24,
                                      "z": "Eregion"
                                 },
               "Echad Naeglanc": {
                                      "d": {
                                                   "Galtrev": {
                                                                   "c": 25,
                                                                   "l": -65,
                                                                   "s": 35,
                                                                  "st": 15,
                                                                   "t": 190
                                                              },
                                                "Harndirion": {
                                                                   "c": 25,
                                                                   "l": -65,
                                                                   "s": 35,
                                                                  "st": 19,
                                                                   "t": 250
                                                              },
                                               "Lhan Tarren": {
                                                                   "c": 25,
                                                                   "l": 1,
                                                                   "s": 35,
                                                                  "st": 15,
                                                                   "t": 165
                                                              }
                                           },
                                      "l": "77.3s,15.8w",
                                     "ml": 46,
                                      "r": 1,
                                      "t": 5,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                 "Echad Sirion": {
                                      "d": {
                                                      "Estolad Mernael": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D17",
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 223
                                                                         },
                                                             "Helethir": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D18",
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 385
                                                                         },
                                                            "Mithechad": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D18",
                                                                              "s": 35,
                                                                             "st": 12,
                                                                              "t": 279
                                                                         },
                                                           "Ost Galadh": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D17",
                                                                              "s": 35,
                                                                             "st": 18,
                                                                              "t": 200
                                                                         },
                                                           "Thangulhad": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D18",
                                                                              "s": 35,
                                                                             "st": 31,
                                                                              "t": 340
                                                                         },
                                                      "The Haunted Inn": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D16",
                                                                              "s": 35,
                                                                             "st": 28,
                                                                              "t": 110
                                                                         },
                                               "The Vinyards of Lorien": {
                                                                             "mt": 50
                                                                         }
                                           },
                                      "l": "15.3s,61.3w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                       "Edoras": {
                                      "a": "Kingstead",
                                      "d": {
                                                   "Aldburg": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 25,
                                                                   "t": 331
                                                              },
                                                   "Entwade": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 25,
                                                                   "t": 236
                                                              },
                                               "Helm's Deep": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 27,
                                                                   "t": 319
                                                              },
                                                "Middlemead": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 21,
                                                                   "t": 343
                                                              },
                                                     "Stoke": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 22,
                                                                   "t": 421
                                                              },
                                               "Underharrow": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 20,
                                                                   "t": 143
                                                              },
                                                 "Woodhurst": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 19,
                                                                   "t": 337
                                                              }
                                           },
                                      "l": "60.8s,74.3w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 4,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                   "Elthengels": {
                                      "a": "Norcrofts",
                                      "d": {
                                                           "Cliving": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 35,
                                                                           "t": 144
                                                                      },
                                                           "Faldham": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 25,
                                                                           "t": 176
                                                                      },
                                                         "Floodwend": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 45,
                                                                           "t": 127
                                                                      },
                                                           "Harwick": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 44,
                                                                           "t": 269
                                                                      },
                                                           "Hytbold": {
                                                                           "c": 65,
                                                                           "l": -84,
                                                                           "r": "R29,Q6",
                                                                           "s": 71.5,
                                                                          "st": 39,
                                                                           "t": 248
                                                                      },
                                               "Mansig's Encampment": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 53,
                                                                           "t": 214
                                                                      },
                                                       "Parth Galen": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 42,
                                                                           "t": 390
                                                                      }
                                           },
                                      "l": "48.9s,52.9w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 36,
                                     "td": "R24",
                                      "z": "East Rohan"
                                 },
                      "Entwade": {
                                      "a": "Kingstead",
                                      "d": {
                                                    "Edoras": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 25,
                                                                   "t": 236
                                                              },
                                                "Middlemead": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 24,
                                                                   "t": 132
                                                              },
                                                 "Snowbourn": {
                                                                   "c": 60,
                                                                   "l": 75,
                                                                   "s": 66,
                                                                  "st": 38,
                                                                   "t": 128
                                                              },
                                               "Underharrow": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 23,
                                                                   "t": 354
                                                              }
                                           },
                                      "l": "56.0s,65.8w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 4,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                     "Esteldin": {
                                      "d": {
                                                  "Amon Raith": {
                                                                    "c": 15,
                                                                    "t": 190
                                                                },
                                                    "Aughaire": {
                                                                    "c": 25,
                                                                    "t": 220
                                                                },
                                               "Gath Forthnir": {
                                                                     "l": 40,
                                                                     "r": "Q1R4",
                                                                     "s": 35,
                                                                    "st": 40
                                                                },
                                                    "Meluinen": {
                                                                    "c": 15,
                                                                    "t": 120
                                                                },
                                                    "Othrikar": {
                                                                    "c": 15,
                                                                    "t": 100
                                                                },
                                                   "Rivendell": {
                                                                     "l": 40,
                                                                     "s": 20,
                                                                    "st": 41
                                                                },
                                                    "Tinnudir": {
                                                                     "c": 15,
                                                                     "l": 30,
                                                                     "s": 35,
                                                                    "st": 50,
                                                                     "t": 510
                                                                },
                                               "Trestlebridge": {
                                                                    "c": 15,
                                                                    "t": 320
                                                                },
                                                   "West Bree": {
                                                                     "l": 30,
                                                                     "s": 35,
                                                                    "st": 33
                                                                }
                                           },
                                      "l": "9.6s,42.1w",
                                      "r": 1,
                                      "t": 2,
                                     "td": "R12",
                                      "z": "North Downs"
                                 },
              "Estolad Mernael": {
                                      "d": {
                                                  "Echad Sirion": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "s": 35,
                                                                      "st": 12,
                                                                       "t": 223
                                                                  },
                                                      "Helethir": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 41,
                                                                       "t": 326
                                                                  },
                                                     "Mithechad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 14,
                                                                       "t": 123
                                                                  },
                                                    "Ost Galadh": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 18,
                                                                       "t": 130
                                                                  },
                                                    "Thangulhad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 27,
                                                                       "t": 280
                                                                  },
                                               "The Haunted Inn": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D16",
                                                                       "s": 35,
                                                                      "st": 30,
                                                                       "t": 150
                                                                  }
                                           },
                                      "l": "16.8s,54.6w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 16,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                   "Ettenmoors": {
                                     "n": "Glan Vraig",
                                     "r": 1,
                                     "z": "Ettenmoors"
                                 },
        "Falathlorn Homesteads": {
                                     "l": "24.7s,90.2w",
                                     "z": "Ered Luin"
                                 },
                      "Faldham": {
                                      "a": "Norcrofts",
                                      "d": {
                                                  "Cliving": {
                                                                  "c": 60,
                                                                  "l": -75,
                                                                  "s": 66,
                                                                 "st": 33,
                                                                  "t": 226
                                                             },
                                               "Elthengels": {
                                                                  "c": 60,
                                                                  "l": -75,
                                                                  "s": 66,
                                                                 "st": 24,
                                                                  "t": 176
                                                             },
                                                 "Garsfeld": {
                                                                  "c": 60,
                                                                  "l": -75,
                                                                  "s": 66,
                                                                 "st": 31,
                                                                  "t": 92
                                                             },
                                                  "Hytbold": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R29,Q6",
                                                                  "s": 71.5,
                                                                 "st": 41,
                                                                  "t": 76
                                                             },
                                                "Snowbourn": {
                                                                  "c": 60,
                                                                  "l": -75,
                                                                  "s": 66,
                                                                 "st": 22,
                                                                  "t": 128
                                                             },
                                                  "Walstow": {
                                                                  "c": 60,
                                                                  "l": -75,
                                                                  "s": 66,
                                                                 "st": 20,
                                                                  "t": 146
                                                             }
                                           },
                                      "l": "54.8s,57.2w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 12,
                                     "td": "R24",
                                      "z": "East Rohan"
                                 },
                     "Fenmarch": {
                                      "a": "Eastfold",
                                      "d": {
                                                   "Aldburg": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 33,
                                                                   "t": 156
                                                              },
                                               "Beaconwatch": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 36,
                                                                   "t": 87
                                                              }
                                           },
                                      "l": "66.5s,57.8w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 13,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                   "First Hall": {
                                      "a": "Nud-Melek",
                                      "d": {
                                                     "Dolven-view": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "s": 45,
                                                                        "st": 47,
                                                                         "t": 413
                                                                    },
                                                    "Mekhem-bizru": {
                                                                        "mt": 38
                                                                    },
                                                 "Shadowed Refuge": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "s": 45,
                                                                        "st": 57,
                                                                         "t": 344
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "s": 45,
                                                                        "st": 46,
                                                                         "t": 345
                                                                    }
                                           },
                                      "l": "8.0s,95.3w",
                                      "r": 2,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                    "Floodwend": {
                                      "a": "the Wold",
                                      "d": {
                                                        "Elthengels": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 45,
                                                                           "t": 127
                                                                      },
                                                           "Harwick": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 30,
                                                                           "t": 178
                                                                      },
                                               "Mansig's Encampment": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 39,
                                                                           "t": 173
                                                                      },
                                                       "Parth Galen": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 29,
                                                                           "t": 345
                                                                      }
                                           },
                                      "l": "45.3s,48.2w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 5,
                                     "td": "R23",
                                      "z": "East Rohan"
                                 },
                       "Forlaw": {
                                      "d": {
                                                        "Balewood": {
                                                                         "c": 60,
                                                                         "l": -75,
                                                                         "s": 66,
                                                                        "st": 21,
                                                                         "t": 190
                                                                    },
                                                         "Harwick": {
                                                                         "l": -75,
                                                                         "s": 71.5,
                                                                        "st": 25
                                                                    },
                                                     "High Knolls": {
                                                                         "c": 60,
                                                                         "l": -75,
                                                                         "s": 66,
                                                                        "st": 11,
                                                                         "t": 174
                                                                    },
                                                       "Snowbourn": {
                                                                         "l": -75,
                                                                         "s": 71.5,
                                                                        "st": 40
                                                                    },
                                                      "South Bree": {
                                                                         "l": -75,
                                                                         "s": 71.5,
                                                                        "st": 19
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "l": -75,
                                                                         "s": 71.5,
                                                                        "st": 16
                                                                    },
                                                       "Whitshaws": {
                                                                         "c": 60,
                                                                         "l": -75,
                                                                         "s": 66,
                                                                        "st": 13,
                                                                         "t": 125
                                                                    },
                                                    "Writhendowns": {
                                                                         "c": 60,
                                                                         "l": -75,
                                                                         "s": 66,
                                                                        "st": 15,
                                                                         "t": 142
                                                                    }
                                           },
                                      "l": "39.4s,60.9w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 3,
                                      "z": "Wildermore"
                                 },
                   "Forthbrond": {
                                      "d": {
                                                           "Galtrev": {
                                                                           "c": 25,
                                                                           "l": -65,
                                                                           "s": 35,
                                                                          "st": 16,
                                                                           "t": 270
                                                                      },
                                                   "Grimbold's Camp": {
                                                                           "c": 25,
                                                                           "l": -65,
                                                                           "s": 35,
                                                                          "st": 15,
                                                                           "t": 80
                                                                      },
                                               "Rohirrim Scout-camp": {
                                                                           "c": 25,
                                                                           "l": -65,
                                                                           "s": 35,
                                                                          "st": 18,
                                                                           "t": 70
                                                                      }
                                           },
                                      "l": "86.9s,7.6w",
                                     "ml": 49,
                                      "r": 1,
                                      "t": 3,
                                      "z": "Gap of Rohan"
                                 },
                 "Gabilshathur": {
                                      "d": {
                                                    "Aughaire": {
                                                                     "r": "Q1",
                                                                     "s": 25,
                                                                    "st": 35
                                                                },
                                               "Gath Forthnir": {
                                                                     "r": "Q1R4",
                                                                     "s": 25,
                                                                    "st": 35
                                                                }
                                           },
                                      "l": "3.6s,26.6w",
                                     "ml": 25,
                                      "r": 1,
                                      "t": 3,
                                      "z": "Angmar"
                                 },
                      "Galtrev": {
                                      "a": "Galtrev",
                                      "d": {
                                                            "Avardin": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 16,
                                                                            "t": 123
                                                                       },
                                                           "Barnavon": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 18
                                                                       },
                                                      "Dagoras' Camp": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 20,
                                                                            "t": 396
                                                                       },
                                                     "Echad Naeglanc": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 15,
                                                                            "t": 190
                                                                       },
                                                         "Forthbrond": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 16,
                                                                            "t": 270
                                                                       },
                                                    "Grimbold's Camp": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 18,
                                                                            "t": 348
                                                                       },
                                               "Inner Caras Galadhon": {
                                                                            "l": -65,
                                                                            "s": 45,
                                                                           "st": 18
                                                                       },
                                                          "Lhan Rhos": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 16,
                                                                            "t": 214
                                                                       },
                                                        "Lhan Tarren": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 17,
                                                                            "t": 190
                                                                       },
                                                            "Lhanuch": {
                                                                            "l": -65,
                                                                            "s": 45,
                                                                           "st": 24
                                                                       },
                                                "Rohirrim Scout-camp": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 20,
                                                                            "t": 160
                                                                       },
                                                         "South Bree": {
                                                                            "l": -65,
                                                                            "s": 45,
                                                                           "st": 22
                                                                       },
                                                 "Tal Methedras Gate": {
                                                                            "c": 25,
                                                                            "l": -65,
                                                                            "s": 35,
                                                                           "st": 21,
                                                                            "t": 112
                                                                       },
                                                  "Twenty-first Hall": {
                                                                            "l": -65,
                                                                            "s": 45,
                                                                           "st": 20
                                                                       }
                                           },
                                      "l": "79.9s,16.7w",
                                     "ml": 47,
                                      "r": 1,
                                      "t": 7,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                      "Gapholt": {
                                      "a": "Stonedeans",
                                      "d": {
                                               "Brockbridge": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 18,
                                                                   "t": 211
                                                              },
                                                 "Woodhurst": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 19,
                                                                   "t": 150
                                                              }
                                           },
                                      "l": "53.7s,83.7w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 13,
                                     "td": "R34",
                                      "z": "West Rohan"
                                 },
                     "Garsfeld": {
                                      "a": "Sutcrofts",
                                      "d": {
                                                 "Eaworth": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 34,
                                                                 "t": 130
                                                            },
                                                 "Faldham": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 31,
                                                                 "t": 92
                                                            },
                                                 "Hytbold": {
                                                                 "c": 65,
                                                                 "l": -84,
                                                                 "r": "R30,Q6",
                                                                 "s": 71.5,
                                                                "st": 42,
                                                                 "t": 166
                                                            },
                                               "Snowbourn": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 46,
                                                                 "t": 116
                                                            },
                                                 "Walstow": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 24,
                                                                 "t": 288
                                                            }
                                           },
                                      "l": "54.7s,61.8w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 4,
                                     "td": "R25",
                                      "z": "East Rohan"
                                 },
                "Gath Forthnir": {
                                      "d": {
                                                   "Aughaire": {
                                                                    "r": "Q1R4",
                                                                    "s": 25,
                                                                   "st": 29
                                                               },
                                                   "Esteldin": {
                                                                    "l": 40,
                                                                    "r": "R5",
                                                                    "s": 35,
                                                                   "st": 39
                                                               },
                                               "Gabilshathur": {
                                                                    "r": "Q1R4",
                                                                    "s": 25,
                                                                   "st": 35
                                                               },
                                                  "Rivendell": {
                                                                    "l": 40,
                                                                    "r": "Q1R2",
                                                                    "s": 35,
                                                                   "st": 33
                                                               },
                                                  "Suri-kyla": {
                                                                    "l": 40,
                                                                    "r": "Q1R3",
                                                                    "s": 35,
                                                                   "st": 45
                                                               }
                                           },
                                      "l": "10.4n,24.0w",
                                      "r": 1,
                                      "t": 23,
                                     "td": "R15",
                                      "z": "Angmar"
                                 },
                   "Glan Vraig": {
                                     "d": {
                                              "Michel Delving": {
                                                                     "s": 35,
                                                                    "st": 30
                                                                },
                                                   "Rivendell": {
                                                                     "s": 35,
                                                                    "st": 30
                                                                },
                                                  "South Bree": {
                                                                     "s": 35,
                                                                    "st": 30
                                                                },
                                               "Thorin's Gate": {
                                                                     "s": 35,
                                                                    "st": 30
                                                                }
                                          },
                                     "l": "21.1s,13.4w",
                                     "z": "Ettenmoors"
                                 },
                 "Gloin's Camp": {
                                      "d": {
                                               "High Crag": {
                                                                 "s": 25,
                                                                "st": 15
                                                            },
                                                "Hrimbarg": {
                                                                 "s": 25,
                                                                "st": 23
                                                            },
                                               "Rivendell": {
                                                                 "c": 15,
                                                                 "s": 35,
                                                                "st": 18,
                                                                 "t": 150
                                                            },
                                               "Vindurhal": {
                                                                 "s": 25,
                                                                "st": 15
                                                            }
                                           },
                                      "l": "24.9s,4.0w",
                                     "ml": 20,
                                      "r": 1,
                                      "t": 4,
                                      "z": "Misty Mountains"
                                 },
                     "Gondamon": {
                                      "d": {
                                                     "Duillond": {
                                                                     "c": 1,
                                                                     "t": 154
                                                                 },
                                                      "Noglond": {
                                                                     "c": 1,
                                                                     "t": 84
                                                                 },
                                                "Thorin's Gate": {
                                                                     "c": 1,
                                                                     "t": 180
                                                                 },
                                               "Thrasi's Lodge": {
                                                                     "c": 1,
                                                                     "t": 90
                                                                 }
                                           },
                                      "l": "20.4s,97.1w",
                                      "r": 1,
                                      "t": 7,
                                     "td": "R9",
                                      "z": "Ered Luin"
                                 },
              "Grimbold's Camp": {
                                      "d": {
                                               "Dagoras' Camp": {
                                                                     "c": 25,
                                                                     "l": -65,
                                                                     "s": 35,
                                                                    "st": 15,
                                                                     "t": 67
                                                                },
                                                  "Forthbrond": {
                                                                     "c": 25,
                                                                     "l": -65,
                                                                     "s": 35,
                                                                    "st": 15,
                                                                     "t": 80
                                                                },
                                                     "Galtrev": {
                                                                     "c": 25,
                                                                     "l": -65,
                                                                     "s": 35,
                                                                    "st": 18,
                                                                     "t": 348
                                                                }
                                           },
                                      "l": "87.8s,3.9w",
                                     "ml": 49,
                                      "r": 1,
                                      "t": 2,
                                      "z": "Gap of Rohan"
                                 },
                    "Grimslade": {
                                      "a": "Westfold",
                                      "d": {
                                               "Helm's Deep": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 13,
                                                                   "t": 250
                                                              }
                                           },
                                      "l": "62.3s,82.0w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 5,
                                     "td": "R34",
                                      "z": "West Rohan"
                                 },
                     "Gwingris": {
                                      "d": {
                                               "Echad Candelleth": {
                                                                       "c": 25,
                                                                       "l": 40,
                                                                       "t": 162
                                                                   },
                                                   "Echad Dunann": {
                                                                        "c": 25,
                                                                        "l": -45,
                                                                        "r": "D3",
                                                                        "s": 35,
                                                                       "st": 40,
                                                                        "t": 327
                                                                   },
                                                  "Echad Eregion": {
                                                                        "c": 25,
                                                                        "l": -40,
                                                                        "r": "D2",
                                                                        "s": 35,
                                                                       "st": 40,
                                                                        "t": 150
                                                                   },
                                                  "Echad Mirobel": {
                                                                        "c": 25,
                                                                        "l": -45,
                                                                        "r": "D4",
                                                                        "s": 35,
                                                                       "st": 62,
                                                                        "t": 378
                                                                   },
                                                      "Rivendell": {
                                                                        "c": 25,
                                                                        "l": -40,
                                                                        "r": "D1",
                                                                        "s": 35,
                                                                       "st": 38,
                                                                        "t": 543
                                                                   }
                                           },
                                      "l": "40.2s,16.0w",
                                     "ml": 33,
                                      "r": 1,
                                      "t": 7,
                                      "z": "Eregion"
                                 },
                   "Harndirion": {
                                      "d": {
                                               "Echad Daervunn": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D6",
                                                                      "s": 35,
                                                                     "st": 12,
                                                                      "t": 189
                                                                 },
                                                "Echad Dagoras": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "s": 35,
                                                                     "st": 17,
                                                                      "t": 303
                                                                 },
                                               "Echad Naeglanc": {
                                                                      "c": 25,
                                                                      "l": 65,
                                                                      "s": 35,
                                                                     "st": 19,
                                                                      "t": 250
                                                                 },
                                                      "Lhanuch": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D6",
                                                                      "s": 35,
                                                                     "st": 25,
                                                                      "t": 83
                                                                 },
                                                  "Maur Tulhau": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D5",
                                                                      "s": 35,
                                                                     "st": 20,
                                                                      "t": 270
                                                                 }
                                           },
                                      "l": "69.4s,13.7w",
                                     "ml": 40,
                                      "r": 1,
                                      "t": 1,
                                     "td": "R16",
                                      "z": "Enedwaith"
                                 },
                      "Harwick": {
                                      "a": "the Wold",
                                      "d": {
                                                    "Cliving": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 66,
                                                                   "st": 40,
                                                                    "t": 238
                                                               },
                                                    "Eaworth": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 66,
                                                                   "st": 25,
                                                                    "t": 380
                                                               },
                                                 "Elthengels": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 66,
                                                                   "st": 44,
                                                                    "t": 269
                                                               },
                                                  "Floodwend": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 66,
                                                                   "st": 30,
                                                                    "t": 178
                                                               },
                                                     "Forlaw": {
                                                                    "l": -75,
                                                                    "s": 71.5,
                                                                   "st": 25
                                                               },
                                                    "Hytbold": {
                                                                    "c": 65,
                                                                    "l": -84,
                                                                    "r": "R28,Q6",
                                                                    "s": 71.5,
                                                                   "st": 42,
                                                                    "t": 492
                                                               },
                                                "Parth Galen": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 66,
                                                                   "st": 28,
                                                                    "t": 492
                                                               },
                                                  "Snowbourn": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 66,
                                                                   "st": 24,
                                                                    "t": 546
                                                               },
                                                   "Stangard": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 71.5,
                                                                   "st": 25,
                                                                    "t": 315
                                                               },
                                               "Writhendowns": {
                                                                    "c": 60,
                                                                    "l": -75,
                                                                    "s": 71.5,
                                                                   "st": 22,
                                                                    "t": 221
                                                               }
                                           },
                                      "l": "39.0s,52.3w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 7,
                                     "td": "R23",
                                      "z": "East Rohan"
                                 },
                     "Helethir": {
                                      "d": {
                                                  "Echad Sirion": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "s": 35,
                                                                      "st": 12,
                                                                       "t": 385
                                                                  },
                                               "Estolad Mernael": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 41,
                                                                       "t": 326
                                                                  },
                                                     "Mithechad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 14,
                                                                       "t": 277
                                                                  },
                                                    "Ost Galadh": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 23,
                                                                       "t": 192
                                                                  },
                                                    "Thangulhad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 26,
                                                                       "t": 82
                                                                  },
                                               "The Haunted Inn": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D16",
                                                                       "s": 35,
                                                                      "st": 30,
                                                                       "t": 330
                                                                  }
                                           },
                                      "l": "16.1s,44.6w",
                                      "r": 2,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                  "Helm's Deep": {
                                      "a": "Helm's Deep",
                                      "d": {
                                                         "Aldburg": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 28,
                                                                         "t": 631
                                                                    },
                                                          "Edoras": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 27,
                                                                         "t": 319
                                                                    },
                                                       "Grimslade": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 13,
                                                                         "t": 250
                                                                    },
                                                        "Isengard": {
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 16
                                                                    },
                                                      "South Bree": {
                                                                         "l": 75,
                                                                         "s": 71.5,
                                                                        "st": 19
                                                                    },
                                                           "Stoke": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 23,
                                                                         "t": 547
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "l": -85,
                                                                         "s": 71.5,
                                                                        "st": 23
                                                                    },
                                                       "Woodhurst": {
                                                                         "c": 60,
                                                                         "l": -85,
                                                                         "s": 66,
                                                                        "st": 15,
                                                                         "t": 285
                                                                    }
                                           },
                                      "l": "61.4s,88.8w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 48,
                                     "td": "R34",
                                      "z": "West Rohan"
                                 },
              "Hengstacer Farm": {
                                      "d": {
                                               "Trestlebridge": {
                                                                    "c": 1,
                                                                    "t": 140
                                                                },
                                                   "West Bree": {
                                                                    "c": 1,
                                                                    "t": 160
                                                                }
                                           },
                                      "l": "22.3s,52.3w",
                                      "r": 1,
                                     "td": "R11",
                                      "z": "Bree-land"
                                 },
                    "High Crag": {
                                     "d": {
                                              "Gloin's Camp": {
                                                                   "s": 25,
                                                                  "st": 15
                                                              },
                                                  "Hrimbarg": {
                                                                   "s": 25,
                                                                  "st": 15
                                                              },
                                                 "Vindurhal": {
                                                                   "s": 25,
                                                                  "st": 11
                                                              }
                                          },
                                     "l": "24.6s,1.3e",
                                     "r": 1,
                                     "z": "Misty Mountains"
                                 },
         "High King's Crossing": {
                                      "d": {
                                                 "Dwaling": {
                                                                 "c": 15,
                                                                 "s": 25,
                                                                "st": 11,
                                                                 "t": 174
                                                            },
                                               "Oatbarton": {
                                                                 "c": 15,
                                                                 "s": 25,
                                                                "st": 12,
                                                                 "t": 244
                                                            },
                                               "Ost Forod": {
                                                                 "c": 15,
                                                                 "s": 25,
                                                                "st": 21,
                                                                 "t": 127
                                                            },
                                                "Tinnudir": {
                                                                 "c": 15,
                                                                 "s": 25,
                                                                "st": 31,
                                                                 "t": 118
                                                            }
                                           },
                                      "l": "13.8s,64.1w",
                                     "ml": 15,
                                      "r": 1,
                                      "t": 3,
                                      "z": "Evendim"
                                 },
                  "High Knolls": {
                                      "d": {
                                                "Balewood": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 20,
                                                                 "t": 150
                                                            },
                                                  "Forlaw": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 11,
                                                                 "t": 174
                                                            },
                                               "Whitshaws": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 12,
                                                                 "t": 160
                                                            }
                                           },
                                      "l": "33.0s,66.6w",
                                      "n": "Byre Tor",
                                      "r": 2,
                                     "td": "R32",
                                      "z": "Wildermore"
                                 },
                     "Hobbiton": {
                                      "d": {
                                               "Brockenborings": {
                                                                     "c": 1,
                                                                     "t": 104
                                                                 },
                                               "Michel Delving": {
                                                                     "c": 1,
                                                                     "t": 102
                                                                 },
                                                   "Needlehole": {
                                                                     "c": 1,
                                                                     "t": 166
                                                                 },
                                                        "Stock": {
                                                                     "c": 1,
                                                                     "t": 131
                                                                 },
                                                    "West Bree": {
                                                                     "c": 5,
                                                                     "t": 337
                                                                 }
                                           },
                                      "l": "31.5s,71.2w",
                                      "r": 1,
                                      "t": 3,
                                     "td": "R10",
                                      "z": "the Shire"
                                 },
                     "Hrimbarg": {
                                     "d": {
                                              "Gloin's Camp": {
                                                                   "s": 25,
                                                                  "st": 23
                                                              },
                                                 "High Crag": {
                                                                   "s": 25,
                                                                  "st": 15
                                                              },
                                                 "Rivendell": {
                                                                   "s": 35,
                                                                  "st": 23
                                                              },
                                                 "Vindurhal": {
                                                                   "s": 25,
                                                                  "st": 11
                                                              }
                                          },
                                     "l": "24.4s,7.0e",
                                     "r": 1,
                                     "z": "Misty Mountains"
                                 },
                      "Hytbold": {
                                      "a": "Sutcrofts",
                                      "d": {
                                                  "Cliving": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R29,Q6",
                                                                  "s": 71.5,
                                                                 "st": 48,
                                                                  "t": 300
                                                             },
                                                  "Eaworth": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R31,Q6",
                                                                  "s": 71.5,
                                                                 "st": 44,
                                                                  "t": 292
                                                             },
                                               "Elthengels": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R29,Q6",
                                                                  "s": 71.5,
                                                                 "st": 39,
                                                                  "t": 248
                                                             },
                                                  "Faldham": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R29,Q6",
                                                                  "s": 71.5,
                                                                 "st": 41,
                                                                  "t": 76
                                                             },
                                                 "Garsfeld": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R30,Q6",
                                                                  "s": 71.5,
                                                                 "st": 42,
                                                                  "t": 166
                                                             },
                                                  "Harwick": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R28,Q6",
                                                                  "s": 71.5,
                                                                 "st": 42,
                                                                  "t": 492
                                                             },
                                                "Snowbourn": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R30,Q6",
                                                                  "s": 71.5,
                                                                 "st": 34,
                                                                  "t": 200
                                                             },
                                                  "Walstow": {
                                                                  "c": 65,
                                                                  "l": -84,
                                                                  "r": "R30,Q6",
                                                                  "s": 71.5,
                                                                 "st": 34,
                                                                  "t": 120
                                                             }
                                           },
                                      "l": "57.3s,55.4w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R25",
                                      "z": "East Rohan"
                                 },
         "Inner Caras Galadhon": {
                                      "a": "Caras Galadhon",
                                      "d": {
                                                  "Caras Galadhon": {
                                                                        "mt": 65
                                                                    },
                                                         "Galtrev": {
                                                                         "l": 65,
                                                                         "s": 45,
                                                                        "st": 20
                                                                    },
                                                         "Lhanuch": {
                                                                         "l": 50,
                                                                         "r": "R8D6",
                                                                         "s": 45,
                                                                        "st": 28
                                                                    },
                                                      "Ost Galadh": {
                                                                         "l": 50,
                                                                         "s": 25,
                                                                        "st": 27
                                                                    },
                                                       "Rivendell": {
                                                                         "l": 50,
                                                                         "r": "R7Q3",
                                                                         "s": 45,
                                                                        "st": 17
                                                                    },
                                                       "Snowbourn": {
                                                                         "l": -75,
                                                                         "s": 71.5,
                                                                        "st": 17
                                                                    },
                                                        "Stangard": {
                                                                         "l": 70,
                                                                         "s": 45,
                                                                        "st": 20
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "l": 50,
                                                                         "r": "Q3",
                                                                         "s": 25,
                                                                        "st": 17
                                                                    }
                                           },
                                      "l": "15.1s,68.2w",
                                      "r": 2,
                                      "t": 30,
                                     "td": "R8",
                                      "z": "Lothlorien"
                                 },
                     "Isengard": {
                                      "a": "Nan Curunir",
                                      "d": {
                                                   "Aldburg": {
                                                                   "l": 85,
                                                                   "s": 66,
                                                                  "st": 21
                                                              },
                                               "Helm's Deep": {
                                                                   "l": 85,
                                                                   "s": 66,
                                                                  "st": 16
                                                              }
                                           },
                                      "l": "47.7s,89.7w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 0,
                                     "td": "R34",
                                      "z": "West Rohan"
                                 },
                    "Jazargund": {
                                      "a": "Durin's Way",
                                      "d": {
                                               "Twenty-first Hall": {
                                                                        "c": 35,
                                                                        "l": -45,
                                                                        "t": 48
                                                                    },
                                                      "Zirakzigil": {
                                                                        "c": 35,
                                                                        "l": -45,
                                                                        "t": 98
                                                                    }
                                           },
                                      "l": "3.7s,106.0w",
                                     "ml": 36,
                                      "r": 2,
                                      "t": 9,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                 "Kauppa-kohta": {
                                      "d": {
                                                  "Ost Forod": {
                                                                    "c": 25,
                                                                    "l": 40,
                                                                    "s": 35,
                                                                   "st": 70,
                                                                    "t": 300
                                                               },
                                               "Pynti-peldot": {
                                                                   "c": 25,
                                                                   "l": 40,
                                                                   "t": 326
                                                               }
                                           },
                                      "l": "2.6n,58.0w",
                                     "ml": 29,
                                      "r": 1,
                                      "t": 14,
                                     "td": "R14",
                                      "z": "Forochel"
                                 },
                   "Kuru-leiri": {
                                      "d": {
                                               "Suri-kyla": {
                                                                 "l": 40,
                                                                 "r": "Q2",
                                                                 "s": 25,
                                                                "st": 35
                                                            }
                                           },
                                      "l": "9.6n,81.1w",
                                      "r": 1,
                                     "td": "R14",
                                      "z": "Forochel"
                                 },
                     "Langhold": {
                                      "a": "the Wold",
                                      "d": {
                                               "Floodwend": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 42,
                                                                 "t": 220
                                                            },
                                                 "Harwick": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 41,
                                                                 "t": 70
                                                            },
                                                "Rushgore": {
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 19
                                                            },
                                                "Stangard": {
                                                                 "c": 60,
                                                                 "l": -75,
                                                                 "s": 66,
                                                                "st": 26,
                                                                 "t": 255
                                                            }
                                           },
                                      "l": "35.9s,53.9w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 9,
                                      "z": "East Rohan"
                                 },
                    "Lhan Rhos": {
                                      "d": {
                                                "Avardin": {
                                                                "c": 25,
                                                                "l": -65,
                                                                "s": 35,
                                                               "st": 10,
                                                                "t": 103
                                                           },
                                               "Barnavon": {
                                                                "c": 25,
                                                                "l": -65,
                                                                "s": 35,
                                                               "st": 12,
                                                                "t": 162
                                                           },
                                                "Galtrev": {
                                                                "c": 25,
                                                                "l": -65,
                                                                "s": 35,
                                                               "st": 16,
                                                                "t": 214
                                                           }
                                           },
                                      "l": "86.8s,23.0w",
                                     "ml": 55,
                                      "r": 1,
                                      "t": 16,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                  "Lhan Tarren": {
                                      "d": {
                                               "Echad Daervunn": {
                                                                      "c": 25,
                                                                      "l": -65,
                                                                      "s": 35,
                                                                     "st": 12,
                                                                      "t": 178
                                                                 },
                                               "Echad Naeglanc": {
                                                                      "c": 25,
                                                                      "l": -65,
                                                                      "s": 35,
                                                                     "st": 15,
                                                                      "t": 165
                                                                 },
                                                      "Galtrev": {
                                                                      "c": 25,
                                                                      "l": -65,
                                                                      "s": 35,
                                                                     "st": 17,
                                                                      "t": 190
                                                                 }
                                           },
                                      "l": "75.3s,22.4w",
                                     "ml": 46,
                                      "r": 1,
                                      "t": 4,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                      "Lhanuch": {
                                      "d": {
                                                     "Echad Daervunn": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D6",
                                                                            "s": 35,
                                                                           "st": 22,
                                                                            "t": 132
                                                                       },
                                                      "Echad Dagoras": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "s": 35,
                                                                           "st": 25,
                                                                            "t": 244
                                                                       },
                                                            "Galtrev": {
                                                                            "l": -50,
                                                                            "s": 45,
                                                                           "st": 24
                                                                       },
                                                         "Harndirion": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D7",
                                                                            "s": 35,
                                                                           "st": 25,
                                                                            "t": 83
                                                                       },
                                               "Inner Caras Galadhon": {
                                                                            "l": 50,
                                                                            "r": "Q3R8",
                                                                            "s": 45,
                                                                           "st": 28
                                                                       },
                                                        "Maur Tulhau": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D5",
                                                                            "s": 35,
                                                                           "st": 32,
                                                                            "t": 214
                                                                       },
                                                          "Rivendell": {
                                                                            "l": 50,
                                                                            "r": "R7",
                                                                            "s": 45,
                                                                           "st": 27
                                                                       },
                                                         "South Bree": {
                                                                            "l": 50,
                                                                            "s": 45,
                                                                           "st": 28
                                                                       }
                                           },
                                      "l": "66.9s,16.9w",
                                     "ml": 40,
                                      "r": 1,
                                      "t": 19,
                                     "td": "R21",
                                      "z": "Enedwaith"
                                 },
          "Mansig's Encampment": {
                                      "a": "the East Wall",
                                      "d": {
                                                "Elthengels": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 53,
                                                                   "t": 214
                                                              },
                                                 "Floodwend": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 39,
                                                                   "t": 173
                                                              },
                                               "Parth Galen": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 35,
                                                                   "t": 215
                                                              }
                                           },
                                      "l": "52.2s,51.3w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 7,
                                      "z": "East Rohan"
                                 },
                  "Maur Tulhau": {
                                      "d": {
                                               "Echad Daervunn": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D6",
                                                                      "s": 35,
                                                                     "st": 15,
                                                                      "t": 90
                                                                 },
                                                "Echad Dagoras": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "s": 35,
                                                                     "st": 28,
                                                                      "t": 305
                                                                 },
                                                   "Harndirion": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D7",
                                                                      "s": 35,
                                                                     "st": 20,
                                                                      "t": 270
                                                                 },
                                                      "Lhanuch": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D6",
                                                                      "s": 35,
                                                                     "st": 32,
                                                                      "t": 214
                                                                 }
                                           },
                                      "l": "62.9s,23.2w",
                                     "ml": 40,
                                      "r": 1,
                                      "t": 19,
                                      "z": "Enedwaith"
                                 },
                 "Mekhem-bizru": {
                                      "d": {
                                                       "Caras Galadhon": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D14",
                                                                              "s": 25,
                                                                             "st": 16,
                                                                              "t": 255
                                                                         },
                                                         "Cerin Amroth": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D14",
                                                                              "s": 25,
                                                                             "st": 12,
                                                                              "t": 238
                                                                         },
                                                       "Echad Andestel": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D13",
                                                                              "s": 25,
                                                                             "st": 24,
                                                                              "t": 133
                                                                         },
                                                           "First Hall": {
                                                                             "mt": 38
                                                                         },
                                               "The Vinyards of Lorien": {
                                                                              "c": 25,
                                                                              "l": -50,
                                                                              "r": "D15",
                                                                              "s": 25,
                                                                             "st": 12,
                                                                              "t": 278
                                                                         }
                                           },
                                      "l": "11.5s,78.6w",
                                     "ml": 39,
                                      "r": 2,
                                      "t": 8,
                                     "td": "R8",
                                      "z": "Lothlorien"
                                 },
                     "Meluinen": {
                                     "d": {
                                              "Esteldin": {
                                                              "c": 15,
                                                              "t": 120
                                                          },
                                              "Othrikar": {
                                                              "c": 15,
                                                              "t": 130
                                                          }
                                          },
                                     "l": "13.6s,44.5w",
                                     "r": 1,
                                     "z": "North Downs"
                                 },
             "Men Erain - Boat": {
                                      "d": {
                                               "The Eavespires - Boat": {
                                                                            "c": 25,
                                                                            "t": 6
                                                                        },
                                                     "Tinnudir - Boat": {
                                                                            "c": 25,
                                                                            "t": 4
                                                                        },
                                                   "Tyl Ruinen - Boat": {
                                                                            "c": 25,
                                                                            "t": 4
                                                                        }
                                           },
                                      "l": "15.4s,66.3w",
                                      "r": -1,
                                     "td": "R6",
                                      "z": "Evendim"
                                 },
               "Michel Delving": {
                                      "d": {
                                                       "Celondim": {
                                                                       "S0": true,
                                                                        "s": 1,
                                                                       "st": 19
                                                                   },
                                                          "Combe": {
                                                                        "s": 1,
                                                                       "st": 19
                                                                   },
                                                     "Ettenmoors": {
                                                                        "l": 40,
                                                                        "r": "s1",
                                                                        "s": 100,
                                                                       "st": 30
                                                                   },
                                                       "Hobbiton": {
                                                                       "c": 1,
                                                                       "t": 102
                                                                   },
                                               "Shire Homesteads": {
                                                                       "c": 5,
                                                                       "t": 112
                                                                   },
                                                  "Thorin's Gate": {
                                                                       "S0": true,
                                                                        "s": 1,
                                                                       "st": 24
                                                                   },
                                                       "Tinnudir": {
                                                                        "s": 35,
                                                                       "st": 38
                                                                   },
                                                      "West Bree": {
                                                                       "S0": true,
                                                                        "s": 1,
                                                                       "st": 22
                                                                   }
                                           },
                                      "l": "34.2s,75.5w",
                                      "r": 1,
                                      "t": 18,
                                     "td": "R10",
                                      "z": "the Shire"
                                 },
                   "Middlemead": {
                                      "a": "Kingstead",
                                      "d": {
                                                    "Edoras": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 21,
                                                                   "t": 343
                                                              },
                                                   "Entwade": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 24,
                                                                   "t": 132
                                                              },
                                               "Underharrow": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 18,
                                                                   "t": 463
                                                              }
                                           },
                                      "l": "53.7s,72.5w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 13,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                    "Mithechad": {
                                      "d": {
                                                  "Echad Sirion": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "s": 28,
                                                                      "st": 12,
                                                                       "t": 279
                                                                  },
                                               "Estolad Mernael": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 15,
                                                                       "t": 123
                                                                  },
                                                      "Helethir": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 14,
                                                                       "t": 277
                                                                  },
                                                    "Ost Galadh": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 17,
                                                                       "t": 87
                                                                  },
                                                    "Thangulhad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 26,
                                                                       "t": 230
                                                                  },
                                               "The Haunted Inn": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D16",
                                                                       "s": 35,
                                                                      "st": 27,
                                                                       "t": 214
                                                                  }
                                           },
                                      "l": "17.6s,48.3w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 3,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                 "Nan Tornaeth": {
                                      "d": {
                                               "Thorenhad": {
                                                                 "s": 25,
                                                                "st": 13
                                                            }
                                           },
                                      "l": "28.2s,15.3w",
                                      "r": 1,
                                     "td": "R7",
                                      "z": "Trollshaws"
                                 },
                   "Needlehole": {
                                      "d": {
                                               "Duillond": {
                                                               "c": 5,
                                                               "t": 150
                                                           },
                                               "Hobbiton": {
                                                               "c": 1,
                                                               "t": 166
                                                           }
                                           },
                                      "l": "27.9s,76.1w",
                                      "r": 1,
                                     "td": "R10",
                                      "z": "the Shire"
                                 },
                      "Noglond": {
                                      "d": {
                                                    "Gondamon": {
                                                                    "c": 1,
                                                                    "t": 84
                                                                },
                                               "Thorin's Gate": {
                                                                    "c": 1,
                                                                    "t": 114
                                                                }
                                           },
                                      "l": "19.4s,100.6w",
                                      "r": 1,
                                     "td": "R9",
                                      "z": "Ered Luin"
                                 },
             "North Trollshaws": {
                                      "d": {
                                               "Barachen's Camp": {
                                                                       "s": 25,
                                                                      "st": 13
                                                                  }
                                           },
                                      "l": "28.6s,19.4w",
                                      "r": 1,
                                     "td": "R7",
                                      "z": "Trollshaws"
                                 },
                    "Oatbarton": {
                                      "d": {
                                                     "Brockenborings": {
                                                                           "c": 15,
                                                                           "t": 77
                                                                       },
                                                            "Dwaling": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 10,
                                                                            "t": 68
                                                                       },
                                               "High King's Crossing": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 11,
                                                                            "t": 244
                                                                       },
                                                          "Ost Forod": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 25,
                                                                            "t": 363
                                                                       },
                                                           "Tinnudir": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 32,
                                                                            "t": 358
                                                                       }
                                           },
                                      "l": "23.4s,67.4w",
                                     "ml": 10,
                                      "r": 1,
                                      "t": 7,
                                     "td": "R10",
                                      "z": "Evendim"
                                 },
                       "Oserly": {
                                      "a": "Broadacres",
                                      "d": {
                                               "Stoke": {
                                                             "c": 60,
                                                             "l": -85,
                                                             "s": 66,
                                                            "st": 17,
                                                             "t": 77
                                                        }
                                           },
                                      "l": "45.9s,67.0w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 21,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                    "Ost Forod": {
                                      "d": {
                                                            "Dwaling": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 21,
                                                                            "t": 300
                                                                       },
                                               "High King's Crossing": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 21,
                                                                            "t": 127
                                                                       },
                                                       "Kauppa-kohta": {
                                                                            "c": 25,
                                                                            "l": 40,
                                                                            "s": 25,
                                                                           "st": 70,
                                                                            "t": 300
                                                                       },
                                                          "Oatbarton": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 25,
                                                                            "t": 363
                                                                       },
                                                       "Pynti-peldot": {
                                                                            "c": 25,
                                                                            "l": -40,
                                                                            "r": "R3",
                                                                            "s": 25,
                                                                           "st": 48,
                                                                            "t": 625
                                                                       },
                                                          "Suri-kyla": {
                                                                            "l": 40,
                                                                            "r": "R3",
                                                                            "s": 25,
                                                                           "st": 72
                                                                       },
                                                           "Tinnudir": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 41,
                                                                            "t": 111
                                                                       },
                                                      "Trestlebridge": {
                                                                           "c": 15,
                                                                           "t": 373
                                                                       },
                                                          "West Bree": {
                                                                            "l": 30,
                                                                            "s": 35,
                                                                           "st": 36
                                                                       }
                                           },
                                      "l": "8.2s,64.3w",
                                     "ml": 15,
                                      "r": 1,
                                      "t": 25,
                                      "z": "Evendim"
                                 },
                   "Ost Galadh": {
                                      "d": {
                                                       "Echad Sirion": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "s": 35,
                                                                           "st": 18,
                                                                            "t": 200
                                                                       },
                                                    "Estolad Mernael": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D17",
                                                                            "s": 35,
                                                                           "st": 18,
                                                                            "t": 130
                                                                       },
                                                           "Helethir": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D18",
                                                                            "s": 35,
                                                                           "st": 23,
                                                                            "t": 192
                                                                       },
                                               "Inner Caras Galadhon": {
                                                                            "l": 50,
                                                                            "r": "Q3",
                                                                            "s": 35,
                                                                           "st": 27
                                                                       },
                                                          "Mithechad": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D18",
                                                                            "s": 35,
                                                                           "st": 17,
                                                                            "t": 87
                                                                       },
                                                         "Thangulhad": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D18",
                                                                            "s": 35,
                                                                           "st": 36,
                                                                            "t": 148
                                                                       },
                                                    "The Haunted Inn": {
                                                                            "c": 25,
                                                                            "l": -50,
                                                                            "r": "D16",
                                                                            "s": 35,
                                                                           "st": 35,
                                                                            "t": 126
                                                                       }
                                           },
                                      "l": "14.3s,51.2w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 0,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                   "Ost Guruth": {
                                      "d": {
                                                      "Rivendell": {
                                                                        "c": 15,
                                                                        "s": 25,
                                                                       "st": 24,
                                                                        "t": 609
                                                                   },
                                                     "South Bree": {
                                                                        "l": 15,
                                                                        "s": 25,
                                                                       "st": 24
                                                                   },
                                               "The Forsaken Inn": {
                                                                       "c": 15,
                                                                       "t": 203
                                                                   },
                                                      "Thorenhad": {
                                                                       "c": 15,
                                                                       "t": 310
                                                                   }
                                           },
                                      "l": "32.1s,29.8w",
                                      "r": 1,
                                      "t": 26,
                                     "td": "R13",
                                      "z": "Lone-lands"
                                 },
                     "Othrikar": {
                                     "d": {
                                              "Esteldin": {
                                                              "c": 15,
                                                              "t": 100
                                                          },
                                              "Meluinen": {
                                                              "c": 15,
                                                              "t": 130
                                                          }
                                          },
                                     "l": "6.9s,45.0w",
                                     "r": 1,
                                     "z": "North Downs"
                                 },
              "Parth Celebrant": {
                                      "d": {
                                                 "Brown Lands": {
                                                                     "l": 70,
                                                                     "s": 35,
                                                                    "st": 11
                                                                },
                                                    "Rushgore": {
                                                                     "c": 25,
                                                                     "l": -70,
                                                                     "s": 35,
                                                                    "st": 10,
                                                                     "t": 140
                                                                },
                                                    "Stangard": {
                                                                     "c": 25,
                                                                     "l": -70,
                                                                     "s": 35,
                                                                    "st": 16,
                                                                     "t": 95
                                                                },
                                                    "Thinglad": {
                                                                     "l": 70,
                                                                     "s": 35,
                                                                    "st": 20
                                                                },
                                               "Wailing Hills": {
                                                                     "c": 25,
                                                                     "l": -70,
                                                                     "s": 35,
                                                                    "st": 10,
                                                                     "t": 172
                                                                }
                                           },
                                      "l": "26.6s,58.3w",
                                     "ml": 50,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R26",
                                      "z": "Great River"
                                 },
                  "Parth Galen": {
                                      "a": "the East Wall",
                                      "d": {
                                                           "Cliving": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 37,
                                                                           "t": 502
                                                                      },
                                                           "Eaworth": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 22,
                                                                           "t": 644
                                                                      },
                                                        "Elthengels": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 42,
                                                                           "t": 390
                                                                      },
                                                         "Floodwend": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 29,
                                                                           "t": 345
                                                                      },
                                                           "Harwick": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 28,
                                                                           "t": 492
                                                                      },
                                               "Mansig's Encampment": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 35,
                                                                           "t": 215
                                                                      },
                                                         "Snowbourn": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 22,
                                                                           "t": 327
                                                                      },
                                                           "Walstow": {
                                                                           "c": 60,
                                                                           "l": -75,
                                                                           "s": 66,
                                                                          "st": 19,
                                                                           "t": 194
                                                                      }
                                           },
                                      "l": "58.7s,47.8w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 3,
                                      "z": "East Rohan"
                                 },
                 "Pynti-peldot": {
                                      "d": {
                                               "Kauppa-kohta": {
                                                                   "c": 25,
                                                                   "l": 40,
                                                                   "t": 326
                                                               },
                                                  "Ost Forod": {
                                                                    "c": 25,
                                                                    "l": -40,
                                                                    "r": "R3",
                                                                    "s": 25,
                                                                   "st": 56,
                                                                    "t": 625
                                                               },
                                                  "Suri-kyla": {
                                                                   "c": 25,
                                                                   "l": 40,
                                                                   "t": 303
                                                               },
                                                  "Zigilgund": {
                                                                   "c": 25,
                                                                   "l": 40,
                                                                   "t": 248
                                                               }
                                           },
                                      "l": "11.3n,69.4w",
                                     "ml": 29,
                                      "r": 1,
                                      "t": 11,
                                     "td": "R14",
                                      "z": "Forochel"
                                 },
                    "Rivendell": {
                                      "a": "Rivendell",
                                      "d": {
                                                   "Echad Candelleth": {
                                                                            "c": 25,
                                                                            "l": 35,
                                                                            "s": 25,
                                                                           "st": 23,
                                                                            "t": 392
                                                                       },
                                                       "Echad Dunann": {
                                                                            "c": 25,
                                                                            "l": -45,
                                                                            "r": "D3",
                                                                            "s": 35,
                                                                           "st": 22,
                                                                            "t": 712
                                                                       },
                                                      "Echad Eregion": {
                                                                            "c": 25,
                                                                            "l": -40,
                                                                            "r": "D2",
                                                                            "s": 35,
                                                                           "st": 21,
                                                                            "t": 532
                                                                       },
                                                      "Echad Mirobel": {
                                                                            "c": 25,
                                                                            "l": -45,
                                                                            "r": "D4",
                                                                            "s": 35,
                                                                           "st": 48,
                                                                            "t": 762
                                                                       },
                                                           "Esteldin": {
                                                                            "l": 40,
                                                                            "s": 20,
                                                                           "st": 41
                                                                       },
                                                         "Ettenmoors": {
                                                                            "l": 20,
                                                                            "r": "s1",
                                                                            "s": 1,
                                                                           "st": 30
                                                                       },
                                                      "Gath Forthnir": {
                                                                            "l": 40,
                                                                            "r": "Q1R4",
                                                                            "s": 35,
                                                                           "st": 33
                                                                       },
                                                       "Gloin's Camp": {
                                                                            "c": 15,
                                                                            "s": 35,
                                                                           "st": 18,
                                                                            "t": 150
                                                                       },
                                                           "Gwingris": {
                                                                            "c": 25,
                                                                            "l": -40,
                                                                            "r": "D1",
                                                                            "s": 35,
                                                                           "st": 38,
                                                                            "t": 543
                                                                       },
                                                           "Hrimbarg": {
                                                                            "s": 35,
                                                                           "st": 24
                                                                       },
                                               "Inner Caras Galadhon": {
                                                                            "l": 50,
                                                                            "r": "Q3",
                                                                            "s": 45,
                                                                           "st": 17
                                                                       },
                                                            "Lhanuch": {
                                                                            "l": 50,
                                                                            "r": "D6",
                                                                            "s": 45,
                                                                           "st": 27
                                                                       },
                                                         "Ost Guruth": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 26,
                                                                            "t": 609
                                                                       },
                                                         "South Bree": {
                                                                            "l": 40,
                                                                            "s": 25,
                                                                           "st": 28
                                                                       },
                                                          "Suri-kyla": {
                                                                            "l": 40,
                                                                            "r": "R3",
                                                                            "s": 35,
                                                                           "st": 37
                                                                       },
                                                          "Thorenhad": {
                                                                            "c": 25,
                                                                            "s": 25,
                                                                           "st": 15,
                                                                            "t": 405
                                                                       }
                                           },
                                      "l": "29.3s,6.7w",
                                      "r": 1,
                                      "t": 55,
                                     "td": "R7",
                                      "z": "Trollshaws"
                                 },
          "Rohirrim Scout-camp": {
                                      "d": {
                                                 "Barnavon": {
                                                                  "c": 25,
                                                                  "l": -65,
                                                                  "s": 35,
                                                                 "st": 16,
                                                                  "t": 156
                                                             },
                                               "Forthbrond": {
                                                                  "c": 25,
                                                                  "l": -65,
                                                                  "s": 35,
                                                                 "st": 18,
                                                                  "t": 70
                                                             },
                                                  "Galtrev": {
                                                                  "c": 25,
                                                                  "l": -65,
                                                                  "s": 35,
                                                                 "st": 20,
                                                                  "t": 160
                                                             }
                                           },
                                      "l": "80.9s,10.6w",
                                     "ml": 48,
                                      "r": 1,
                                      "t": 1,
                                     "td": "R22",
                                      "z": "Dunland"
                                 },
                     "Rushgore": {
                                      "d": {
                                                   "Brown Lands": {
                                                                       "c": 25,
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 14,
                                                                       "t": 133
                                                                  },
                                               "Parth Celebrant": {
                                                                       "c": 25,
                                                                       "l": -70,
                                                                       "s": 35,
                                                                      "st": 10,
                                                                       "t": 140
                                                                  },
                                                      "Stangard": {
                                                                       "c": 25,
                                                                       "l": -70,
                                                                       "s": 35,
                                                                      "st": 23,
                                                                       "t": 166
                                                                  },
                                                      "Thinglad": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 15
                                                                  },
                                                 "Wailing Hills": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 10
                                                                  }
                                           },
                                      "l": "29.2s,55.2w",
                                     "ml": 50,
                                      "r": 2,
                                      "t": 2,
                                     "td": "R26",
                                      "z": "Great River"
                                 },
              "Shadowed Refuge": {
                                      "a": "Foundations of Stone",
                                      "d": {
                                                      "First Hall": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "s": 45,
                                                                        "st": 57,
                                                                         "t": 344
                                                                    },
                                                   "The Orc-watch": {
                                                                        "c": 35,
                                                                        "l": -45,
                                                                        "t": 182
                                                                    },
                                               "Twenty-first Hall": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "s": 45,
                                                                        "st": 31,
                                                                         "t": 366
                                                                    }
                                           },
                                      "l": "13.1s,101.2w",
                                     "ml": 43,
                                      "r": 2,
                                      "t": 14,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
             "Shire Homesteads": {
                                     "l": "36.4s,72.8w",
                                     "r": 1,
                                     "z": "the Shire"
                                 },
                    "Snowbourn": {
                                      "a": "Sutcrofts",
                                      "d": {
                                                            "Cliving": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 33,
                                                                            "t": 354
                                                                       },
                                                            "Eaworth": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 48,
                                                                            "t": 246
                                                                       },
                                                            "Entwade": {
                                                                            "c": 60,
                                                                            "l": -85,
                                                                            "s": 66,
                                                                           "st": 38,
                                                                            "t": 128
                                                                       },
                                                            "Faldham": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 22,
                                                                            "t": 128
                                                                       },
                                                             "Forlaw": {
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 40
                                                                       },
                                                           "Garsfeld": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 46,
                                                                            "t": 116
                                                                       },
                                                            "Harwick": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 24,
                                                                            "t": 546
                                                                       },
                                                            "Hytbold": {
                                                                            "c": 65,
                                                                            "l": -84,
                                                                            "r": "R30,Q6",
                                                                            "s": 71.5,
                                                                           "st": 34,
                                                                            "t": 200
                                                                       },
                                               "Inner Caras Galadhon": {
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 40
                                                                       },
                                                        "Parth Galen": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 22,
                                                                            "t": 327
                                                                       },
                                                         "South Bree": {
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 42
                                                                       },
                                                           "Stangard": {
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 19
                                                                       },
                                                  "Twenty-first Hall": {
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 40
                                                                       },
                                                            "Walstow": {
                                                                            "c": 60,
                                                                            "l": -75,
                                                                            "s": 66,
                                                                           "st": 14,
                                                                            "t": 143
                                                                       }
                                           },
                                      "l": "60.5s,61.3w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 12,
                                     "td": "R25",
                                      "z": "East Rohan"
                                 },
                   "South Bree": {
                                      "a": "Bree",
                                      "d": {
                                                            "Aldburg": {
                                                                            "l": 85,
                                                                            "s": 71.5,
                                                                           "st": 24
                                                                       },
                                               "Bree-land Homesteads": {
                                                                           "c": 5,
                                                                           "t": 97
                                                                       },
                                                           "Celondim": {
                                                                            "s": 1,
                                                                           "st": 25
                                                                       },
                                                              "Combe": {
                                                                           "c": 1,
                                                                           "t": 90
                                                                       },
                                                             "Forlaw": {
                                                                            "l": 75,
                                                                            "s": 71.5,
                                                                           "st": 19
                                                                       },
                                                            "Galtrev": {
                                                                            "l": 65,
                                                                            "s": 45,
                                                                           "st": 22
                                                                       },
                                                        "Helm's Deep": {
                                                                            "l": 85,
                                                                            "s": 71.5,
                                                                           "st": 19
                                                                       },
                                                            "Lhanuch": {
                                                                            "l": 50,
                                                                            "r": "D6",
                                                                            "s": 45,
                                                                           "st": 28
                                                                       },
                                                     "Michel Delving": {
                                                                            "s": 1,
                                                                           "st": 24
                                                                       },
                                                         "Ost Guruth": {
                                                                            "l": 15,
                                                                            "s": 20,
                                                                           "st": 24
                                                                       },
                                                          "Rivendell": {
                                                                            "l": 40,
                                                                            "s": 35,
                                                                           "st": 21
                                                                       },
                                                          "Snowbourn": {
                                                                            "l": 75,
                                                                            "s": 71.5,
                                                                           "st": 42
                                                                       },
                                                           "Stangard": {
                                                                            "l": 70,
                                                                            "s": 45,
                                                                           "st": 20
                                                                       },
                                                   "The Forsaken Inn": {
                                                                           "c": 5,
                                                                           "t": 190
                                                                       },
                                                      "Thorin's Gate": {
                                                                            "s": 1,
                                                                           "st": 24
                                                                       },
                                                          "West Bree": {
                                                                           "mt": 75,
                                                                            "s": 1,
                                                                           "st": 18
                                                                       }
                                           },
                                      "l": "31.9s,50.4w",
                                      "r": 1,
                                      "t": 8,
                                     "td": "R11",
                                      "z": "Bree-land"
                                 },
                     "Stangard": {
                                      "d": {
                                                        "Brown Lands": {
                                                                            "c": 25,
                                                                            "l": -70,
                                                                            "s": 35,
                                                                           "st": 18,
                                                                            "t": 240
                                                                       },
                                                            "Harwick": {
                                                                            "c": 66,
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 25,
                                                                            "t": 315
                                                                       },
                                               "Inner Caras Galadhon": {
                                                                            "l": 70,
                                                                            "s": 45,
                                                                           "st": 20
                                                                       },
                                                    "Parth Celebrant": {
                                                                            "c": 25,
                                                                            "l": -70,
                                                                            "s": 35,
                                                                           "st": 16,
                                                                            "t": 95
                                                                       },
                                                           "Rushgore": {
                                                                            "c": 25,
                                                                            "l": -70,
                                                                            "s": 35,
                                                                           "st": 23,
                                                                            "t": 166
                                                                       },
                                                          "Snowbourn": {
                                                                            "l": -75,
                                                                            "s": 71.5,
                                                                           "st": 19
                                                                       },
                                                         "South Bree": {
                                                                            "l": 70,
                                                                            "s": 45,
                                                                           "st": 20
                                                                       },
                                                           "Thinglad": {
                                                                            "c": 25,
                                                                            "l": -70,
                                                                            "s": 35,
                                                                           "st": 20,
                                                                            "t": 80
                                                                       },
                                                  "Twenty-first Hall": {
                                                                            "l": 70,
                                                                            "s": 45,
                                                                           "st": 32
                                                                       },
                                                      "Wailing Hills": {
                                                                            "c": 25,
                                                                            "l": -70,
                                                                            "s": 35,
                                                                           "st": 16,
                                                                            "t": 78
                                                                       }
                                           },
                                      "l": "25.6s,62.9w",
                                     "ml": 50,
                                      "r": 2,
                                      "t": 35,
                                     "td": "R26",
                                      "z": "Great River"
                                 },
                        "Stock": {
                                      "d": {
                                               "Brockenborings": {
                                                                     "c": 1,
                                                                     "t": 128
                                                                 },
                                                     "Buckland": {
                                                                     "c": 1,
                                                                     "t": 69
                                                                 },
                                                     "Hobbiton": {
                                                                     "c": 1,
                                                                     "t": 131
                                                                 }
                                           },
                                      "l": "32.1s,64.1w",
                                      "r": 1,
                                     "td": "R10",
                                      "z": "the Shire"
                                 },
                        "Stoke": {
                                      "a": "Broadacres",
                                      "d": {
                                                   "Aldburg": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 26,
                                                                   "t": 492
                                                              },
                                                    "Edoras": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 22,
                                                                   "t": 421
                                                              },
                                               "Helm's Deep": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 23,
                                                                   "t": 547
                                                              },
                                                    "Oserly": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 17,
                                                                   "t": 77
                                                              },
                                                 "Woodhurst": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 18,
                                                                   "t": 200
                                                              }
                                           },
                                      "l": "49.3s,69.6w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 6,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                    "Suri-kyla": {
                                      "d": {
                                               "Gath Forthnir": {
                                                                     "l": 40,
                                                                     "r": "Q1R4",
                                                                     "s": 35,
                                                                    "st": 45
                                                                },
                                                  "Kuru-leiri": {
                                                                     "l": 40,
                                                                     "r": "Q2",
                                                                     "s": 25,
                                                                    "st": 35
                                                                },
                                                   "Ost Forod": {
                                                                     "l": 40,
                                                                     "s": 25,
                                                                    "st": 72
                                                                },
                                                "Pynti-peldot": {
                                                                    "c": 25,
                                                                    "l": 40,
                                                                    "t": 303
                                                                },
                                                   "Rivendell": {
                                                                     "l": 40,
                                                                     "r": "R2",
                                                                     "s": 35,
                                                                    "st": 37
                                                                },
                                                   "West Bree": {
                                                                     "l": 40,
                                                                     "r": "R1",
                                                                     "s": 35,
                                                                    "st": 38
                                                                },
                                                   "Zigilgund": {
                                                                     "c": 25,
                                                                     "l": -40,
                                                                     "r": "R3",
                                                                     "s": 25,
                                                                    "st": 55,
                                                                     "t": 538
                                                                }
                                           },
                                      "l": "19.1n,70.8w",
                                     "ml": 29,
                                      "r": 1,
                                      "t": 4,
                                     "td": "R14",
                                      "z": "Forochel"
                                 },
           "Tal Methedras Gate": {
                                      "d": {
                                               "Galtrev": {
                                                               "c": 25,
                                                               "l": -65,
                                                               "s": 35,
                                                              "st": 21,
                                                               "t": 112
                                                          }
                                           },
                                      "l": "78.3s,11.2w",
                                     "ml": 48,
                                      "r": 1,
                                      "t": 32,
                                     "td": "R20",
                                      "z": "Dunland"
                                 },
                   "Thangulhad": {
                                      "d": {
                                                  "Echad Sirion": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "s": 35,
                                                                      "st": 31,
                                                                       "t": 340
                                                                  },
                                               "Estolad Mernael": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 27,
                                                                       "t": 280
                                                                  },
                                                      "Helethir": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 26,
                                                                       "t": 82
                                                                  },
                                                     "Mithechad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 26,
                                                                       "t": 230
                                                                  },
                                                    "Ost Galadh": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 36,
                                                                       "t": 148
                                                                  },
                                               "The Haunted Inn": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D16",
                                                                       "s": 35,
                                                                      "st": 40,
                                                                       "t": 274
                                                                  }
                                           },
                                      "l": "12.8s,46.1w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 6,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                "Tharakh Bazan": {
                                      "a": "Durin's Way",
                                      "d": {
                                               "Twenty-first Hall": {
                                                                         "l": -45,
                                                                         "s": 35,
                                                                        "st": 14
                                                                    }
                                           },
                                      "l": "3.2s,108.6w",
                                      "r": 2,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
             "The Deep Descent": {
                                      "a": "the Silvertine Lodes",
                                      "d": {
                                                      "Dolven-view": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 34
                                                                     },
                                                "Durin's Threshold": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 148
                                                                     },
                                               "The Rotting Cellar": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 180
                                                                     }
                                           },
                                      "l": "9.8s,112.5w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 8,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
        "The Eavespires - Boat": {
                                     "d": {
                                               "Men Erain - Boat": {
                                                                       "c": 25,
                                                                       "t": 6
                                                                   },
                                                "Tinnudir - Boat": {
                                                                       "c": 25,
                                                                       "t": 6
                                                                   },
                                              "Tyl Ruinen - Boat": {
                                                                       "c": 25,
                                                                       "t": 6
                                                                   }
                                          },
                                     "l": "6.0s,71.8w",
                                     "r": -1,
                                     "z": "Evendim"
                                 },
               "The Fanged Pit": {
                                      "a": "Durin's Way",
                                      "d": {
                                               "Twenty-first Hall": {
                                                                         "l": -45,
                                                                         "s": 35,
                                                                        "st": 13
                                                                    }
                                           },
                                      "l": "3.5s,103.3w",
                                     "ml": 42,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
             "The Forsaken Inn": {
                                     "d": {
                                              "Ost Guruth": {
                                                                "c": 15,
                                                                "t": 203
                                                            },
                                              "South Bree": {
                                                                "c": 5,
                                                                "t": 190
                                                            }
                                          },
                                     "l": "34.4s,40.6w",
                                     "r": 1,
                                     "t": 12,
                                     "z": "Lone-lands"
                                 },
              "The Haunted Inn": {
                                      "d": {
                                                  "Echad Sirion": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "s": 35,
                                                                      "st": 28,
                                                                       "t": 110
                                                                  },
                                               "Estolad Mernael": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 30,
                                                                       "t": 150
                                                                  },
                                                      "Helethir": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 30,
                                                                       "t": 330
                                                                  },
                                                     "Mithechad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 27,
                                                                       "t": 214
                                                                  },
                                                    "Ost Galadh": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D17",
                                                                       "s": 35,
                                                                      "st": 35,
                                                                       "t": 126
                                                                  },
                                                    "Thangulhad": {
                                                                       "c": 25,
                                                                       "l": -50,
                                                                       "r": "D18",
                                                                       "s": 35,
                                                                      "st": 40,
                                                                       "t": 274
                                                                  }
                                           },
                                      "l": "13.4s,56.2w",
                                     "ml": 37,
                                      "r": 2,
                                      "t": 5,
                                     "td": "R19",
                                      "z": "Mirkwood"
                                 },
                "The Orc-watch": {
                                      "a": "Redhorn Lodes",
                                      "d": {
                                                     "Anazarmekhem": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 83
                                                                     },
                                                      "Dolven-view": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 436
                                                                     },
                                                  "Shadowed Refuge": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 182
                                                                     },
                                               "The Rotting Cellar": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 244
                                                                     },
                                                "Twenty-first Hall": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 306
                                                                     }
                                           },
                                      "l": "11.1s,106.9w",
                                     "ml": 39,
                                      "r": 2,
                                      "t": 9,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
           "The Rotting Cellar": {
                                      "a": "the Water-works",
                                      "d": {
                                                   "Anazarmekhem": {
                                                                       "c": 35,
                                                                       "l": -45,
                                                                       "t": 164
                                                                   },
                                               "The Deep Descent": {
                                                                       "c": 35,
                                                                       "l": -45,
                                                                       "t": 180
                                                                   },
                                                  "The Orc-watch": {
                                                                       "c": 35,
                                                                       "l": -45,
                                                                       "t": 244
                                                                   },
                                                   "The Vile Maw": {
                                                                       "c": 35,
                                                                       "l": -45,
                                                                       "t": 148
                                                                   }
                                           },
                                      "l": "15.1s,111.9w",
                                     "ml": 39,
                                      "r": 2,
                                      "t": 4,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
                 "The Vile Maw": {
                                      "a": "the Silvertine Lodes",
                                      "d": {
                                               "The Rotting Cellar": {
                                                                         "c": 35,
                                                                         "l": -45,
                                                                         "t": 148
                                                                     }
                                           },
                                      "l": "17.6s,116.9w",
                                      "r": 2,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
       "The Vinyards of Lorien": {
                                      "d": {
                                               "Caras Galadhon": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D14",
                                                                      "s": 35,
                                                                     "st": 12,
                                                                      "t": 68
                                                                 },
                                                 "Cerin Amroth": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D14",
                                                                      "s": 35,
                                                                     "st": 14,
                                                                      "t": 190
                                                                 },
                                               "Echad Andestel": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "r": "D13",
                                                                      "s": 35,
                                                                     "st": 24,
                                                                      "t": 182
                                                                 },
                                                 "Echad Sirion": {
                                                                     "mt": 50
                                                                 },
                                                 "Mekhem-bizru": {
                                                                      "c": 25,
                                                                      "l": -50,
                                                                      "s": 35,
                                                                     "st": 12,
                                                                      "t": 278
                                                                 },
                                                     "Thinglad": {
                                                                      "c": 25,
                                                                      "l": 70,
                                                                      "s": 35,
                                                                     "st": 20,
                                                                      "t": 70
                                                                 }
                                           },
                                      "l": "18.3s,64.2w",
                                     "ml": 39,
                                      "r": 2,
                                      "t": 31,
                                     "td": "R8",
                                      "z": "Lothlorien"
                                 },
                     "Thinglad": {
                                      "d": {
                                                          "Brown Lands": {
                                                                              "l": 70,
                                                                              "s": 35,
                                                                             "st": 20
                                                                         },
                                                      "Parth Celebrant": {
                                                                              "l": 70,
                                                                              "s": 35,
                                                                             "st": 20
                                                                         },
                                                             "Rushgore": {
                                                                              "l": 70,
                                                                              "s": 35,
                                                                             "st": 15
                                                                         },
                                                             "Stangard": {
                                                                              "c": 25,
                                                                              "l": -70,
                                                                              "s": 35,
                                                                             "st": 20,
                                                                              "t": 80
                                                                         },
                                               "The Vinyards of Lorien": {
                                                                              "c": 25,
                                                                              "l": -70,
                                                                              "s": 35,
                                                                             "st": 20,
                                                                              "t": 70
                                                                         },
                                                        "Wailing Hills": {
                                                                              "l": 70,
                                                                              "s": 35,
                                                                             "st": 13
                                                                         }
                                           },
                                      "l": "21.4s,63.4w",
                                     "ml": 50,
                                      "r": 2,
                                      "t": 2,
                                     "td": "R8",
                                      "z": "Great River"
                                 },
                    "Thorenhad": {
                                      "d": {
                                                "Barachen's Camp": {
                                                                        "s": 25,
                                                                       "st": 23
                                                                   },
                                               "Echad Candelleth": {
                                                                        "c": 15,
                                                                        "l": 35,
                                                                        "s": 25,
                                                                       "st": 22,
                                                                        "t": 207
                                                                   },
                                                   "Nan Tornaeth": {
                                                                        "s": 25,
                                                                       "st": 13
                                                                   },
                                                     "Ost Guruth": {
                                                                       "c": 25,
                                                                       "t": 310
                                                                   },
                                                      "Rivendell": {
                                                                        "c": 15,
                                                                        "s": 25,
                                                                       "st": 15,
                                                                        "t": 405
                                                                   }
                                           },
                                      "l": "31.7s,15.0w",
                                     "ml": 15,
                                      "r": 1,
                                      "t": 1,
                                     "td": "R7",
                                      "z": "Trollshaws"
                                 },
                "Thorin's Gate": {
                                      "a": "Thorin's Gate",
                                      "d": {
                                                     "Celondim": {
                                                                     "S0": true,
                                                                      "s": 1,
                                                                     "st": 24
                                                                 },
                                                        "Combe": {
                                                                      "s": 1,
                                                                     "st": 24
                                                                 },
                                                     "Duillond": {
                                                                     "c": 1,
                                                                     "t": 307
                                                                 },
                                                   "Ettenmoors": {
                                                                      "l": 40,
                                                                      "r": "s1",
                                                                      "s": 1,
                                                                     "st": 30
                                                                 },
                                                     "Gondamon": {
                                                                     "c": 1,
                                                                     "t": 180
                                                                 },
                                               "Michel Delving": {
                                                                     "S0": true,
                                                                      "s": 1,
                                                                     "st": 24
                                                                 },
                                                      "Noglond": {
                                                                     "c": 1,
                                                                     "t": 114
                                                                 },
                                                    "West Bree": {
                                                                     "S0": true,
                                                                      "s": 1,
                                                                     "st": 28
                                                                 }
                                           },
                                      "l": "15.0s,103.6w",
                                      "r": 1,
                                      "t": 41,
                                     "td": "R9",
                                      "z": "Ered Luin"
                                 },
                    "Thornhope": {
                                      "a": "Entwash Vale",
                                      "d": {
                                               "Eaworth": {
                                                               "c": 60,
                                                               "l": -75,
                                                               "s": 66,
                                                              "st": 27,
                                                               "t": 117
                                                          }
                                           },
                                      "l": "47.7s,63.6w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 0,
                                     "td": "R27",
                                      "z": "East Rohan"
                                 },
               "Thrasi's Lodge": {
                                     "d": {
                                              "Duillond": {
                                                              "c": 1,
                                                              "t": 84
                                                          },
                                              "Gondamon": {
                                                              "c": 1,
                                                              "t": 90
                                                          }
                                          },
                                     "l": "21.6s,94.1w",
                                     "r": 1,
                                     "z": "Ered Luin"
                                 },
                     "Tinnudir": {
                                      "d": {
                                                          "Annuminas": {
                                                                            "l": 35,
                                                                            "r": "R6",
                                                                            "s": 20,
                                                                           "st": 40
                                                                       },
                                                            "Dwaling": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 32,
                                                                            "t": 288
                                                                       },
                                                           "Esteldin": {
                                                                            "c": 15,
                                                                            "l": 30,
                                                                            "s": 35,
                                                                           "st": 50,
                                                                            "t": 510
                                                                       },
                                               "High King's Crossing": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 31,
                                                                            "t": 118
                                                                       },
                                                     "Michel Delving": {
                                                                            "s": 35,
                                                                           "st": 38
                                                                       },
                                                          "Oatbarton": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 32,
                                                                            "t": 358
                                                                       },
                                                          "Ost Forod": {
                                                                            "c": 15,
                                                                            "s": 25,
                                                                           "st": 41,
                                                                            "t": 111
                                                                       },
                                                    "Tinnudir - Boat": {
                                                                           "m": 15
                                                                       },
                                                      "Trestlebridge": {
                                                                           "c": 15,
                                                                           "t": 363
                                                                       },
                                                          "West Bree": {
                                                                            "s": 35,
                                                                           "st": 40
                                                                       }
                                           },
                                      "l": "12.4s,67.2w",
                                     "ml": 15,
                                      "r": 1,
                                      "t": 10,
                                     "td": "R6",
                                      "z": "Evendim"
                                 },
              "Tinnudir - Boat": {
                                      "d": {
                                                    "Men Erain - Boat": {
                                                                            "c": 25,
                                                                            "t": 4
                                                                        },
                                               "The Eavespires - Boat": {
                                                                            "c": 25,
                                                                            "t": 6
                                                                        },
                                                            "Tinnudir": {
                                                                            "m": 15
                                                                        },
                                                   "Tyl Ruinen - Boat": {
                                                                            "c": 25,
                                                                            "t": 6
                                                                        }
                                           },
                                      "l": "12.6s,67.5w",
                                      "r": -1,
                                     "td": "R6",
                                      "z": "Evendim"
                                 },
                "Trestlebridge": {
                                      "d": {
                                                    "Amon Raith": {
                                                                      "c": 15,
                                                                      "t": 142
                                                                  },
                                                      "Esteldin": {
                                                                      "c": 15,
                                                                      "t": 320
                                                                  },
                                               "Hengstacer Farm": {
                                                                      "c": 1,
                                                                      "t": 160
                                                                  },
                                                     "Ost Forod": {
                                                                      "c": 15,
                                                                      "t": 373
                                                                  },
                                                      "Tinnudir": {
                                                                      "c": 15,
                                                                      "t": 363
                                                                  },
                                                     "West Bree": {
                                                                      "c": 15,
                                                                      "t": 209
                                                                  }
                                           },
                                      "l": "18.0s,53.6w",
                                      "r": 1,
                                      "t": 3,
                                     "td": "R12",
                                      "z": "North Downs"
                                 },
            "Twenty-first Hall": {
                                      "a": "Zelem-melek",
                                      "d": {
                                                                 "Aldburg": {
                                                                                 "l": 85,
                                                                                 "s": 71.5,
                                                                                "st": 28
                                                                            },
                                                            "Anazarmekhem": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 306
                                                                            },
                                               "Chamber of the Crossroads": {
                                                                                 "c": 35,
                                                                                 "l": -45,
                                                                                 "r": "Q5",
                                                                                 "s": 35,
                                                                                "st": 20,
                                                                                 "t": 190
                                                                            },
                                                             "Dolven-view": {
                                                                                 "c": 35,
                                                                                 "l": -45,
                                                                                 "s": 45,
                                                                                "st": 15,
                                                                                 "t": 254
                                                                            },
                                                              "First Hall": {
                                                                                 "c": 35,
                                                                                 "l": -45,
                                                                                 "s": 45,
                                                                                "st": 46,
                                                                                 "t": 345
                                                                            },
                                                                  "Forlaw": {
                                                                                 "l": 75,
                                                                                 "s": 71.5,
                                                                                "st": 18
                                                                            },
                                                                 "Galtrev": {
                                                                                 "l": 65,
                                                                                 "s": 45,
                                                                                "st": 20
                                                                            },
                                                             "Helm's Deep": {
                                                                                 "l": 85,
                                                                                 "s": 71.5,
                                                                                "st": 23
                                                                            },
                                                    "Inner Caras Galadhon": {
                                                                                 "l": 50,
                                                                                 "r": "Q3",
                                                                                 "s": 25,
                                                                                "st": 17
                                                                            },
                                                               "Jazargund": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 48
                                                                            },
                                                         "Shadowed Refuge": {
                                                                                 "c": 35,
                                                                                 "l": -45,
                                                                                 "s": 45,
                                                                                "st": 31,
                                                                                 "t": 366
                                                                            },
                                                               "Snowbourn": {
                                                                                 "l": -75,
                                                                                 "s": 71.5,
                                                                                "st": 40
                                                                            },
                                                                "Stangard": {
                                                                                 "l": 70,
                                                                                 "s": 45,
                                                                                "st": 32
                                                                            },
                                                           "Tharakh Bazan": {
                                                                                 "l": 45,
                                                                                 "s": 35,
                                                                                "st": 14
                                                                            },
                                                          "The Fanged Pit": {
                                                                                 "l": 45,
                                                                                 "s": 35,
                                                                                "st": 13
                                                                            },
                                                           "The Orc-watch": {
                                                                                "c": 35,
                                                                                "l": -45,
                                                                                "t": 306
                                                                            }
                                           },
                                      "l": "5.7s,105.3w",
                                     "ml": 39,
                                      "r": 2,
                                      "t": 5,
                                     "td": "R17",
                                      "z": "Moria"
                                 },
            "Tyl Ruinen - Boat": {
                                      "d": {
                                                    "Men Erain - Boat": {
                                                                            "c": 25,
                                                                            "t": 4
                                                                        },
                                               "The Eavespires - Boat": {
                                                                            "c": 25,
                                                                            "t": 6
                                                                        },
                                                     "Tinnudir - Boat": {
                                                                            "c": 25,
                                                                            "t": 6
                                                                        }
                                           },
                                      "l": "12.9s,70.7w",
                                      "r": -1,
                                     "td": "R6",
                                      "z": "Evendim"
                                 },
                  "Underharrow": {
                                      "a": "Kingstead",
                                      "d": {
                                                   "Edoras": {
                                                                  "c": 60,
                                                                  "l": -85,
                                                                  "s": 66,
                                                                 "st": 20,
                                                                  "t": 143
                                                             },
                                                  "Entwade": {
                                                                  "c": 60,
                                                                  "l": -85,
                                                                  "s": 66,
                                                                 "st": 23,
                                                                  "t": 354
                                                             },
                                               "Middlemead": {
                                                                  "c": 60,
                                                                  "l": -85,
                                                                  "s": 66,
                                                                 "st": 18,
                                                                  "t": 463
                                                             }
                                           },
                                      "l": "67.3s,73.7w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R33",
                                      "z": "West Rohan"
                                 },
                    "Vindurhal": {
                                      "d": {
                                               "Gloin's Camp": {
                                                                    "s": 25,
                                                                   "st": 15
                                                               },
                                                  "High Crag": {
                                                                    "s": 25,
                                                                   "st": 11
                                                               },
                                                   "Hrimbarg": {
                                                                    "s": 25,
                                                                   "st": 11
                                                               }
                                           },
                                      "l": "23.3s,4.3e",
                                     "ml": 25,
                                      "r": 1,
                                      "t": 2,
                                      "z": "Misty Mountains"
                                 },
                "Wailing Hills": {
                                      "d": {
                                                   "Brown Lands": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 11
                                                                  },
                                               "Parth Celebrant": {
                                                                       "c": 25,
                                                                       "l": -70,
                                                                       "s": 35,
                                                                      "st": 10,
                                                                       "t": 172
                                                                  },
                                                      "Rushgore": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 10
                                                                  },
                                                      "Stangard": {
                                                                       "c": 25,
                                                                       "l": -70,
                                                                       "s": 35,
                                                                      "st": 16,
                                                                       "t": 78
                                                                  },
                                                      "Thinglad": {
                                                                       "l": 70,
                                                                       "s": 35,
                                                                      "st": 13
                                                                  }
                                           },
                                      "l": "25.6s,67.0w",
                                      "r": 2,
                                     "td": "R26",
                                      "z": "Great River"
                                 },
                      "Walstow": {
                                      "a": "Sutcrofts",
                                      "d": {
                                                   "Faldham": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 20,
                                                                   "t": 146
                                                              },
                                                  "Garsfeld": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 24,
                                                                   "t": 288
                                                              },
                                                   "Hytbold": {
                                                                   "c": 65,
                                                                   "l": -84,
                                                                   "r": "R30,Q6",
                                                                   "s": 71.5,
                                                                  "st": 34,
                                                                   "t": 120
                                                              },
                                               "Parth Galen": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 19,
                                                                   "t": 194
                                                              },
                                                 "Snowbourn": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 14,
                                                                   "t": 143
                                                              }
                                           },
                                      "l": "61.9s,54.4w",
                                     "ml": 60,
                                      "r": 2,
                                      "t": 20,
                                     "td": "R25",
                                      "z": "East Rohan"
                                 },
                    "West Bree": {
                                      "a": "Bree",
                                      "d": {
                                                   "Adso's Camp": {
                                                                      "c": 1,
                                                                      "t": 67
                                                                  },
                                                      "Buckland": {
                                                                      "c": 1,
                                                                      "t": 211
                                                                  },
                                                      "Celondim": {
                                                                      "S0": true,
                                                                       "s": 1,
                                                                      "st": 20
                                                                  },
                                                      "Esteldin": {
                                                                       "l": 30,
                                                                       "s": 35,
                                                                      "st": 33
                                                                  },
                                               "Hengstacer Farm": {
                                                                      "c": 1,
                                                                      "t": 160
                                                                  },
                                                      "Hobbiton": {
                                                                      "c": 5,
                                                                      "t": 337
                                                                  },
                                                "Michel Delving": {
                                                                      "S0": true,
                                                                       "s": 1,
                                                                      "st": 22
                                                                  },
                                                     "Ost Forod": {
                                                                       "l": 30,
                                                                       "s": 35,
                                                                      "st": 36
                                                                  },
                                                    "South Bree": {
                                                                      "mt": 75,
                                                                       "s": 1,
                                                                      "st": 18
                                                                  },
                                                     "Suri-kyla": {
                                                                       "l": 40,
                                                                       "r": "R3",
                                                                       "s": 35,
                                                                      "st": 39
                                                                  },
                                                 "Thorin's Gate": {
                                                                      "S0": true,
                                                                       "s": 1,
                                                                      "st": 28
                                                                  },
                                                      "Tinnudir": {
                                                                       "s": 35,
                                                                      "st": 40
                                                                  },
                                                 "Trestlebridge": {
                                                                      "c": 5,
                                                                      "t": 209
                                                                  }
                                           },
                                      "l": "29.5s,52.6w",
                                      "r": 1,
                                      "t": 31,
                                     "td": "R11",
                                      "z": "Bree-land"
                                 },
                    "Whitshaws": {
                                      "d": {
                                                  "Balewood": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 20,
                                                                   "t": 160
                                                              },
                                                    "Forlaw": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 13,
                                                                   "t": 125
                                                              },
                                               "High Knolls": {
                                                                   "c": 60,
                                                                   "l": -75,
                                                                   "s": 66,
                                                                  "st": 12,
                                                                   "t": 160
                                                              }
                                           },
                                      "l": "38.7s,67.2w",
                                      "n": "Dunfast's Refugees",
                                      "r": 2,
                                     "td": "R32",
                                      "z": "Wildermore"
                                 },
                    "Woodhurst": {
                                      "a": "Stonedeans",
                                      "d": {
                                                   "Aldburg": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 21,
                                                                   "t": 572
                                                              },
                                               "Brockbridge": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 17,
                                                                   "t": 62
                                                              },
                                                    "Edoras": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 19,
                                                                   "t": 337
                                                              },
                                                   "Gapholt": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 19,
                                                                   "t": 150
                                                              },
                                               "Helm's Deep": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 15,
                                                                   "t": 285
                                                              },
                                                     "Stoke": {
                                                                   "c": 60,
                                                                   "l": -85,
                                                                   "s": 66,
                                                                  "st": 18,
                                                                   "t": 200
                                                              }
                                           },
                                      "l": "47.6s,79.1w",
                                     "ml": 70,
                                      "r": 2,
                                      "t": 1,
                                     "td": "R34",
                                      "z": "West Rohan"
                                 },
                 "Writhendowns": {
                                      "d": {
                                                "Forlaw": {
                                                               "c": 60,
                                                               "l": -75,
                                                               "s": 66,
                                                              "st": 15,
                                                               "t": 142
                                                          },
                                               "Harwick": {
                                                               "c": 60,
                                                               "l": -75,
                                                               "s": 71.5,
                                                              "st": 22,
                                                               "t": 221
                                                          }
                                           },
                                      "l": "33.7s,60.2w",
                                     "ml": 70,
                                      "n": "Scylfig",
                                      "r": 2,
                                      "t": 5,
                                      "z": "Wildermore"
                                 },
        "Wulf's Cleft Overlook": {
                                     "d": {
                                              "Barnavon": {
                                                               "l": 65,
                                                               "s": 0,
                                                              "st": 12
                                                          }
                                          },
                                     "l": "87.7s,16.2w",
                                     "r": 1,
                                     "z": "Gap of Rohan"
                                 },
                    "Zigilgund": {
                                      "d": {
                                               "Pynti-peldot": {
                                                                   "c": 25,
                                                                   "l": 40,
                                                                   "t": 248
                                                               },
                                                  "Suri-kyla": {
                                                                    "c": 25,
                                                                    "l": -40,
                                                                    "r": "R3",
                                                                    "s": 25,
                                                                   "st": 55,
                                                                    "t": 538
                                                               }
                                           },
                                      "l": "9.6n,81.1w",
                                      "r": 1,
                                      "t": 9,
                                     "td": "R14",
                                      "z": "Forochel"
                                 },
                   "Zirakzigil": {
                                      "a": "Durin's Way",
                                      "d": {
                                               "Jazargund": {
                                                                "c": 35,
                                                                "l": -45,
                                                                "t": 98
                                                            }
                                           },
                                      "l": "2.9s,110.8w",
                                      "r": 2,
                                     "td": "R17",
                                      "z": "Moria"
                                 }
}

},{}],3:[function(_dereq_,module,exports){
/******************************************************************************
 * Created 2008-08-19.
 *
 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
 *
 * Copyright (C) 2008
 *   Wyatt Baldwin <self@wyattbaldwin.com>
 *   All rights reserved
 *
 * Licensed under the MIT license.
 *
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *****************************************************************************/
var dijkstra = {
  single_source_shortest_paths: function(graph, s, d) {
    // Predecessor map for each node that has been encountered.
    // node ID => predecessor node ID
    var predecessors = {};

    // Costs of shortest paths from s to all nodes encountered.
    // node ID => cost
    var costs = {};
    costs[s] = 0;

    // Costs of shortest paths from s to all nodes encountered; differs from
    // `costs` in that it provides easy access to the node that currently has
    // the known shortest path from s.
    // XXX: Do we actually need both `costs` and `open`?
    var open = dijkstra.PriorityQueue.make();
    open.push(s, 0);

    var closest,
        u, v,
        cost_of_s_to_u,
        adjacent_nodes,
        cost_of_e,
        cost_of_s_to_u_plus_cost_of_e,
        cost_of_s_to_v,
        first_visit;
    while (!open.empty()) {
      // In the nodes remaining in graph that have a known cost from s,
      // find the node, u, that currently has the shortest path from s.
      closest = open.pop();
      u = closest.value;
      cost_of_s_to_u = closest.cost;

      // Get nodes adjacent to u...
      adjacent_nodes = graph[u] || {};

      // ...and explore the edges that connect u to those nodes, updating
      // the cost of the shortest paths to any or all of those nodes as
      // necessary. v is the node across the current edge from u.
      for (v in adjacent_nodes) {
        // Get the cost of the edge running from u to v.
        cost_of_e = adjacent_nodes[v];

        // Cost of s to u plus the cost of u to v across e--this is *a*
        // cost from s to v that may or may not be less than the current
        // known cost to v.
        cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

        // If we haven't visited v yet OR if the current known cost from s to
        // v is greater than the new cost we just found (cost of s to u plus
        // cost of u to v across e), update v's cost in the cost list and
        // update v's predecessor in the predecessor list (it's now u).
        cost_of_s_to_v = costs[v];
        first_visit = (typeof costs[v] === 'undefined');
        if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
          costs[v] = cost_of_s_to_u_plus_cost_of_e;
          open.push(v, cost_of_s_to_u_plus_cost_of_e);
          predecessors[v] = u;
        }
      }
    }

    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
      throw new Error(msg);
    }

    return predecessors;
  },

  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
    var nodes = [];
    var u = d;
    var predecessor;
    while (u) {
      nodes.push(u);
      predecessor = predecessors[u];
      u = predecessors[u];
    }
    nodes.reverse();
    return nodes;
  },

  find_path: function(graph, s, d) {
    var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
    return dijkstra.extract_shortest_path_from_predecessor_list(
      predecessors, d);
  },

  /**
   * A very naive priority queue implementation.
   */
  PriorityQueue: {
    make: function (opts) {
      var T = dijkstra.PriorityQueue,
          t = {},
          opts = opts || {},
          key;
      for (key in T) {
        t[key] = T[key];
      }
      t.queue = [];
      t.sorter = opts.sorter || T.default_sorter;
      return t;
    },

    default_sorter: function (a, b) {
      return a.cost - b.cost;
    },

    /**
     * Add a new item to the queue and ensure the highest priority element
     * is at the front of the queue.
     */
    push: function (value, cost) {
      var item = {value: value, cost: cost};
      this.queue.push(item);
      this.queue.sort(this.sorter);
    },

    /**
     * Return the highest priority element in the queue.
     */
    pop: function () {
      return this.queue.shift();
    },

    empty: function () {
      return this.queue.length === 0;
    }
  }
};


// node.js module exports
if (typeof module !== 'undefined') {
  module.exports = dijkstra;
}

},{}]},{},[1])
(1)
});