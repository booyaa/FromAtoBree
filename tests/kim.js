/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/

// testing non-path finding functionality
var test = require('tape').test;
var FATB = require('../lib/fromatobree');

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

test("Get requirements", function(t) {
  t.equals(Object.keys(fatb.GetRequirements()).length, 56, "The whole dataset should be returned.");
  t.deepEquals(fatb.GetRequirements("frozen"), {Q2: "The Frozen War"}, "Should only return one record");
  var expected = {R1: "Acq. with Men of Bree", R2: "Acq. with Elves of Rivendell",
                  R3: "Acq. with Lossoth of Forochel", R4: "Acq. with Council of the North",
                  R5: "Acq. with Rangers of Esteldin"};
  t.deepEquals(fatb.GetRequirements("acq"), expected, "Return all acquaintance standing reqs.");

  t.deepEquals(fatb.GetRequirements("xyz"), {}, "Return empty object when no match found");

  t.deepEquals(fatb.GetRequirements("Friend with (Men of Dunland|The Eglain)"), {R13: "Friend with The Eglain", R20: "Friend with Men of Dunland"}, "Return list of standing using regex");
  t.end();
});

