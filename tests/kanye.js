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

test("find a route hobbiton suri kyle", function(t) {
  var graph = fatb.createGraph(true);

  var start = "Hobbiton";
  var finish = "Suri-kyla";

  t.deepEquals(fatb.FindPath(start, finish), [start, "West Bree", "Ost Forod", "Kauppa-kohta", "Pynti-peldot", finish]);
  t.end();
});

test("find a route hobbiton suri kyle", function(t) {
  var options = fatb.setup({level: 50, standing: "R3"});
  fatb.graph = fatb.createGraph(true);

  var start = "Hobbiton";
  var finish = "Suri-kyla";

  t.deepEquals(fatb.FindPath(start, finish), [start, 'West Bree', finish]);
  t.end();
});
// test("fail to find aroute from ost guruth to the twenty first hall", function(t) {
//   var options = fatb.setup({level: 30});
//   fatb.graph = fatb.createGraph(true);
// 
//   var start = fatb.GetPlace("Ost Gur")[0];
//   var finish = fatb.GetPlace("Twenty")[0];
// 
//   t.throws(fatb.FindPath(start, finish), "Error: No path found from Ost Guruth to Twenty-first Hall because you have not met the minimum requirements.");
//   t.end();
// });


// test("create graph with options, but standing reqs met", function(t) {
//   var options = fatb.setup({standing: ["R28","Q6"]});
//   var graph = fatb.createGraph(true);
// 
//   t.equal(graph["Harwick"]["Hytbold"], 1);
//   t.end();
// });
//
//
