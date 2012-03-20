/*
 * Screen capture image broadcapture model.
 */

/**
 * Module dependencies.
 */
var wsServer = require('./wsServer'),
    screenCapture = require('./screencapture'),
    emptyPort = require('./emptyport'),
    fs = require('fs'),
    util = require('util'),
    dataSection = require('data-section'),
    im = require('imagemagick');

function ScreenCaster() {
  this.server = null;
}

/**
 * Module version.
 */
ScreenCaster.version = '0.1.0';

/**
 * Start HTTP and WebSocket server.
 *
 * @param {Number} port Server port number
 * @param {String} [title='screencaster'] Title of index.html (optional)
 * @param {Function} callback Callback function
 */
ScreenCaster.prototype.start = function(port, title, callback) {
  var self = this;

  if (typeof title === 'function') {
    callback = title;
    title = 'screencaster';
  }

  if (port) {
    self._start(port, title, callback);
  } else {
    emptyPort.find(function(err, port) {
      if (err) return callback(err);
      self._start(port, title, callback);
    });
  }
};

/**
 * Stop HTTP and WebSocket server.
 */
ScreenCaster.prototype.stop = function stop() {
  this.server.stop();
};

/**
 * Start server.
 * @private
 */
ScreenCaster.prototype._start = function(port, title, callback) {
  var self = this,
      indexHtml = dataSection.getSync('index').replace("${TITLE}", title);

  this.server = new wsServer.Server();
  this.server.start(port, indexHtml, function(err) {
    if (err) {
      return callback(err);
    }

    var tmpdir = process.env.TMPDIR,
        captureFile = util.format('%sscreencaster_%d.png', tmpdir, Date.now()),
        outputFile = captureFile + '.out.png',
        count = 0;

    setTimeout(function capture() {
      screenCapture.capture(['-T', 0, '-C', '-t', 'png', captureFile], function(err) {
        console.log('screenCapture.capture(): #' + count++);

        if (err) {
          throw new Error(err);
        }

        im.resize({
          srcPath: captureFile,
          dstPath: outputFile,
          width: 800
        }, function(err, stdout, stderr){
          if (err) throw err;
          fs.readFile(outputFile, function(err, data) {
            if (err) throw err;
            self.server.broadcast(data);
            setTimeout(capture, 100);
          });
        });
      });
    }, 0);

    callback();
  });

  this.server.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log('%s Connection from origin %s rejected', Date.now(), request.origin);
      return;
    }

    try {
      var socket = request.accept('screencaster-protocol', request.origin);
      console.log((new Date()) + ' Connection accepted.');
    } catch (e) {
      console.log(util.format('%s, [port=%d, title=%s]', e.message, port, title));
      return;
    }

    socket.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + socket.remoteAddress + ' disconnected.');
    });
  });
};

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

module.exports = ScreenCaster;

/* __DATA__
@@ index
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${TITLE}</title>
  <script src="/javascripts/screencast.js"></script>
</head>
<body>
  <img id="out"/>
</body>
</html>
__DATA__*/
