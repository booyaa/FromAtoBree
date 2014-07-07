var test = require('tape').test;

var fatb = require('../lib/fromatobree');

// create graph with and w/o options

test("we have options", function(t) {
  var options = fatb.setup({level: 50, standing: ["R1","R2"]});
  t.deepEquals(options, {level: 50, standing: ["R1","R2"]});
  t.end();
});

test("we do not have options", function(t) {
  var options =  fatb.setup();
  t.deepEquals(options, {});
  t.end();
});

