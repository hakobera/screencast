var screencapture = require('../lib/screencapture');

var should = require('should'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

describe('screencapture', function() {

  var tmpdir = __dirname + '/../tmp'

  before(function(done) {
    fs.rmdir(tmpdir, function(err) {
      mkdirp(tmpdir, function(err) {
        done(err);
      });
    });
  })

  describe('call capture(["-T", 0, "-x", "tmp/captuer001.png"])', function() {
    it('should take a screenshot and save it to file', function(done) {
      var outfile = tmpdir + "/captuer001.png";

      screencapture.capture(["-T", 0, outfile], function(err) {
        if (err) return done(err);
        path.existsSync(outfile).should.be.true;
        done(err);
      });
    })
  })

  describe('call capture() with output file that is not exist folder', function() {
    it('should return error', function(done) {
      var outfile = __dirname + '/invalidfolder/invalidfile.png';

      screencapture.capture(["-T", 0, outfile], function(err) {
        //console.log(util.inspect(err, true));
        should.exist(err);
        err.message.trim().should.equal('Return code is 1');
        done();
      });
    })
  })

});
