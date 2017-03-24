/*
 * Copyright 2017 Sotaro Sugimoto
 * https://github.com/L3Sota/bf-interpreter
 */

function bf_interpret(input, program) {
  var i_position = 0;
  var buffer = [];
  var b_position = 0;
  var result = '';
  for (var tape = 0; tape < program.length; tape++) {
    var current_command = program.charAt(tape);
    if (buffer.length <= b_position) {
      buffer.push(0);
    }
    switch(current_command) {
      case ',': { // read
        buffer[b_position] = input.charCodeAt(i_position++);
        if (input.length < i_position) { input += '' + 0; }
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
        if (b_position > 0) { b_position--; }
        break;
      }
      case '>': { // right
        b_position++;
        break;
      }
      case '[': { // loop beginning
        var tape_orig = tape;
        if (buffer[b_position] == 0) {
          var depth = 0;
          var terminate = false;
          while(!terminate) {
            tape++;
            if (tape >= program.length) {
              var err = 'Syntax error: No matching ] for [ at '+tape_orig+'.';
              console.log(err);
              return err + '\n' + program;
            }
            if (program.charAt(tape) == ']') {
              if (depth == 0) { terminate = true; }
              else { --depth; }
            } else if (program[tape] == '[') {
              ++depth;
            }
          }
        }
        break;
      }
      case ']': { // loop end
        var tape_orig = tape;
        if (buffer[b_position] != 0) {
          var depth = 0;
          var terminate = false;
          while(!terminate) {
            tape--;
            if (tape < 0) {
              var err = 'Syntax error: No matching [ for ] at '+tape_orig+'.';
              console.log(err);
              return err + '\n' + program;
            }
            if (program[tape] == '[') {
              if (depth == 0) { terminate = true; }
              else { --depth; }
            } else if (program[tape] == ']') {
              ++depth;
            }
          }
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
  console.log('Finished. Result: '+result);
  return result;
}

bf_interpret('Hello', '++>,.>,.>,.>,.>,.<<<<<[->.<>+>+>+.<.<.<]'); // Should print: HelloHmfIIngJ
bf_interpret('Hello', ',.+[-],.'); // Should print: He
