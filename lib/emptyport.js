var net = require('net');

/**
 * Find empty port.
 *
 * @param {Number} [min = 10000] Minimum port number
 * @param {Number} [max = 20000] Maximum port number
 * @param {Function} callback function(err, port)
 */
exports.find = function(min, max, callback) {
  if (typeof min === 'function') {
    callback = min;
    min = 10000;
    max = 20000;
  } else if (typeof max === 'function') {
    callback = max;
    max = 20000;
  }

  if (min > max) {
    var tmp = min;
    min = max;
    max = tmp;
  }

  var port = min,
      server = new net.Server();

  server.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      server.close();
      findEmptyPort();
    } else {
      callback(e);
    }
  });

  function findEmptyPort() {
    if (port++ >= max) {
      callback(new Error('Empty port not found'));
      return;
    }

    server.listen(port, '127.0.0.1', function() {
      server.close();
      callback(null, port);
    });
  };
  findEmptyPort();
};