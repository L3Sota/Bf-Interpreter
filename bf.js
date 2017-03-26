/*
 * Copyright 2017 Sotaro Sugimoto
 * https://github.com/L3Sota/bf-interpreter
 *
 * bf.js: Brainfuck interpreter engine
 *
 * bf.js is forked from index.js and interprets
 * the passed Brainfuck code.
 */

function send_error(content) {
  process.send({
    stream: 'error',
    message: content
  });
}
function send_output(content) {
  process.send({
    stream: 'output',
    message: content
  })
}

function find_matching(start, program) {
  var self_char = program[start];
  var match_char;
  var move;
  switch(self_char)
  {
    case '[': {
      match_char = ']';
      move = 1;
      break;
    }
    case ']': {
      match_char = '[';
      move = -1;
      break;
    }
    default: {
      return -1;
    }
  }
  // depth becomes 0 on first iteration
  var depth = -1;
  for (var i = start; 0 <= i && i < program.length; i += move) {
    var candidate = program[i];
    if (candidate === match_char) {
      if (depth) { --depth; }
      else { return i; }
    } else if (candidate === self_char) {
      ++depth;
    }
  }
  return -1;
}

var input;
var program;
var argc = process.argv.length;
if (argc < 2) {
  send_error('Syntax error: At least 2 args required but '+argc+' provided.');
  return 1;
} else {
  input = process.argv[argc-2];
  program = process.argv[argc-1];
}
var i_position = 0;
var buffer = [];
var b_position = 0;
var result = '';
const max_uptime = 1;
for (var tape = 0; tape < program.length; ++tape) {
  if (process.uptime() > max_uptime) {
    send_error('TLE: '+max_uptime+' s.');
    return 2;
  }
  var current_command = program.charAt(tape);
  if (b_position >= buffer.length) {
    buffer.push(0);
  }
  switch(current_command) {
    case ',': { // read
      if (i_position >= input.length) {
        buffer[b_position] = 0;
      } else {
        buffer[b_position] = input.charCodeAt(i_position);
      }
      ++i_position;
      break;
    }
    case '.': { // write
      var code = buffer[b_position];
      if (code >= 32 && code <= 126) { // printable ASCII
        result += String.fromCharCode(code);
      } else {
        result += '\\' + code;
      }
      break;
    }
    case '<': { // left
      if (b_position > 0) { --b_position; }
      break;
    }
    case '>': { // right
      ++b_position;
      break;
    }
    case '[': { // loop beginning
      var match = find_matching(tape, program);
      if (match == -1) {
        send_error('Syntax error: No matching ] for [ at '+tape+'.\n' + input + '::' + program);
        return 1;
      }
      if (buffer[b_position] === 0) {
        tape = match;
      }
      break;
    }
    case ']': { // loop end
      var match = find_matching(tape, program);
      if (match == -1) {
        send_error('Syntax error: No matching [ for ] at '+tape+'.\n' + input + '::' + program);
        return 1;
      }
      if (buffer[b_position] != 0) {
        tape = match;
      }
      break;
    }
    case '+': { // increment
      ++buffer[b_position];
      break;
    }
    case '-': { // decrement
      --buffer[b_position];
      break;
    }
    default: {
      break;
    }
  }
}
send_output(result);
return 0;
