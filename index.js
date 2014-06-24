#!/usr/bin/env node

var Locs = {
  "Thorin's Gate" : { t : 41, d : {
    "Gondamon" : { c : 1, t : 180 },
    "Duillond" : { c : 1, t : 307 },
    "Celondim" : { s : 1, st : 24, S0 : true },
    "Michel Delving" : { s : 1, st : 24, S0 : true },
    "West Bree" : { s : 1, st : 28, S0 : true },
    "Ettenmoors" : { s : 1, l : 40, st : 30, r : "s1" },
    "Noglond" : { c : 1, t : 114 },
    "Combe" : { s : 1, st : 24 },
  }, z : "Ered Luin", r : 1, a : "Thorin's Gate", td : "R9", l : "15.0s,103.6w" },

  "Noglond" : { d : {
    "Thorin's Gate" : { c : 1, t : 114 },
    "Gondamon" : { c : 1, t : 84 },
  }, z : "Ered Luin", r : 1, td : "R9", l : "19.4s,100,6w" },

  "Gondamon" : { t : 7, d : {
    "Thorin's Gate" : { c : 1, t : 180 },
    "Duillond" : { c : 1, t : 154 },
    "Noglond" : { c : 1, t : 84 },
    "Thrasi's Lodge" : { c : 1, t : 90 }
  }, z : "Ered Luin", r : 1, l : "21.6s,94.1w" }
};

var traverse = require('traverse');
var paths = traverse.paths(Locs);

console.dir(paths);
// console.dir(Locs);
// 
// var start = "Thorin's Gate";
// var finish = "Thrasi's Lodge";
// var route = [];
// var time;
// var cost;
// var via;
// 
// // searching for location
// // for (var key in Locs) {
// //   console.log(key);
// //   if (start === key) {
// //     console.log("found starting stable: " + key);
// //   } else {
// //     console.log("unknown stable: " + start);
// //   }
// // }
// 
// // finding destination for a given starting point
// // var foundDestination = false;
// // for (var key in Locs[start].d) {
// //   if (finish === key) {
// //     foundDestination = true;
// //   }
// // }
// // 
// // if (foundDestination) { 
// //   console.log("Found destination! " + finish);
// // } else {
// //   console.log("Failed to find viable route to " + finish);
// // }
// //
// for (var destination in Locs) { // destinations
//   console.log("%s connections", destination);
//   if (Locs[destination].hasOwnProperty("d")) {
//     for (var connection in Locs[destination]["d"]) {
//       console.log("\t%s", connection);
//     }
//   }
// }
// 
