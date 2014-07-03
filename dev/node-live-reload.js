// npm install -g node-live-reload
// uncomment script call in index.html

// do not run this in production unless you like lulz
// include in head tag

var ws;
function socket() {
  ws = new WebSocket("ws://127.0.0.1:8080");
  ws.onmessage = function ( e ) {
    var data = JSON.parse(e.data);
    if ( data.r ) {
      location.reload();
    }
  };
}
setInterval(function () {
  if ( ws ) {
    if ( ws.readyState !== 1 ) {
      socket();
    }
  } else {
    socket();
  }
}, 1000);
