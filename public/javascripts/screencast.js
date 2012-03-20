window.onload = function() {
  var URL = window.URL || window.webkitURL;

  var hostname = window.location.hostname,
      port = window.location.port,
      uri = 'ws://' + hostname + (port === '' ? '' : (':' + port));

  var outImg = document.getElementById('out');

  function render(data) {
    URL.revokeObjectURL(outImg.src);
    var imgUrl = URL.createObjectURL(data);
    outImg.src = imgUrl;
  }

  console.log('connected to %s', uri);
  var socket = new WebSocket(uri, 'screencaster-protocol');
  socket.binaryType = 'blob';

  socket.onopen = function() {
    console.log('connected');
  };

  socket.onmessage = function(message) {
    render(message.data);
  }
};
