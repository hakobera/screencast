window.onload = function() {
  var hostname = window.location.hostname,
      port = window.location.port,
      uri = 'ws://' + hostname + (port === '' ? '' : (':' + port));

  var outCanvas = document.getElementById('out');

  function render(data) {
    var img = new PNG(data);
    img.render(outCanvas);
  }

  console.log('connected to %s', uri);
  var socket = new WebSocket(uri, 'screencaster-protocol');
  socket.binaryType = 'arraybuffer';

  socket.onopen = function() {
    console.log('connected');
  };

  socket.onmessage = function(message) {
    var data = new Uint8Array(message.data);
    render(data);
  }
};
