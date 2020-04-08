/*
 * Copyright 2020 The Yorkie Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '../../util/logger';
import { SplayNode, SplayTree } from '../../util/splay_tree';
import { InitialTimeTicket, TimeTicket } from '../time/ticket';
import { JSONElement } from './element';
import { JSONPrimitive } from './primitive';

class RGATreeListNode extends SplayNode<JSONElement> {
  private prev: RGATreeListNode;
  private next: RGATreeListNode;

  constructor(value: JSONElement) {
    super(value);
    this.value = value;
    this.prev = null;
    this.next = null;
  }

  public static createAfter(prev: RGATreeListNode, value: JSONElement): RGATreeListNode {
    const newNode = new RGATreeListNode(value);
    const prevNext = prev.next;
    prev.next = newNode;
    newNode.prev = prev;
    newNode.next = prevNext;
    if (prevNext) {
      prevNext.prev = newNode;
    }

    return newNode;
  }

  public remove(deletedAt: TimeTicket): boolean {
    return this.value.delete(deletedAt);
  }

  public getCreatedAt(): TimeTicket {
    return this.value.getCreatedAt();
  }

  public getLength(): number {
    return this.value.isDeleted() ? 0 : 1;
  }

  public getNext(): RGATreeListNode {
    return this.next;
  }

  public getValue(): JSONElement {
    return this.value;
  }

  public isRemoved(): boolean {
    return this.value.isDeleted();
  }
}

/**
 * RGATreeList is replicated growable array.
 */
export class RGATreeList {
  private dummyHead: RGATreeListNode;
  private last: RGATreeListNode;
  private size: number;
  private nodeMapByIndex: SplayTree<JSONElement>;
  private nodeMapByCreatedAt: Map<string, RGATreeListNode>;

  constructor() {
    const dummyValue = JSONPrimitive.of(0, InitialTimeTicket);
    dummyValue.delete(InitialTimeTicket);
    this.dummyHead = new RGATreeListNode(dummyValue);
    this.last = this.dummyHead;
    this.size = 0;
    this.nodeMapByIndex = new SplayTree();
    this.nodeMapByCreatedAt = new Map();

    this.nodeMapByIndex.insert(this.dummyHead);
    this.nodeMapByCreatedAt.set(
      this.dummyHead.getCreatedAt().toIDString(),
      this.dummyHead
    );
  }

  public static create(): RGATreeList {
    return new RGATreeList();
  }

  public get length(): number {
    return this.size; 
  }

  private findByCreatedAt(prevCreatedAt: TimeTicket, createdAt: TimeTicket): RGATreeListNode {
    let node = this.nodeMapByCreatedAt.get(prevCreatedAt.toIDString());
    if (!node) {
      logger.fatal(`cant find the given node: ${prevCreatedAt.toIDString()}`);
    }

    while (node.getNext() && node.getNext().getCreatedAt().after(createdAt)) {
      node = node.getNext();
    }

    return node;
  }

  public insertAfter(prevCreatedAt: TimeTicket, value: JSONElement): void {
    const prevNode = this.findByCreatedAt(prevCreatedAt, value.getCreatedAt());
    const newNode = RGATreeListNode.createAfter(prevNode, value);
    if (prevNode === this.last) {
      this.last = newNode;
    }

    this.nodeMapByIndex.insertAfter(prevNode, newNode);
    this.nodeMapByCreatedAt.set(newNode.getCreatedAt().toIDString(), newNode);

    this.size += 1;
  }

  public insert(value: JSONElement): void {
    this.insertAfter(this.last.getCreatedAt(), value);
  }

  public get(createdAt: TimeTicket): JSONElement {
    const node = this.nodeMapByCreatedAt.get(createdAt.toIDString());
    return node.getValue();
  }

  public getByIndex(idx: number): RGATreeListNode {
    const [node, offset] = this.nodeMapByIndex.find(idx);
    let rgaNode = node as RGATreeListNode;

    if (idx === 0 && node === this.dummyHead) {
      do {
        rgaNode = rgaNode.getNext();
      } while(rgaNode.isRemoved());
    } else if (offset > 0) {
      do {
        rgaNode = rgaNode.getNext();
      } while(rgaNode.isRemoved());
    }

    return rgaNode;
  }

  public remove(createdAt: TimeTicket, editedAt: TimeTicket): JSONElement {
    const node = this.nodeMapByCreatedAt.get(createdAt.toIDString());
    if (node.remove(editedAt)) {
      this.nodeMapByIndex.splayNode(node);
      this.size -= 1;
    }
    return node.getValue();
  }

  public removeByIndex(index: number, editedAt: TimeTicket): JSONElement {
    const node = this.getByIndex(index);
    if (node.remove(editedAt)) {
      this.nodeMapByIndex.splayNode(node);
      this.size -= 1;
    }
    return node.getValue();
  }

  public getLast(): JSONElement {
    return this.last.getValue();
  }

  public getLastCreatedAt(): TimeTicket {
    return this.last.getCreatedAt();
  }

  public getAnnotatedString(): string {
    const json = [];

    for (const node of this) {
      const elem = `${node.getCreatedAt().toIDString()}:${node.getValue().toJSON()}`;
      if (node.isRemoved()) {
        json.push(`{${elem}}`);
      } else {
        json.push(`[${elem}]`);
      }
    }

    return json.join('');
  }

  public *[Symbol.iterator](): IterableIterator<RGATreeListNode> {
    let node = this.dummyHead.getNext();
    while(node) {
      yield node;
      node = node.getNext();
    }
  }
}
