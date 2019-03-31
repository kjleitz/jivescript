# JiveScript

Simple & _very_ lightweight chatbot framework.

## Installation

```
yarn add jivescript
```

## Usage

```js
// Your bot's brain:

import JiveScript from 'jivescript';

const jive = new JiveScript();

jive.hear(['hi [*]', 'hello [*]'], () => {
  jive.say('Well, hi there!', () => {
    jive.hear('are you a wizard', () => {
      jive.say('Kinda.');
    });
  });
});

jive.hear(['[*] (um|uh) [*]', '[*] er [*]'], (message) => {
  switch (message.patternIndex) {
    case 0: jive.say("Um, WHAT?"); break;
    case 1: jive.say("u wot m8"); break;
  }
});

jive.hear('cool', (message) => {
  jive.say('Sweet.');
});

jive.hear('repeat after me *', (message) => {
  jive.say(`You said "${message.text}", but technically I heard it as "${message.interpreted}"`);
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
```

## Contributing

Bug reports and pull requests for this project are welcome at its [GitHub page](https://github.com/kjleitz/jivescript). If you choose to contribute, please be nice so I don't have to run out of bubblegum, etc.

## License

This project is open source, under the terms of the [MIT license](https://github.com/kjleitz/jivescript/blob/master/LICENSE).
