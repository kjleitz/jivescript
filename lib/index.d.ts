interface Message {
    text: string;
    interpreted: string;
    pattern: string;
    patternIndex: number;
}
interface Trigger {
    patterns: string[];
    callback(message: Message): void | Promise<void>;
}
declare class JiveScript {
    private triggerTier;
    lastResponse?: string;
    constructor();
    private readonly triggers;
    private matchTrigger;
    tell(text: string): Promise<string>;
    hear(pattern: string | string[], callback: Trigger['callback']): void;
    say(responseText: string, callback?: () => void | Promise<void>): void;
}
export default JiveScript;
