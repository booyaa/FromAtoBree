/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/

// testing non-path finding functionality
var test = require('tape').test;
var FATB = require('../lib/fromatobree');

// currently broken...
// var fatb = require('../lib/fromatobree');
// fatb.setup();
// fatb.createGraph();

var fatb = new FATB({weighting: true, level: 65});
test("find places that start with thor with weighting", function(t) {
  t.deepEquals(fatb.GetPlace("thor"), ["Thorenhad", "Thorin's Gate", "Thornhope"]);
  t.end();
});

fatb = new FATB();
test("find places that start with thor w/o weighting (same applies for remaining", function(t) {
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

