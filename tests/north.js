/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/
var test = require('tape').test;

var FATB = require('../lib/fromatobree'); 

// for cost and time testing

test("Get metadata object for path", function(t) {
  var start = "Needlehole";
  var finish = "Ost Guruth";
  var fatb = new FATB({weighting:true, level:10});
  var route = fatb.FindPath(start, finish);
  var metadata = fatb.GetPathCostObject(route);
  var expected = {
    Hobbiton            : { c: 1, t: 166 }
    ,Needlehole         : {}
    ,'West Bree'        : { c: 5, t: 337 }
    ,'South Bree'       : { mt: 75, s: 1, st: 18 }
    ,'The Forsaken Inn' : { c: 5, t: 190 }
    ,'Ost Guruth'       : { c:15, t: 203 }
  };
  t.deepEquals(metadata, expected, "Should return a path cost object based on not meeting reqs");

  fatb = new FATB({weighting:true, level:15});
  route = fatb.FindPath(start, finish);
  metadata = fatb.GetPathCostObject(route);
  expected = {
    Hobbiton            : { c: 1, t: 166 }
    ,Needlehole         : {}
    ,'West Bree'        : { c: 5, t: 337 }
    ,'South Bree'       : { mt: 75, s: 1, st: 18 }
    ,'Ost Guruth'       : { l:15, s: 20, st: 24 }
  };
  t.deepEquals(metadata, expected, "Should return a path cost object based on meeting reqs");
  
  t.end();

});
test("Level requirement test", function(t) {
  var start = "Needlehole";
  var finish = "Ost Guruth";
  var fatb = new FATB({weighting:true, level:10});
  var route = fatb.FindPath(start, finish);
  t.deepEquals(route, [start, "Hobbiton", "West Bree", "South Bree", "The Forsaken Inn", finish], "requirements not met route");
  t.equals(fatb.GetTotalCost(route), 27, "should be 27 silver pieces.");
  t.equals(fatb.GetTotalTime(route), 914, "914 seconds.");

  fatb = new FATB({weighting:true, level:15});
  route = fatb.FindPath(start, finish);
  t.deepEquals(fatb.FindPath(start, finish), [start, "Hobbiton", "West Bree", "South Bree", finish], "requirements met route");
  t.equals(fatb.GetTotalCost(route), 27, "should be 27 silver pieces.");
  t.equals(fatb.GetTotalTime(route), 545, "should take 914 seconds.");
  t.end();
});

test("Standing requirement test", function(t) {
  var start = "Hobbiton";
  var finish = "Suri-kyla";

  var fatb = new FATB({weighting:true, level:40});
  var route = fatb.FindPath(start, finish);

  t.deepEquals(route, [start, "West Bree", "Ost Forod", "Kauppa-kohta", "Pynti-peldot", finish], "standing not met route");
  t.equals(fatb.GetTotalCost(route), 140, "should be 140 silver pieces.");
  t.equals(fatb.GetTotalTime(route), 1372, "should take 1372 seconds.");


  fatb = new FATB({weighting:true, level:40, standing: ["R3"]}); // Ally with Lossoth of Forochel
  route = fatb.FindPath(start, finish);
  t.deepEquals(route, [start, "West Bree", finish], "standing met route");
  t.equals(fatb.GetTotalCost(route), 40, "should be 40 silver pieces.");
  t.equals(fatb.GetTotalTime(route), 376, "should take 376 seconds.");
  t.end();
});
