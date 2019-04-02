interface Message {
  text: string; // original text of the message, unchanged
  interpreted: string; // interpreted text of the message (how RS sees it: lowercase, no special chars, etc.)
  pattern: string; // which of the patterns you supplied to `jive.hear(pattern1, pattern2, ...)` matched the message text
  patternIndex: number; // the index (starting with 0) of the pattern that matched (always 0 if you only supply one)
  // replacements: { [placeholder: string]: string[] }; // e.g., if you did `jive.hear('so [*] uh [*] hi * i am [*] hungry are (you|yall) too')`,
}                                                       // and the user says 'So uh, oh well. Hi Keegan! I am hungry. Are you, too?', then
                                                        // `replacements` will be `{ '[*]': ['', 'oh well', ''], '*': ['keegan'], '(you|yall)': ['you'] }`

interface Trigger {
  patterns: string[];
  callback(message: Message): void|Promise<void>;
}

interface TriggerTier {
  current: Trigger[];
  parent: TriggerTier|null;
}

interface TriggerMatchInfo {
  trigger: Trigger;
  interpreted: Message['interpreted'];
  pattern: Message['pattern'];
  patternIndex: Message['patternIndex'];
  // replacements: Message['replacements'];
}

const patternToRegex = (pattern: string): RegExp => {
  const regexString = pattern
    .toLowerCase()
    .replace(/ +/g, ' ') // condense whitespace
    .replace(/[^a-z0-9*\[\]\(\)| ]/g, '') // remove invalid characters
    .replace(/\*/g, '(.+?)') // wildcards
    .replace(/ \[([^\]]*)\]/g, '( $1)?') // optional groups anywhere but the beginning of the string (all of these must have spaces beforehand)
    .replace(/\[([^\]]*)\] /g, '($1 )?') // optional group potentially at the beginning of the string (this one will have a space after it)
    .trim();

  return new RegExp(`^${regexString}$`);
};

const formatTextForTrigger = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9 ]/ig, '');
};

const matchTextToTrigger = (text: string, triggers: Trigger[]): null|TriggerMatchInfo => {
  const interpreted = formatTextForTrigger(text);
  for (const trigger of triggers) {
    const { patterns } = trigger;
    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const pattern = patterns[patternIndex];
      const match = interpreted.match(patternToRegex(pattern));
      if (match) {
        return {
          trigger,
          interpreted,
          pattern,
          patternIndex,
        }
      }
    }
  }
  return null;
}

class JiveScript {
  private triggerTier: TriggerTier;
  public lastResponse?: string;

  constructor() {
    this.triggerTier = {
      current: [],
      parent: null,
    }
  }

  private get triggers(): Trigger[] {
    return this.triggerTier.current;
  }

  private matchTrigger(text: string): null|TriggerMatchInfo {
    const triggerMatch = matchTextToTrigger(text, this.triggers);
    if (triggerMatch || !this.triggerTier.parent) return triggerMatch;

    this.triggerTier = {
      current: this.triggerTier.parent.current,
      parent: this.triggerTier.parent.parent,
    };
    return this.matchTrigger(text);
  }

  tell(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const triggerMatch = this.matchTrigger(text);
      if (!triggerMatch) {
        resolve('Error: No matching trigger found!');
      } else {
        const message = Object.assign({ text }, triggerMatch);
        const cbReturn = triggerMatch.trigger.callback(message);
        const cbPromise = cbReturn && cbReturn.then ? cbReturn : new Promise<void>(res => res());
        cbPromise.then(() => resolve(this.lastResponse || 'Error: no response to matched trigger!'));
      }
    });
  }

  hear(pattern: string|string[], callback: Trigger['callback']): void {
    const patterns = typeof pattern === 'string' ? [pattern] : pattern;
    this.triggers.push({
      patterns,
      callback,
    });
  }

  say(responseText: string, callback?: () => void|Promise<void>): void {
    this.lastResponse = responseText;
    this.triggerTier = {
      current: [],
      parent: this.triggerTier,
    }
    if (callback) callback();
  };
}

export default JiveScript;
