/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/
var test = require('tape').test;


// for path finding tests
var fatb = require('../lib/fromatobree');

var start = "Ost Galadh";
var finish = "Mekhem-bizru";


// doesn't work
test("fail to find a route with level reqs, but not quest reqs met", function(t) {
  var options = fatb.setup({level: 10});
  fatb.graph = fatb.createGraph(true);
  // t.throws(fatb.FindPath(start,finish), "Error: Could not find a path from Ost Galadh to Mekhem-bizru");
  t.deepEquals(fatb.FindPath(start,finish), []);
  t.end();
});

test("find a route with both level and quest reqs met", function(t) {
  var options = fatb.setup({level: 50, standing: ["Q3"]});
  fatb.graph = fatb.createGraph(true);

  t.deepEquals(fatb.FindPath(start,finish), ["Ost Galadh", "Echad Sirion", "The Vinyards of Lorien", "Mekhem-bizru"]);
  t.end();
});

test("find a route from Hobbiton to Suri-kyla (standing)", function(t) {
  var options = fatb.setup({level: 40, standing: "R3"});
  fatb.graph = fatb.createGraph(true);

  var start = "Hobbiton";
  var finish = "Suri-kyla";

  t.deepEquals(fatb.FindPath(start, finish), [start, 'West Bree', finish]);
  t.end();
});

test("find a longer route from Hobbiton to Suri-kyla (no standing)", function(t) {
  fatb.setup({}); //FIXME: new instances of object, unless you want duff routes
  fatb.graph = fatb.createGraph(true);

  var start = "Hobbiton";
  var finish = "Suri-kyla";

  t.deepEquals(fatb.FindPath(start, finish), [start, "West Bree", "Ost Forod", "Kauppa-kohta", "Pynti-peldot", finish]);
  t.end();
});

// test case for tape.throws not working
// function thrower() { console.log('asdsad'); throw new Error("This is a test"); }
// 
// test("Error test throw", function(t) {
//   t.throws(thrower(), "Error: This is a test");
//   t.end();
// });

// test("fail to find aroute from ost guruth to the twenty first hall", function(t) {
//   var options = fatb.setup({level: 30});
//   fatb.graph = fatb.createGraph(true);
// 
//   var start = fatb.GetPlace("Ost Gur")[0];
//   var finish = fatb.GetPlace("Twenty")[0];
// 
//   var path = fatb.FindPath(start, finish);
//   t.throws(path , "Error: No path found from " + start + " to " + finish + " because you have not met the minimum requirements.");
//   t.equals(typeof(path), []);
//   t.end();
// });

