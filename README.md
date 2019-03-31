# JiveScript

Simple & _very_ lightweight chatbot framework. Trigger syntax heavily inspired by the lovely [RiveScript](https://github.com/aichaos/rivescript-js).

## Installation

Install via `npm`:

```
npm install jivescript
```

Alternatively, install via `yarn`:

```
yarn add jivescript
```

## Usage

```js
// Your bot's brain:

import JiveScript from 'jivescript';

const jive = new JiveScript();

// Use `hear()` to supply a pattern (or an array of them) which the bot can
// match against what it is told.
jive.hear('cool', () => {
  // Use `say()` to respond to that matched trigger.
  jive.say('Sweet.');
});

// Nest more triggers in order to match those ones first so the bot can follow a
// thread of conversation, falling back to lower-level triggers if no match is
// found for the nested ones.
jive.hear(['hi [*]', 'hello [*]'], () => {
  jive.say('Well, hi there!', () => {
    jive.hear('are you a wizard', () => {
      jive.say('Kinda.');
    });
  });
});

// The callback passed to `hear()` will receive a `message` parameter that
// contains information about the matched message, in case you would like to
// decide what to say based on that info.
jive.hear(['[*] (um|uh) [*]', '[*] er [*]'], (message) => {
  switch (message.patternIndex) {
    case 0: jive.say("Um, WHAT?"); break;
    case 1: jive.say("u wot m8"); break;
  }
});

jive.hear('repeat after me *', (message) => {
  jive.say(`You said "${message.text}", but technically I heard it as "${message.interpreted}"`);
});

// You can return a promise from the callback passed to `hear()` if your
// response is dependent on an asynchronous action.
jive.hear('yes or no', () => {
  return fetch('https://yesno.wtf/api').then(resp => resp.json()).then(({ answer }) => {
    jive.say(answer);
  });
});
```

```js
// Interacting with your bot:

jive.tell("Hi! I'm Keegan.").then(response => console.log(response));
//=> "Well, hi there!"

jive.tell('Are you a wizard?').then(console.log);
//=> "Kinda."

jive.tell('Cool.').then(console.log);
//=> "Sweet."

jive.tell('Are you a wizard?').then(console.log);
//=> "Error: No matching trigger found!"

jive.tell('So, uh... whatcha doing tonight?').then(console.log);
//=> "Um, WHAT?"

jive.tell('I mean, er, I dunno, sorry').then(console.log);
//=> "u wot m8"

jive.tell("Repeat after me: I ain't got TIME for this").then(console.log);
//=> "You said "I ain't got TIME for this", but technically I heard it as "i aint got time for this"

jive.tell("Yes or no?").then(console.log);
//=> "no"
```

## Contributing

Bug reports and pull requests for this project are welcome at its [GitHub page](https://github.com/kjleitz/jivescript). If you choose to contribute, please be nice so I don't have to run out of bubblegum, etc.

## License

This project is open source, under the terms of the [MIT license](https://github.com/kjleitz/jivescript/blob/master/LICENSE).
