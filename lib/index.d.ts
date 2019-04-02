interface Message {
    text: string;
    interpreted: string;
    pattern: string;
    patternIndex: number;
    replacements: {
        [placeholder: string]: string[];
    };
}
interface Trigger {
    patterns: string[];
    callback(message: Message): void | Promise<void>;
}
declare class JiveScript {
    private triggerTier;
    currentResponse: string | null;
    lastResponse: string | null;
    options: {
        cacheRegexes: boolean;
        debug: boolean;
    };
    constructor({ cacheRegexes, debug }?: {
        cacheRegexes?: boolean | undefined;
        debug?: boolean | undefined;
    });
    private debug;
    private log;
    private warn;
    private error;
    private readonly triggers;
    private matchTrigger;
    tell(text: string): Promise<string>;
    hear(pattern: string | string[], callback: Trigger['callback']): void;
    say(responseText: string, callback?: () => void | Promise<void>): void;
}
export default JiveScript;
