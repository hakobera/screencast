var ws = require('../lib/wsServer');

var should = require('should'),
    fs = require('fs'),
    request = require('request'),
    websocket = require('websocket'),
    WebSocketClient = websocket.client,
    WebSocketRequest = websocket.request;

describe('ws', function() {

  describe('Server.start()', function() {
    it('should start WebSocket server over HTTP server', function(done) {
      var server = new ws.Server(),
          wsClient = new WebSocketClient(),
          port = 19000,
          indexHtml = '<html><head><title>test</title></head><body></body></html>';

      server.start(port, indexHtml, function(err) {
        if (err) return done(err);

        var uri = '://127.0.0.1:' + port;
        request('http' + uri, function(err2, response, body) {
          if (err2) return done(err2);

          response.statusCode.should.equal(200, 'HTTP server return ok response');
          body.should.equal(indexHtml);

          server.on('request', function(req) {
            server.stop();

            req.should.instanceof(WebSocketRequest, 'WebSocket server emit connection request event');
            done();
          });
          wsClient.connect('ws' + uri);
        });
      });
    })
  })

  describe('Server.broadcast()', function() {
    it('should ', function(done) {
      var server = new ws.Server(),
          port = 19001;

      server.start(port, 'test', function(err) {
        if (err) return done(err);

        var uri = '://127.0.0.1:' + port;
        request('http' + uri, function(err2, response, body) {
          if (err2) return done(err2);

          var wsClient1 = new WebSocketClient(),
              wsClient1OnMessage = false,
              wsClient2 = new WebSocketClient(),
              wsClient2OnMessage = false;

          server.on('request', function(req) {
            req.accept();
            req.should.instanceof(WebSocketRequest, 'WebSocket server emit connection request event');
          });

          wsClient1.connect('ws' + uri);
          wsClient2.connect('ws' + uri);

          wsClient1.on('connect', function(con) {
            con.on('message', function(data) {
              data.type.should.equal('utf8');
              data.utf8Data.should.equal('test');
              wsClient1OnMessage = true;
            });
          });

          wsClient2.on('connect', function(con) {
            server.broadcast('test');
            con.on('message', function(data) {
              data.type.should.equal('utf8');
              data.utf8Data.should.equal('test');
              wsClient2OnMessage = true;
            });
          });

          setTimeout(function check() {
            if (wsClient1OnMessage && wsClient2OnMessage) {
              server.stop();
              done();
            } else {
              setTimeout(check, 200);
            }
          }, 200);
        });
      });
    })
  })

})