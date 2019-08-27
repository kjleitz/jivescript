import JiveScript from '../src/index';

const jive = new JiveScript();

jive.hear('cool', () => {
  jive.say('Sweet.');
});

describe('tell', () => {
  it('responds with a default error message if there are no matches', () => {
    return jive.tell("I'm looking for a man named Scoopydoops McFarland.").then((response) => {
      expect(response).toMatch(/error/i);
    })
  });
});
