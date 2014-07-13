/*jslint node: true, laxcomma: true, loopfunction: true, sub: true*/
var test = require('tape').test;

// var fatb = require('../lib/fromatobree');

// currently broken
// setup/initialisation of graph, still not happy with this code.

// test("we have options", function(t) {
//   var options = fatb.setup({level: 50, standing: ["R1","R2"]});
//   t.deepEquals(options, {level: 50, standing: ["R1","R2"]});
//   t.end();
// });
// 
// test("we do not have options", function(t) {
//   var options =  fatb.setup();
//   t.deepEquals(options, {});
//   t.end();
// });
// 
// test("create graph with no options", function(t) {
//   var graph = fatb.createGraph(); //FIXME: this will fail if there's no stable data
//   t.equal(graph["West Bree"]["Esteldin"], 1);
//   t.end();
// });
// 
// 
// test("create graph with options, but level reqs not met", function(t) {
//   var options = fatb.setup({level: 29});
//   var graph = fatb.createGraph(true);
// 
//   t.equal(graph["West Bree"]["Esteldin"], 101);
//   t.end();
// });
// 
// test("create graph with options, but level reqs met", function(t) {
//   var options = fatb.setup({level: 30});
//   var graph = fatb.createGraph(true);
// 
//   t.equal(graph["West Bree"]["Esteldin"], 1);
//   t.end();
// });
// 
// test("create graph with options, but standing reqs not met", function(t) {
//   var options = fatb.setup({standing: []});
//   var graph = fatb.createGraph(true);
// 
//   // t.equal(graph["Aughaire"]["Gabilshathur"], 101);
//   t.equal(graph["Harwick"]["Hytbold"], 101);
//   t.end();
// });
// 
// test("create graph with options, but standing reqs met", function(t) {
//   var options = fatb.setup({standing: ["R28","Q6"]});
//   var graph = fatb.createGraph(true);
// 
//   t.equal(graph["Harwick"]["Hytbold"], 1);
//   t.end();
// });
