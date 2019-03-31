# JiveScript

Simple and lightweight chatbot framework

## example

```js
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
```
