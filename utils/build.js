#!/usr/bin/env node

var fs         = require('fs');
var path       = require('path');
var uglifyjs   = require('uglify-js');
var browserify = require('browserify');

function bundle(file, callback) {
  var opts = { standalone: 'FATB' };
  browserify(file).bundle(opts, callback);
}

function addBanner(source) {
  var banner = fs.readFileSync(__dirname + '/banner').toString();
  return banner + source;
}

function minify(source) {
  var opts = { fromString: true };
  return uglifyjs.minify(source, opts).code;
}

function build(dest, options) {
  options = options || {};

  var src = __dirname + '/../lib/fromatobree.js';

  bundle(src, function (err, bundled) {
    var bannered = addBanner(bundled);
    var content = options.minify ? minify(bannered) : bannered;
    fs.writeFileSync(dest, content);
    console.log('built', path.resolve(dest));
  });
}

build(__dirname + '/../dontcommitmebro/fromatobree-browser.js');
build(__dirname + '/../dontcommitmebro/fromatobree-browser.min.js', { minify: true });
