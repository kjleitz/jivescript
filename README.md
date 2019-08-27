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

// Check the message for what text was replaced in order to customize responses
jive.hear('hi my name is * how are you *', (message) => {
  const name = message.replacements['*'][0];
  const time = message.replacements['*'][1];
  jive.say(`Hi ${name}! I'm doing fine ${time}, thank you!`, () => {
    jive.hear('i thought you were doing terribly and [*] honestly', (message) => {
      jive.say(`Well, technically I am ${message.replacements['[*]'][0]}, but it's not unmanageable.`);
    });
    jive.hear('oh by the way is your (wife|brother) doing better', (message) => {
      jive.say(`Yep! Really lucky: full recovery for my ${message.replacements['(wife|brother)'][0]}, actually!`);
    });
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

jive.tell("Hi, my name is Chad. How are you this evening?").then(console.log);
//=> "Hi Chad! I'm doing fine this evening, thank you!"

jive.tell("I thought you were doing terribly and super depressed, honestly.").then(console.log);
//=> "Well, technically I am super depressed, but it's not unmanageable."

jive.tell("Oh, by the way, is your wife doing better?").then(console.log);
//=> "Yep! Really lucky: full recovery for my wife, actually!"
```

## Debugging

Pass `{ debug: true }` to the `JiveScript` constructor (or set `jive.options.debug = true` after initialization) to get debugging output to the console.

## Playground

Try it out [in the JSFiddle here](https://jsfiddle.net/keegan_openbay/qwg9uvm3). **Note:** That link isn't guaranteed to be up-to-date, though, depending on the release. So, if you want to make sure you have all the bells and whistles, do the following:

```
git clone https://github.com/kjleitz/jivescript
cd jivescript
yarn install # or npm install
yarn serve # or npm run serve
```

...and navigate to http://localhost:8080/demo.html, where you can play around.

## Contributing

Bug reports and pull requests for this project are welcome at its [GitHub page](https://github.com/kjleitz/jivescript). If you choose to contribute, please be nice so I don't have to run out of bubblegum, etc.

## License

This project is open source, under the terms of the [MIT license](https://github.com/kjleitz/jivescript/blob/master/LICENSE).
