interface Message {
  text: string; // original text of the message, unchanged
  interpreted: string; // interpreted text of the message (how RS sees it: lowercase, no special chars, etc.)
  pattern: string; // which of the patterns you supplied to `jive.hear(pattern1, pattern2, ...)` matched the message text
  patternIndex: number; // the index (starting with 0) of the pattern that matched (always 0 if you only supply one)
  replacements: { [placeholder: string]: string[] }; // e.g., if you did `jive.hear('so [*] uh [*] hi * i am [*] hungry are (you|yall) too')`,
}                                                    // and the user says 'So uh, oh well. Hi Keegan! I am hungry. Are you, too?', then
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
  replacements: Message['replacements'];
}

const regexCache: { [index: string]: RegExp } = {};
const patternToRegex = (pattern: string, options: Partial<JiveScript['options']>): RegExp => {
  const { cacheRegexes, debug } = options;
  if (cacheRegexes && regexCache[pattern]) {
    if (debug) console.log(`Regex: ${regexCache[pattern]} (from cache)`);
    return regexCache[pattern];
  }

  const regexString = pattern
    .toLowerCase()
    .replace(/ +/g, ' ') // condense whitespace
    .replace(/[^a-z0-9*\[\]\(\)| ]/g, '') // remove invalid characters
    .replace(/ \[\*\]/g, '( .+?)?') // optional wildcards anywhere but the beginning of the string (all of these must have spaces beforehand)
    .replace(/\[\*\] /g, '(.+? )?') // optional wildcards potentially at the beginning of the string (this one will have a space after it)
    .replace(/\*/g, '(.+?)') // required wildcards
    .replace(/ \[([^\]]*)\]/g, '( $1)?') // optional groups anywhere but the beginning of the string (all of these must have spaces beforehand)
    .replace(/\[([^\]]*)\] /g, '($1 )?') // optional group potentially at the beginning of the string (this one will have a space after it)
    .trim();
  
  const regex = new RegExp(`^${regexString}$`);
  if (cacheRegexes) regexCache[pattern] = regex;

  if (debug) console.log(`Regex: ${regex}`);
  return regex;
};

const formatTextForTrigger = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9 ]/ig, '');
};

const replacementsForPatternMatch = (pattern: string, match: RegExpMatchArray): Record<string, string[]> => {
  const groupsInPattern = pattern.match(/\*|\([^)]*\)|\[[^\]]*\]/g);
  if (!groupsInPattern) return {};
  return match.slice(1).reduce((memo, groupMatch, index) => {
    const patternGroup = groupsInPattern[index];
    const existingMatches = memo[patternGroup] || [];
    return Object.assign(memo, { [patternGroup]: [...existingMatches, groupMatch && groupMatch.trim()] });
  }, {} as Record<string, string[]>);
};

const matchTextToTrigger = (text: string, triggers: Trigger[], options: Partial<JiveScript['options']>): null|TriggerMatchInfo => {
  const { debug } = options;
  const interpreted = formatTextForTrigger(text);
  if (debug) console.log(`Checking "${interpreted}" against triggers...`);
  for (const trigger of triggers) {
    const { patterns } = trigger;
    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const pattern = patterns[patternIndex];
      if (debug) console.log(`Trigger pattern #${patternIndex + 1}: "${pattern}"`);
      const match = interpreted.match(patternToRegex(pattern, options));
      if (match) {
        if (debug) console.log(`Found a match!`);
        return {
          trigger,
          interpreted,
          pattern,
          patternIndex,
          replacements: replacementsForPatternMatch(pattern, match),
        }
      }
    }
  }
  return null;
}

class JiveScript {
  private triggerTier: TriggerTier;
  public currentResponse: string|null;
  public lastResponse: string|null;
  public options: {
    cacheRegexes: boolean;
    debug: boolean;
  }

  constructor({ cacheRegexes = true, debug = false } = {}) {
    this.options = { cacheRegexes, debug };
    this.currentResponse = null;
    this.lastResponse = null;
    this.triggerTier = {
      current: [],
      parent: null,
    }
  }

  private debug(level: 'log'|'warn'|'error', text: string): void {
    if (this.options.debug) console[level](text);
  }

  private log = this.debug.bind(this, 'log');
  private warn = this.debug.bind(this, 'warn');
  private error = this.debug.bind(this, 'error');

  private get triggers(): Trigger[] {
    return this.triggerTier.current;
  }

  private matchTrigger(text: string): null|TriggerMatchInfo {
    this.log(`Matching "${text}" against the current tier of trigger patterns: "${this.triggers.flatMap(({ patterns }) => patterns).join('", "')}"`)
    const triggerMatch = matchTextToTrigger(text, this.triggers, this.options);
    if (triggerMatch || !this.triggerTier.parent) return triggerMatch;

    this.warn('No match found in the current tier of trigger patterns. Falling back to a lower tier of triggers.');
    this.triggerTier = {
      current: this.triggerTier.parent.current,
      parent: this.triggerTier.parent.parent,
    };
    return this.matchTrigger(text);
  }

  hear(pattern: string|string[], callback: Trigger['callback']): void {
    const patterns = typeof pattern === 'string' ? [pattern] : pattern;
    this.log(`Registering the following patterns to use for the next message:\n  - "${patterns.join('\n  - "')}"`)
    this.triggers.push({
      patterns,
      callback,
    });
  }

  say(responseText: string, callback?: () => void|Promise<void>): void {
    this.log(`Using this response: "${responseText}"`);
    this.currentResponse = responseText;
    this.triggerTier = {
      current: [],
      parent: this.triggerTier,
    }
    if (callback) callback();
  };

  tell(text: string): Promise<string> {
    return new Promise((resolve, _reject) => {
      this.log('\nNew message!\n\n');
      const triggerMatch = this.matchTrigger(text);
      if (!triggerMatch) {
        this.error(`Error: No matching trigger found!`);
        resolve('Error: No matching trigger found!');
      } else {
        this.log(`Matching trigger info:\n  ${JSON.stringify(triggerMatch, null, '  ').split('\n').join('  \n')}`)
        const message = Object.assign({ text }, triggerMatch);
        const cbReturn = triggerMatch.trigger.callback(message);
        const cbPromise = cbReturn && cbReturn.then ? cbReturn : new Promise<void>(res => res());
        cbPromise.then(() => {
          if (typeof this.currentResponse === 'string') {
            const response = this.currentResponse;
            this.currentResponse = null;
            this.log(`Responding with: "${response}"`);
            resolve(response);
          } else {
            this.error(`Error: No response to matched trigger! Make sure you:\n  - call say() within the callback passed to hear(), if synchronous\n  - return a Promise (or any thenable) in the callback (which calls say() when resolved) if you're performing something async`);
            resolve('Error: no response to matched trigger!');
          }
        });
      }
    });
  }

  pretendTheySaid(text: string): Promise<string> {
    return new Promise((resolve, _reject) => {
      this.tell(text).then((response) => {
        this.currentResponse = `${this.currentResponse} ${response}`;
        resolve(response);
      });
    });
  }
}

export default JiveScript;
