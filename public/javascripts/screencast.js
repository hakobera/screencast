var createObjectURL = (function() {
  var URL = window.URL || window.webkitURL;
  return function(data) {
    return URL.createObjectURL(data);
  }
})();

window.onload = function() {
  var hostname = window.location.hostname,
      port = window.location.port,
      uri = 'ws://' + hostname + (port === '' ? '' : (':' + port));

  var outImg = document.getElementById('out');

  function render(data) {
    outImg.src = data;
  }

  console.log('connected to %s', uri);
  var socket = new WebSocket(uri, 'screencaster-protocol');
  socket.binaryType = 'blob';

  socket.onopen = function() {
    console.log('connected');
  };

  socket.onmessage = function(message) {
    var data = createObjectURL(message.data);
    render(data);
  }
};
