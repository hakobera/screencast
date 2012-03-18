var ScreenCaster = require('../lib/screencaster');

var should = require('should'),
    request = require('request'),
    fs = require('fs'),
    WebSocketClient = require('websocket').client;

describe('screencaster', function() {

  describe('.version', function() {
    it('should return 0.1.0', function() {
      ScreenCaster.version.should.equal('0.1.0');
    })
  })

  describe('.start()', function() {

    describe('with valid protocol', function() {
      it('should start WebSocketServer and server can handle request', function(done) {
        var port = 19010,
            screencaster = new ScreenCaster(),
            indexHtml = fs.readFileSync(__dirname + '/fixtures/index.html', 'utf8');

        screencaster.start(port, 'test', function(err) {
          if (err) return done(err);

          request('http://127.0.0.1:' + port, function(err, response, body) {
            response.statusCode.should.equal(200);
            body.trim().should.equal(indexHtml);

            var client = new WebSocketClient();
            client.connect('ws://127.0.0.1:' + port, 'screencaster-protocol');
            client.on('connect', function(con) {
              con.on('message', function(data) {
                data.type.should.equal('binary');
                screencaster.stop();
                done();
              });
            });
          });
        });
      })
    })

    describe('with invalid protocol', function() {
      it('should return error', function(done) {
        var port = 19020,
            screencaster = new ScreenCaster();

        screencaster.start(port, 'test', function(err) {
          var client = new WebSocketClient();
          client.connect('ws://127.0.0.1:' + port, 'invalid-protocol');
          client.on('connectFailed', function() {
            screencaster.stop();
            done();
          });
        });
      })
    })

  })

})