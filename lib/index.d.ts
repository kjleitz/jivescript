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
interface TriggerTier {
    current: Trigger[];
    parent: TriggerTier | null;
}
interface TriggerMatchInfo {
    trigger: Trigger;
    interpreted: Message['interpreted'];
    pattern: Message['pattern'];
    patternIndex: Message['patternIndex'];
}
declare const patternToRegex: (pattern: string) => RegExp;
declare const formatTextForTrigger: (text: string) => string;
declare const matchTextToTrigger: (text: string, triggers: Trigger[]) => TriggerMatchInfo | null;
declare class RavaScript {
    triggerTier: TriggerTier;
    lastResponse?: string;
    constructor();
    private readonly triggers;
    private matchTrigger;
    tell(text: string): Promise<string>;
    hear(pattern: string | string[], callback: Trigger['callback']): void;
    say(responseText: string, callback?: () => void | Promise<void>): void;
}
declare const rs: RavaScript;
