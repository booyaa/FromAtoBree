/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/
var test = require('tape').test;


// for path finding tests
var fatb = require('../lib/fromatobree');

var start = "Ost Galadh";
var finish = "Mekhem-bizru";

// test("find a route,but with level reqs, but not quest reqs met", function(t) {
//   var options = fatb.setup({level: 50});
//   fatb.graph = fatb.createGraph(true);
// 
//   t.deepEquals(fatb.FindPath(start,finish), ["Ost Galadh", "Mekhem-bizru"]);
//   t.end();
// });

test("fail to find a route with level reqs, but not quest reqs met", function(t) {
  var options = fatb.setup({level: 50});
  fatb.graph = fatb.createGraph(true);
  t.throws(fatb.FindPath(start,finish), "Error: Could not find a path from Ost Galadh to Mekhem-bizru");
  t.end();
});


test("find a route,but with both level and quest reqs met", function(t) {
  var options = fatb.setup({level: 50, standing: ["Q3"]});
  fatb.graph = fatb.createGraph(true);

  t.deepEquals(fatb.FindPath(start,finish), ["Ost Galadh", "Echad Sirion", "The Vinyards of Lorien", "Mekhem-bizru"]);
  t.end();
});


// test("create graph with options, but standing reqs met", function(t) {
//   var options = fatb.setup({standing: ["R28","Q6"]});
//   var graph = fatb.createGraph(true);
// 
//   t.equal(graph["Harwick"]["Hytbold"], 1);
//   t.end();
// });
