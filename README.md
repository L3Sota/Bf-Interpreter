[![Build Status](https://travis-ci.org/L3Sota/bf-interpreter.svg?branch=master)](https://travis-ci.org/L3Sota/bf-interpreter)


# bf-interpreter

A Twitter bot that interprets Brainfuck code. Twitter account is [@bf_interpreter](https://twitter.com/bf_interpreter). Hosted on [Heroku](https://bf-interpreter.herokuapp.com) (Nothing there though since it doesn't have a frontend). Dev's Twitter account is [@L3Sota](https://twitter.com/L3Sota)


## Installation

1. Git: `git clone`
2. NPM: `npm install`

That's it!


## Environment

You will need to set 5 environment variables related to Twitter:

- `TWTR_USER_ID`
- `TWTR_C_KEY`
- `TWTR_C_SECRET`
- `TWTR_ACCESS_T_KEY`
- `TWTR_ACCESS_T_SECRET`

These can be obtained from either your Twitter account details or from your app details in [Twitter Apps](https://apps.twitter.com). The account should be an account created solely for the bot. `_C_` stands for Consumer and `_ACCESS_T_` stands for Access Token. Your `TWTR_USER_ID` can also be found by taking the numbers in `TWTR_ACCESS_T_KEY` up to (but not including) the first hyphen. `export` these variables through a `.bashrc`, or put them in an environment file to be `export`ed when running the server. If you are using Heroku, placing the environment variables in `KEY=VALUE` format in a `.env` file in the base directory allows `heroku local` to automatically load these variables for you.


## Running

`npm start` will start the server. If you're using Heroku, `heroku local` will do the same (and add colorful timestamps and log messages).


## Testing

`npm test`. Tests are run using [Mocha](http://mochajs.org).


## Quirks

- The current interval for checking for new mentions is 1 minute (60*1000 milliseconds). There is no option to change this at the moment; modify the source in `server.js` (line 195).
- The current code prevents sending a reply to the same tweet twice by only replying to mentions received **after the last tweet made by the bot**. This means manual tweeting (e.g. on a human user's account) can prevent some mentions from being replied to.
- The current time limit for BF interpreter execution is 1 second. There is no option to change this at the moment; modify `max_uptime` in `bf.js` (line 76).
