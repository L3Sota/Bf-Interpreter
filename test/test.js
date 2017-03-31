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
    server.fork_interpreter('Hello', '+[->++<]>[-<++>]<+[-,.]', function(result) {
      assert.equal('Hello\\0', result);
      ++done_count;
      if (done_count == 3) { done(); }
    });
    server.fork_interpreter('Hello', '++>,.>,.>,.>,.>,.<<<<<[->.<>+>+>+.<.<.<]', function(result) {
      assert.equal('HelloHmfIIngJ', result);
      ++done_count;
      if (done_count == 3) { done(); }
    });
    server.fork_interpreter('Hello', ',.+[-],.', function(result) {
      assert.equal('He', result);
      ++done_count;
      if (done_count == 3) { done(); }
    });
  });
})
