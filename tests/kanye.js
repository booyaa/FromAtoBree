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
  { "Thorin's Gate" : {}
    ,'South Bree': { mt: 75, s: 1, st: 18 }
    ,'West Bree': { S0: true, s: 1, st: 28 }
    ,'Galtrev': { l: 65, s: 45, st: 22 }
    ,'Twenty-first Hall': { l: -65, s: 45, st: 20 }
    ,"First Hall" : { c: 35, l: -45, s: 45, st: 46, t: 345 }
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

test("Get list of places in the shire", function(t) {
  var placesByRegion = fatb.GetPlacesByRegion("the Shire");
  t.deepEquals(placesByRegion, ["Brockenborings", "Hobbiton", "Michel Delving", "Needlehole", "Shire Homesteads", "Stock"]);
  t.end();
});

test("Get a list of regions", function(t) {
  var regions = fatb.GetRegions();

  t.deepEquals(regions, ["Angmar","Bree-land","Dunland","East Rohan","Enedwaith","Ered Luin","Eregion","Ettenmoors","Evendim","Forochel","Gap of Rohan","Great River","Lone-lands","Lothlorien","Mirkwood","Misty Mountains","Moria","Nan Curunir","North Downs","Trollshaws","West Rohan","Wildermore","the Shire"]);
  t.end();
});

//TODO: meta data needs to be rejigged
// place : { d : dests contains swift travel data }
// test("Get meta data about place", function(t) {
//   var place = fatb.FATB["Twenty-first Hall"];
//   var metadata = {};
//   metadata["Twenty-first Hall"] = fatb.GetMetaData("Twenty-first Hall");
//   metadata["Suri-kyla"] = fatb.GetMetaData("Suri-kyla");
// 
//   var expected = {
//     "Twenty-first Hall" : {'gps coords': '5.7s,105.3w', 'min level': 39, r: 2, reqs: 'R17', time: 5 },
//     "Suri-kyla" : {}
//   };
// 
//   t.deepEquals(metadata, expected);
//   t.end();
// });

