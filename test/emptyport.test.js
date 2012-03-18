var emptyport = require('../lib/emptyport');

var should = require('should'),
    Server = require('net').Server;

describe('emptyport', function() {

  describe('.find(callback)', function() {
    it('should return empty port number between 10000 and 20000', function(done) {
      emptyport.find(function(err, port) {
        if (err) return done(err);

        port.should.within(10000, 20000);
        done();
      });
    })
  })

  describe('.find(19000, callback)', function() {
    it('should return empty port number between 19000 and 20000', function(done) {
      emptyport.find(19000, function(err, port) {
        if (err) return done(err);

        port.should.within(19000, 20000);
        done();
      });
    })
  })

  describe('.find(19000, 19010, callback)', function() {
    it('should return empty port number between 19000 and 19010', function(done) {
      emptyport.find(19000, 19010, function(err, port) {
        if (err) return done(err);

        port.should.within(19000, 19010);
        done();
      });
    })
  })

  describe('.find(19000, 19010, callback) and port 19000 is not empty', function() {
    it('should return 19001', function(done) {
      var s = new Server();
      s.listen(19000, function() {
        emptyport.find(19000, 19010, function(err, port) {
          s.close();
          if (err) return done(err);

          port.should.equal(19001);
          done();
        });
      });
    })
  })

  describe('if argument min > max like find(19001, 19000, callback) and port 19000 is not empty', function() {
    it('should return 19001', function(done) {
      var s = new Server();
      s.listen(19000, function() {
        emptyport.find(19001, 19000, function(err, port) {
          s.close();
          if (err) return done(err);

          port.should.equal(19001);
          done();
        });
      });
    })
  })

  describe('when call find() and empty port not found', function() {
    it('should return error', function(done) {
      var s = new Server();
      s.listen(19000, function() {
        emptyport.find(19000, 19000, function(err, port) {
          s.close();
          should.exist(err);
          err.message.should.equal('Empty port not found');
          done();
        });
      });
    })
  })

})