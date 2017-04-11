/*
 * Copyright 2017 Sotaro Sugimoto
 * https://github.com/L3Sota/bf-interpreter
 *
 * server.js: main evaluation loop
 *
 * server.js performs all API interactions with
 * Twitter through the Twitter npm package, and
 * forks a process to run bf.js whenever
 * it finds a new mention.
 */

const cp = require('child_process');

// expose to Mocha
exports.fork_interpreter = fork_interpreter;

function fork_interpreter(input, program, callback) {
  var result = '';
  const max_wait = 2;
  var tle = setTimeout(() => {
    console.error('Interpreter Error: TLE: '+max_wait+' s');
  }, max_wait*1000);
  var interpreter = cp.fork('./bf.js', [input, program])
  interpreter.on('message', (m) => {
    if (m.stream == 'output') {
      result += m.message;
    } else if (m.stream == 'error') {
      console.error('Interpreter Error: Message received on error stream');
      console.error(m.message);
    } else {
      console.error('Interpreter Error: Message received on unknown stream');
      console.error(m);
    }
  });
  interpreter.on('exit', (code, signal) => {
    clearTimeout(tle);
    if (code === 0) {
      callback(result);
    } else {
      console.error('Interpreter Error: Interpreter exited with '+code);
    }
  });
  return;
}
