var test = require('tape').test;

var fatb = require('../lib/fromatobree');

var graph = fatb.FATB;
test("graph is an object", function(t) {
  t.equal(typeof(graph), "object");
  t.end();
});

test("find places that start with thor", function(t) {
  t.deepEquals(fatb.GetPlace("thor"), ["Thorenhad", "Thorin's Gate", "Thornhope"]);
  t.end();
});

test("find a place that starts with south", function(t) {
  t.deepEquals(fatb.GetPlace("south"), ["South Bree"]);
  t.end();
});

test("there should be no place caled xyz", function(t) {
  t.deepEquals(fatb.GetPlace("xyz"), []);
  t.end();
});

var startSearch = "Thorin's Gate";
var finishSearch = "First Hall";
var start = fatb.GetPlace(startSearch)[0];
var finish = fatb.GetPlace(finishSearch)[0];
var route = fatb.FindPath(start, finish);
test("Get route for Thorin's Gate to First Hall", function(t) {
  t.deepEquals(route, ["Thorin's Gate", "West Bree", "South Bree", "Galtrev", "Twenty-first Hall", "First Hall"]);
  t.end();
});

var pathCost = fatb.GetPathCostObject(route);
test("Get cost for route", function(t) {
  t.deepEquals(pathCost, 
  { "start" : "Thorin's Gate"
    ,'via South Bree': { mt: 75, s: 1, st: 18 }
    ,'via West Bree': { S0: true, s: 1, st: 28 }
    ,'via Galtrev': { l: 65, s: 45, st: 22 }
    , 'via Twenty-first Hall': { l: -65, s: 45, st: 20 }
    ,"via First Hall" : { c: 35, l: -45, s: 45, st: 46, t: 345 }
  }); 
  t.end();
});

test("Get total cost for route", function(t) {
  var totalCost = fatb.GetTotalCost(pathCost);
  t.equals(totalCost, 172);
  t.end();
});

test("Get total time for route", function(t) {
  var totalTime = fatb.GetTotalTime(pathCost);
  t.equals(totalTime, 479);
  t.end();
});

