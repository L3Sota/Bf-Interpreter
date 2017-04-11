/*
 * Copyright 2017 Sotaro Sugimoto
 * https://github.com/L3Sota/bf-interpreter
 *
 * test.js: bf_interpreter test suite
 *
 * Tests are run using Mocha.js.
 * http://mochajs.org/
 */

const assert = require('assert');
const server = require('../server.js');

describe('bf_interpret', function() {
  it('Prints correctly', function(done) {
    server.fork_interpreter('Hello', ',.,.,.,.,.', function(result) {
      assert.equal('Hello', result);
      done();
    });
  });
  it('Does simple loops correctly', function(done) {
    var done_count = 0;
    const num_tests = 4;
    var check = setInterval(function() {
      if (done_count == num_tests) { clearInterval(check); done(); }
    }, 100);
    server.fork_interpreter('Hello', '+[->++<]>[-<++>]<+[-,.]', function(result) {
      assert.equal(result, 'Hello\\0');
      ++done_count;
      if (done_count == num_tests) { clearInterval(check); done(); }
    });
    server.fork_interpreter('Hello', '++>,.>,.>,.>,.>,.<<<<<[->.<>+>+>+.<.<.<]', function(result) {
      assert.equal(result, 'HelloHmfIIngJ');
      ++done_count;
      if (done_count == num_tests) { clearInterval(check); done(); }
    });
    server.fork_interpreter('Hello', ',.+[-],.', function(result) {
      assert.equal(result, 'He');
      ++done_count;
      if (done_count == num_tests) { clearInterval(check); done(); }
    });
    server.fork_interpreter('Hello', '+[,.]', function(result) {
      assert.equal(result, 'Hello\\0');
      ++done_count;
      if (done_count == num_tests) { clearInterval(check); done(); }
    });
  });
});
