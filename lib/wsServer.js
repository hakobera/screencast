/*
 * WebSocket broadcast server.
 */

/**
 * Module dependencies.
 */
var WebSocketServer = require('websocket').server,
    http = require('http'),
    util = require('util'),
    url = require('url'),
    fs = require('fs'),
    staticResource = require('static-resource'),
    EventEmitter = require('events').EventEmitter;

function Server() {
  EventEmitter.call(this);
  this.httpServer = null;
  this.wsServer = null;
}
util.inherits(Server, EventEmitter);
exports.Server = Server;

/**
 * Start HTTP and WebSocket server.
 *
 * @param {Number} port Server port number
 * @param {String} indexHtml index.html
 */
Server.prototype.start = function start(port, indexHtml, callback) {
  var self = this;

  this.httpServer = _createHttpServer(port, indexHtml);
  this.wsServer = _createWebSocketServer(this.httpServer);

  this.httpServer.listen(port, function(err) {
    if (err) return callback(err);

    console.log('Server is listening on port %d', port);
    console.log('Server listening on http://0.0.0.0:%d', port);
    callback();
  });

  this.wsServer.on('request', function(request) {
    self.emit('request', request);
  });
};

/**
 * Stop servers
 */
Server.prototype.stop = function stop() {
  if (this.wsServer) {
    this.wsServer.shutDown();
  }
  if (this.httpServer) {
    this.httpServer.close();
  }
};

/**
 * Broadcast message to all connected client.
 *
 * @param {Buffer} data
 */
Server.prototype.broadcast = function(data) {
  this.wsServer.broadcast(data);
};

function _createHttpServer(port, indexHtml) {
  var staticResourceHandler = staticResource.createHandler(fs.realpathSync( __dirname + '/../public'));

  var httpServer = http.createServer(function(req, res) {
    var path = url.parse(req.url).pathname;
    if (path === '/') {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(indexHtml);
    } else {
      if (!staticResourceHandler.handle(path, req, res)) {
        res.writeHead(404);
        res.write('404');
        res.end();
      }
    }
  });
  return httpServer;
}

function _createWebSocketServer(httpServer) {
  var wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
  });
  return wsServer;
}




