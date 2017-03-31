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

exports.fork_interpreter = fork_interpreter;

function fork_interpreter(input, program, callback) {
  var result = '';
  const max_wait = 2;
  var tle = setTimeout(() => {
    throw new Error('Interpreter Error: TLE: '+max_wait+' s.');
  }, max_wait*1000);
  var interpreter = cp.fork('./bf.js', [input, program])
  interpreter.on('message', (m) => {
    if (m.stream == 'error') {
      throw new Error(m.message);
    }
    if (m.stream == 'output') {
      result += m.message;
    }
  });
  interpreter.on('exit', (code, signal) => {
    if (code === 0) {
      clearTimeout(tle);
      callback(result);
    } else {
      throw new Error('Interpreter Error: Interpreter exited with '+code+'.');
    }
  });
  return;
}
