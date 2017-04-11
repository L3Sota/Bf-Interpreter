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

describe('parseTweet', function() {
  it('Leaves content intact', function() {
    assert.equal(server.parseTweet('Hello world!', '').program, 'Hello world!');
    assert.equal(server.parseTweet('ROT@34KहिربবাংਜਾO%!#4古국בר池やæな\r1ん$àと%a\nbかか😛bdf$20மிñんとかH\\ 　there！：：', '').program, 'ROT@34KहिربবাংਜਾO%!#4古국בר池やæな\r1ん$àと%a\nbかか😛bdf$20மிñんとかH\\ 　there！：：');
  });
  it('Parses out @mention', function() {
    assert.equal(server.parseTweet('@user \\/\\//+_+-=-2341_)(*@@#$:DE', 'user').program, '\\/\\//+_+-=-2341_)(*@@#$:DE');
    assert.equal(server.parseTweet('@alpha @b3ta @ga_mma hey guys', 'alpha').program, '@b3ta @ga_mma hey guys');
  });
  it('Parses out :: separator', function() {
    assert.equal(server.parseTweet('@user +-=-2341_:)(*:@user:@:#$:DE::,.,.,.&gt;+&lt;,.', 'user').program, ',.,.,.>+<,.');
    assert.equal(server.parseTweet('@user !!!@@@@useruser@user@user@@use@uwer#%%%OROTKO古池や！a：：&gt;&lt;.,..[-].::,.,.,.[-][&gt;+&lt;],.', 'user').program, ',.,.,.[-][>+<],.');
    assert.equal(server.parseTweet('::+[-&gt;++&lt;]&gt;[-&lt;++&gt;]&lt;[-&gt;++&lt;]', 'user').program, '+[->++<]>[-<++>]<[->++<]');
  });
  it('Returns extra :: separators', function() {
    assert.equal(server.parseTweet('::::::::&lt;&gt;&lt;&gt;&lt;&gt;&lt;&gt;&lt;&gt;&lt;&gt;::&gt;&lt;&gt;&lt;&gt;&lt;&gt;&lt;&gt;&lt;&gt;&lt;&gt;&gt;&gt;&gt;,.').input, '::::::::<><><><><><>');
    assert.equal(server.parseTweet('@hello_world my::hadoop::string::is&lt;&lt;&gt;&gt;&gt;::ংਜਾO%!#4古국ב::+[&gt;++&lt;-]&gt;++&lt;--', 'hello_world').input, 'my::hadoop::string::is<<>>>::ংਜਾO%!#4古국ב');
  })
});
