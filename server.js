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

const html_entities = require('he');
const twitter = require('twitter');
const cp = require('child_process');

// expose to Mocha
exports.fork_interpreter = fork_interpreter;
exports.parseTweet = parseTweet;

function fork_interpreter(input, program, callback) {
  var result = '';
  const max_wait = 2;
  var tle = setTimeout(() => {
    console.error(`Interpreter Error: TLE: ${max_wait} s`);
  }, max_wait*1000);
  console.log(`Forking bf.js with input: "${input}" and program "${program}"`);
  var interpreter = cp.fork('./bf.js', [input, program])
  interpreter.on('message', (m) => {
    if (m.stream == 'output') {
      result += m.message;
    } else if (m.stream == 'error') {
      console.error('Interpreter Error: Message received on error stream');
      console.error(m.message);
    } else if (m.stream == 'runtime') {
      console.log(`Interpreter finished running in ${m.message} ms`);
    } else {
      console.error('Interpreter Error: Message received on unknown stream');
      console.error(m);
    }
  });
  interpreter.on('exit', (code, signal) => {
    clearTimeout(tle);
    if (code === 0) {
      console.log('Interpreter exited successfully');
      callback(result);
    } else {
      console.error('Interpreter Error: Interpreter exited with '+code);
    }
  });
  return;
}

function fetch_latest_tweet(tw_client, callback) {
  var last_tweet_id_str = '';
  var username;
  tw_client.get('statuses/user_timeline', {
    user_id: process.env.TWTR_USER_ID, // only possible because there's only 1 consumer
    exclude_replies: 'false',
    include_rts: 'false'
  }, (error, tweets, response) => {
    if (error) {
      console.error(error);
      return 1;
    }
    if (Array.isArray(tweets)) {
      console.log(`Fetched ${tweets.length} tweets from user timeline`);
      for (var i = 0; i < tweets.length; ++i) {
        if(process.env.TWTR_USER_ID == tweets[i].user.id_str) {
          last_tweet_id_str = tweets[i].id_str;
          username = tweets[i].user.screen_name;
          console.log("User's latest tweet found");
          break;
        }
      }
      callback( { id_str: last_tweet_id_str, screen_name: username } );
    } else {
      console.error('Error: GET statuses/user_timeline returned non-Array object');
      console.error(tweets);
      return 1;
    }
  });
  return 0;
}

function parseTweet(text, username) {
  text = html_entities.decode(text);
  var splitting = text.split('::');
  const mention_str = `@${username} `;
  if (splitting.length == 1) {
    var start = text.indexOf(mention_str);
    if (start == -1) {
      return {
        input: '',
        program: text
      };
    }
    else {
      return {
        input: '',
        program: text.substr(start + mention_str.length)
      };
    }
  } else {
    var start = splitting[0].indexOf(mention_str);
    var program_str = splitting.pop();
    if (start == -1) {
      return {
        input: splitting.join('::'),
        program: program_str
      };
    }
    else {
      splitting[0] = splitting[0].substr(start + mention_str.length);
      return {
        input: splitting.join('::'),
        program: program_str
      };
    }
  }
}

function sendReply(tw_client, destination, original_tweet_id, message) {
  if (!message) {
    message = '[No output]';
  }
  message = html_entities.encode(message);
  tw_client.post('statuses/update', {
    in_reply_to_status_id: original_tweet_id,
    status: `@${destination} ${message}`
  }, (error, tweet, response) => {
    if (error) {
      console.error('Error: POST statuses/update failed');
      console.error(error);
      return;
    }
    console.log('Succesful reply with id '+tweet.id_str);
    console.log(tweet.text);
  });
}

function main(tw_client) {
  fetch_latest_tweet(tw_client, (client_info) => {
    if (client_info.id_str) {
      tw_client.get('statuses/mentions_timeline', {
        since_id: client_info.id_str,
        include_entities: 'false'
      }, (error, mentions, response) => {
        if (error) {
          console.error('Error: GET statuses/mentions_timeline returned error');
          console.error(error);
        } else if (Array.isArray(mentions)) {
          console.log(`Sending ${mentions.length} replies to mentions`);
          mentions.forEach((mention) => {
            console.log(mention);
            var sender = mention.user.screen_name;
            var tweet_id = mention.id_str;
            var content = mention.text;
            var parsed = parseTweet(content, client_info.screen_name);
            // Prevent infinite looping on generated self-replies
            if (sender != client_info.screen_name) {
              fork_interpreter(parsed.input, parsed.program, (result) => {
                sendReply(tw_client, sender, tweet_id, result);
              });
            } else {
              console.log('Caught self-reply');
              console.log(result);
            }
          });
        } else {
          console.error('Error: GET statuses/mentions_timeline returned non-Array object');
          console.error(mentions);
        }
      });
    } else {
      console.error('Error: client_info.id_str is falsy');
      console.error(client_info);
    }
  });
}

if (process.env.TWTR_USER_ID
  && process.env.TWTR_C_KEY
  && process.env.TWTR_C_SECRET
  && process.env.TWTR_ACCESS_T_KEY
  && process.env.TWTR_ACCESS_T_SECRET) {

  var client = new twitter({ // only possible because there's only 1 consumer
    consumer_key: process.env.TWTR_C_KEY,
    consumer_secret: process.env.TWTR_C_SECRET,
    access_token_key: process.env.TWTR_ACCESS_T_KEY,
    access_token_secret: process.env.TWTR_ACCESS_T_SECRET
  });

  setInterval(main, 60*1000, client);

} else {
  console.error('Error: Missing environment variables');
  console.error(`TWTR_USER_ID: ${process.env.TWTR_USER_ID}`);
  console.error(`TWTR_C_KEY: ${process.env.TWTR_C_KEY}`);
  console.error(`TWTR_C_SECRET: ${process.env.TWTR_C_SECRET}`);
  console.error(`TWTR_ACCESS_T_KEY: ${process.env.TWTR_ACCESS_T_KEY}`);
  console.error(`TWTR_ACCESS_T_SECRET: ${process.env.TWTR_ACCESS_T_SECRET}`);
  return 1;
}
