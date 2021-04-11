## API Report File for "yorkie-js-sdk"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { default as Long_2 } from 'long';

// @public (undocumented)
export type ActorID = string;

// @public (undocumented)
export interface Change {
    // (undocumented)
    actor: ActorID;
    // (undocumented)
    attributes?: {
        [key: string]: string;
    };
    // (undocumented)
    content?: string;
    // (undocumented)
    from: number;
    // (undocumented)
    to: number;
    // (undocumented)
    type: ChangeType;
}

// @public (undocumented)
export enum ChangeType {
    // (undocumented)
    Content = "content",
    // (undocumented)
    Selection = "selection",
    // (undocumented)
    Style = "style"
}

// Warning: (ae-forgotten-export) The symbol "Observable" needs to be exported by the entry point yorkie.d.ts
// Warning: (ae-forgotten-export) The symbol "ClientEvent" needs to be exported by the entry point yorkie.d.ts
//
// @public
export class Client implements Observable<ClientEvent> {
    // Warning: (ae-forgotten-export) The symbol "ClientOptions" needs to be exported by the entry point yorkie.d.ts
    constructor(rpcAddr: string, opts?: ClientOptions);
    activate(): Promise<void>;
    attach(doc: Document_2<unknown>, isManualSync?: boolean): Promise<Document_2<unknown>>;
    deactivate(): Promise<void>;
    detach(doc: Document_2<unknown>): Promise<Document_2<unknown>>;
    getID(): string | undefined;
    getKey(): string;
    isActive(): boolean;
    // Warning: (ae-forgotten-export) The symbol "Observer" needs to be exported by the entry point yorkie.d.ts
    // Warning: (ae-forgotten-export) The symbol "NextFn" needs to be exported by the entry point yorkie.d.ts
    // Warning: (ae-forgotten-export) The symbol "ErrorFn" needs to be exported by the entry point yorkie.d.ts
    // Warning: (ae-forgotten-export) The symbol "CompleteFn" needs to be exported by the entry point yorkie.d.ts
    // Warning: (ae-forgotten-export) The symbol "Unsubscribe" needs to be exported by the entry point yorkie.d.ts
    subscribe(nextOrObserver: Observer<ClientEvent> | NextFn<ClientEvent>, error?: ErrorFn, complete?: CompleteFn): Unsubscribe;
    sync(): Promise<Document_2<unknown>[]>;
    }

// Warning: (ae-forgotten-export) The symbol "Indexable" needs to be exported by the entry point yorkie.d.ts
// Warning: (ae-forgotten-export) The symbol "DocEvent" needs to be exported by the entry point yorkie.d.ts
//
// @public
class Document_2<T = Indexable> implements Observable<DocEvent> {
    constructor(collection: string, document: string);
    // Warning: (ae-forgotten-export) The symbol "ChangePack" needs to be exported by the entry point yorkie.d.ts
    applyChangePack(pack: ChangePack): void;
    static create<T = Indexable>(collection: string, document: string): Document_2<T>;
    createChangePack(): ChangePack;
    ensureClone(): void;
    garbageCollect(ticket: TimeTicket): number;
    // Warning: (ae-forgotten-export) The symbol "Checkpoint" needs to be exported by the entry point yorkie.d.ts
    getCheckpoint(): Checkpoint;
    getClone(): JSONObject | undefined;
    // Warning: (ae-forgotten-export) The symbol "DocumentKey" needs to be exported by the entry point yorkie.d.ts
    getDocumentKey(): DocumentKey;
    getGarbageLen(): number;
    getKey(): string;
    getRoot(): T;
    getRootObject(): JSONObject;
    hasLocalChanges(): boolean;
    setActor(actorID: ActorID): void;
    subscribe(nextOrObserver: Observer<DocEvent> | NextFn<DocEvent>, error?: ErrorFn, complete?: CompleteFn): Unsubscribe;
    toJSON(): string;
    toSortedJSON(): string;
    update(updater: (root: T & JSONObject) => void, message?: string): void;
}

export { Document_2 as Document }

// Warning: (ae-forgotten-export) The symbol "ClientEventType" needs to be exported by the entry point yorkie.d.ts
// Warning: (ae-forgotten-export) The symbol "DocEventType" needs to be exported by the entry point yorkie.d.ts
//
// @public (undocumented)
export type EventType = ClientEventType | DocEventType;

// Warning: (ae-forgotten-export) The symbol "JSONContainer" needs to be exported by the entry point yorkie.d.ts
//
// @public
export class JSONArray extends JSONContainer {
    // (undocumented)
    [Symbol.iterator](): IterableIterator<JSONElement>;
    // Warning: (ae-forgotten-export) The symbol "RGATreeList" needs to be exported by the entry point yorkie.d.ts
    constructor(createdAt: TimeTicket, elements: RGATreeList);
    static create(createdAt: TimeTicket): JSONArray;
    deepcopy(): JSONArray;
    delete(createdAt: TimeTicket, editedAt: TimeTicket): JSONElement;
    deleteByIndex(index: number, editedAt: TimeTicket): JSONElement | undefined;
    get(createdAt: TimeTicket): JSONElement;
    getByIndex(index: number): JSONElement | undefined;
    getDescendants(callback: (elem: JSONElement, parent: JSONContainer) => boolean): void;
    getElements(): RGATreeList;
    getLast(): JSONElement;
    getLastCreatedAt(): TimeTicket;
    getPrevCreatedAt(createdAt: TimeTicket): TimeTicket;
    insertAfter(prevCreatedAt: TimeTicket, value: JSONElement): void;
    keyOf(createdAt: TimeTicket): string | undefined;
    get length(): number;
    moveAfter(prevCreatedAt: TimeTicket, createdAt: TimeTicket, executedAt: TimeTicket): void;
    purge(element: JSONElement): void;
    toJSON(): string;
    toSortedJSON(): string;
}

// @public
export abstract class JSONElement {
    constructor(createdAt: TimeTicket);
    // (undocumented)
    abstract deepcopy(): JSONElement;
    getCreatedAt(): TimeTicket;
    getID(): TimeTicket;
    getMovedAt(): TimeTicket | undefined;
    getRemovedAt(): TimeTicket | undefined;
    isRemoved(): boolean;
    remove(removedAt?: TimeTicket): boolean;
    setMovedAt(movedAt?: TimeTicket): boolean;
    // (undocumented)
    abstract toJSON(): string;
    // (undocumented)
    abstract toSortedJSON(): string;
}

// @public
export class JSONObject extends JSONContainer {
    // (undocumented)
    [Symbol.iterator](): IterableIterator<[string, JSONElement]>;
    // Warning: (ae-forgotten-export) The symbol "RHTPQMap" needs to be exported by the entry point yorkie.d.ts
    constructor(createdAt: TimeTicket, memberNodes: RHTPQMap);
    static create(createdAt: TimeTicket): JSONObject;
    // Warning: (ae-forgotten-export) The symbol "CounterType" needs to be exported by the entry point yorkie.d.ts
    // Warning: (ae-forgotten-export) The symbol "CounterProxy" needs to be exported by the entry point yorkie.d.ts
    createCounter(key: string, value: CounterType): CounterProxy;
    createRichText(key: string): RichText;
    createText(key: string): PlainText;
    deepcopy(): JSONObject;
    delete(createdAt: TimeTicket, executedAt: TimeTicket): JSONElement;
    deleteByKey(key: string, executedAt: TimeTicket): JSONElement | undefined;
    get(key: string): JSONElement | undefined;
    getDescendants(callback: (elem: JSONElement, parent: JSONContainer) => boolean): void;
    getKeys(): Array<string>;
    getRHT(): RHTPQMap;
    has(key: string): boolean;
    keyOf(createdAt: TimeTicket): string | undefined;
    purge(value: JSONElement): void;
    set(key: string, value: JSONElement): void;
    toJSON(): string;
    toSortedJSON(): string;
}

// Warning: (ae-forgotten-export) The symbol "TextElement" needs to be exported by the entry point yorkie.d.ts
//
// @public
export class PlainText extends TextElement {
    // Warning: (ae-forgotten-export) The symbol "RGATreeSplit" needs to be exported by the entry point yorkie.d.ts
    constructor(rgaTreeSplit: RGATreeSplit<string>, createdAt: TimeTicket);
    cleanupRemovedNodes(ticket: TimeTicket): number;
    static create(rgaTreeSplit: RGATreeSplit<string>, createdAt: TimeTicket): PlainText;
    createRange(fromIdx: number, toIdx: number): RGATreeSplitNodeRange;
    deepcopy(): PlainText;
    edit(fromIdx: number, toIdx: number, content: string): PlainText;
    // Warning: (ae-forgotten-export) The symbol "RGATreeSplitNodeRange" needs to be exported by the entry point yorkie.d.ts
    editInternal(range: RGATreeSplitNodeRange, content: string, editedAt: TimeTicket, latestCreatedAtMapByActor?: Map<string, TimeTicket>): Map<string, TimeTicket>;
    getAnnotatedString(): string;
    getRemovedNodesLen(): number;
    getRGATreeSplit(): RGATreeSplit<string>;
    getValue(): string;
    hasRemoteChangeLock(): boolean;
    onChanges(handler: (changes: Array<Change>) => void): void;
    select(fromIdx: number, toIdx: number): void;
    selectInternal(range: RGATreeSplitNodeRange, updatedAt: TimeTicket): void;
    toJSON(): string;
    toSortedJSON(): string;
}

// @public
export class RichText extends TextElement {
    // Warning: (ae-forgotten-export) The symbol "RichTextValue" needs to be exported by the entry point yorkie.d.ts
    constructor(rgaTreeSplit: RGATreeSplit<RichTextValue>, createdAt: TimeTicket);
    cleanupRemovedNodes(ticket: TimeTicket): number;
    static create(rgaTreeSplit: RGATreeSplit<RichTextValue>, createdAt: TimeTicket): RichText;
    createRange(fromIdx: number, toIdx: number): RGATreeSplitNodeRange;
    deepcopy(): RichText;
    edit(fromIdx: number, toIdx: number, content: string, attributes?: {
        [key: string]: string;
    }): RichText;
    editInternal(range: RGATreeSplitNodeRange, content: string, editedAt: TimeTicket, attributes?: {
        [key: string]: string;
    }, latestCreatedAtMapByActor?: Map<string, TimeTicket>): Map<string, TimeTicket>;
    getAnnotatedString(): string;
    getRemovedNodesLen(): number;
    getRGATreeSplit(): RGATreeSplit<RichTextValue>;
    // Warning: (ae-forgotten-export) The symbol "RichTextVal" needs to be exported by the entry point yorkie.d.ts
    getValue(): Array<RichTextVal>;
    hasRemoteChangeLock(): boolean;
    onChanges(handler: (changes: Array<Change>) => void): void;
    select(fromIdx: number, toIdx: number): void;
    selectInternal(range: RGATreeSplitNodeRange, updatedAt: TimeTicket): void;
    setStyle(fromIdx: number, toIdx: number, key: string, value: string): RichText;
    setStyleInternal(range: RGATreeSplitNodeRange, attributes: {
        [key: string]: string;
    }, editedAt: TimeTicket): void;
    toJSON(): string;
    toSortedJSON(): string;
}

// @public
export class TimeTicket {
    constructor(lamport: Long_2, delimiter: number, actorID?: string);
    after(other: TimeTicket): boolean;
    compare(other: TimeTicket): number;
    equals(other: TimeTicket): boolean;
    getActorID(): string | undefined;
    getAnnotatedString(): string;
    getDelimiter(): number;
    getLamportAsString(): string;
    static of(lamport: Long_2, delimiter: number, actorID?: string): TimeTicket;
    setActor(actorID: ActorID): TimeTicket;
    toIDString(): string;
}

// @public
const yorkie: {
    createClient(rpcAddr: string, opts?: ClientOptions | undefined): Client;
    createDocument<T = Indexable>(collection: string, document: string): Document_2<T>;
    Long: Long_2.LongConstructor;
};

export default yorkie;


// (No @packageDocumentation comment for this package)

```