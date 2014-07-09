/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/
var test = require('tape').test;


// for path finding tests
var fatb = require('../lib/fromatobree');

test("create graph with options, but level reqs not met", function(t) {
  var options = fatb.setup({level: 29});
  var graph = fatb.createGraph(true);

  t.equal(graph["West Bree"]["Esteldin"], 101);
  t.end();
});

test("create graph with options, but standing reqs met", function(t) {
  var options = fatb.setup({standing: ["R28","Q6"]});
  var graph = fatb.createGraph(true);

  t.equal(graph["Harwick"]["Hytbold"], 1);
  t.end();
});
