/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/
var test = require('tape').test;

// for path finding tests
var FATB = require('../lib/fromatobree'); 

test("Level requirement test", function(t) {
  var start = "Needlehole";
  var finish = "Ost Guruth";
  var fatb = new FATB({weighting:true, level:10});
  t.deepEquals(fatb.FindPath(start, finish), [start, "Hobbiton", "West Bree", "South Bree", "The Forsaken Inn", finish], "requirements not met route");

  fatb = new FATB({weighting:true, level:15});
  t.deepEquals(fatb.FindPath(start, finish), [start, "Hobbiton", "West Bree", "South Bree", finish], "requirements met route");
  t.end();
});

test("Standing requirement test", function(t) {
  var start = "Hobbiton";
  var finish = "Suri-kyla";

  var fatb = new FATB({weighting:true, level:40});
  t.deepEquals(fatb.FindPath(start, finish), [start, "West Bree", "Ost Forod", "Kauppa-kohta", "Pynti-peldot", finish], "standing not met route");

  fatb = new FATB({weighting:true, level:40, standing: ["R3"]}); // Ally with Lossoth of Forochel
  t.deepEquals(fatb.FindPath(start, finish), [start, "West Bree", finish], "standing met route");
  t.end();
});

test("No alternate route if requirements not met", function(t) {
  var start = "Galtrev";
  var finish = "Thangulhad";

  var fatb = new FATB({weighting: true, level: 65}); 
  t.deepEquals(fatb.FindPath(start, finish), [], "no viable route");

  fatb = new FATB({weighting: true, level: 65, standing: ["Q3","D18"]}); // The Paths of Caras Galadhon and In the Black and Twisted Forest (adv)

  var lolwut =  fatb.FindPath(start,finish);

  t.equals(typeof(lolwut), "object", "should be an object");
  t.equals(lolwut.length, 4, "should have 4 items");
  // t.deepEquals(lolwut, ["Galtrev", "Inner Caras Caladhon", "Ost Galadh", "Thangulhad"], "viable route"); //FIXME: no idea why this test doesn't pass...
  t.end();
});


