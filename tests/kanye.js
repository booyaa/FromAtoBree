var test = require('tape').test;

var fatb = require('../lib/fromatobree');

var graph = fatb.CreateGraph();
test("graph is an object", function(t) {
  t.equal(typeof(graph), "object");
  t.end();
});
