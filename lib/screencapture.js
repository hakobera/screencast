/*
 * Wrapper of Mac OS X 'screencapture' command
 */

var util = require('util'),
    spawn = require('child_process').spawn;

/**
 * Execute screencapture command.
 *
 * @param {Array} args Command line arguments for screencapture command
 * @param {Function} callback
 */
exports.capture = function capture(args, callback) {

  var realArgs = args.slice(0);

  // force slient mode
  realArgs.unshift('-x');

  var sc = spawn("screencapture", realArgs);

  // set error output to stderr
  sc.stderr.setEncoding('utf8');
  sc.stderr.on('data', function(data) {
    console.error(data);
  });

  sc.stdout.setEncoding('utf8');
  sc.stdout.on('data', function(data) {
    console.log(data);
  });

  sc.on('error', function(exception) {
    console.error(exception);
    callback(exception);
  });

  sc.on('exit', function(returnCode) {
    if (returnCode === 0) {
      callback();
    } else {
      callback(new Error('Return code is ' + returnCode));
    }
  });

};