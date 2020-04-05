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

import { logger, LogLevel } from '../../util/logger';
import { TimeTicket } from '../time/ticket';
import { AddOperation } from '../operation/add_operation';
import { RemoveOperation } from '../operation/remove_operation';
import { ChangeContext } from '../change/context';
import { JSONElement } from '../json/element';
import { JSONObject } from '../json/object';
import { JSONArray } from '../json/array';
import { JSONPrimitive } from '../json/primitive';
import { ObjectProxy } from './object_proxy';
import { toProxy } from './proxy';

export class ArrayProxy {
  private context: ChangeContext;
  private handlers: any;
  private array: JSONArray;

  constructor(context: ChangeContext, array: JSONArray) {
    this.context = context;
    this.array = array;
    this.handlers = {
      get: (target: JSONArray, method: string|symbol): any => {
        if (method === 'getID') {
          return (): TimeTicket => {
            return target.getCreatedAt();
          }; 
        } else if (method === 'getElementByID') {
          return (createdAt: TimeTicket): JSONElement => {
            return toProxy(context, target.get(createdAt));
          }; 
        } else if (method === 'getElementByIndex') {
          return (index: number): JSONElement => {
            const elem = target.getByIndex(index);
            if (elem instanceof JSONPrimitive) {
              return elem;
            }
            return toProxy(context, elem);
          }; 
        } else if (method === 'getLast') {
          return (): JSONElement => {
            return toProxy(context, target.getLast());
          };
        } else if (method === 'removeByID') {
          return (createdAt: TimeTicket): JSONElement => {
            const removed = ArrayProxy.removeInternalByID(context, target, createdAt);
            return toProxy(context, removed);
          }; 
        } else if (method === 'push') {
          return (value: any): number => {
            if (logger.isEnabled(LogLevel.Trivial)) {
              logger.trivial(`array.push(${JSON.stringify(value)})`);
            }

            return ArrayProxy.pushInternal(context, target, value);
          }; 
        } else if (method === 'length') {
          return target.length;
        } else if (method === Symbol.iterator) {
          return ArrayProxy.iteratorInternal.bind(this, context, target);
        }

        throw new TypeError(`Unsupported method: ${String(method)}`);
      },
      deleteProperty: (target: JSONArray, key: number): boolean => {
        if (logger.isEnabled(LogLevel.Trivial)) {
          logger.trivial(`array[${key}]`);
        }

        ArrayProxy.removeInternalByIndex(context, target, key);
        return true;
      }
    }
  }

  public static *iteratorInternal(change: ChangeContext, target: JSONArray): IterableIterator<any> {
    for (const elem of target) {
      yield toProxy(change, elem);
    }
  }

  public static create(context: ChangeContext, target: JSONArray): JSONArray {
    const arrayProxy = new ArrayProxy(context, target);
    return new Proxy(target, arrayProxy.getHandlers());
  }

  public static pushInternal(context: ChangeContext, target: JSONArray, value: any): number {
    const ticket = context.issueTimeTicket();
    const prevCreatedAt = target.getLastCreatedAt();

    if (JSONPrimitive.isSupport(value)) {
      const primitive = JSONPrimitive.of(value, ticket);
      target.insertAfter(prevCreatedAt, primitive);
      context.registerElement(primitive);
      context.push(AddOperation.create(target.getCreatedAt(), prevCreatedAt, primitive, ticket));
      return target.length;
    } else if (Array.isArray(value)) {
      const array = JSONArray.create(ticket);
      target.insertAfter(prevCreatedAt, array);
      context.registerElement(array);
      context.push(AddOperation.create(target.getCreatedAt(), prevCreatedAt, array, ticket));
      for (const element of value) {
        ArrayProxy.pushInternal(context, array, element)
      }
      return target.length;
    } else if (typeof value === 'object') {
      const obj = JSONObject.create(ticket);
      target.insertAfter(prevCreatedAt, obj);
      context.registerElement(obj);
      context.push(AddOperation.create(target.getCreatedAt(), prevCreatedAt, obj, ticket));

      for (const [k, v] of Object.entries(value)) {
        ObjectProxy.setInternal(context, obj, k, v);
      }
      return target.length;
    } else {
      throw new TypeError(`Unsupported type of value: ${typeof value}`)
    }
  }

  public static removeInternalByIndex(context: ChangeContext, target: JSONArray, index: number): JSONElement {
    const ticket = context.issueTimeTicket();
    const removed = target.removeByIndex(index, ticket);
    context.push(RemoveOperation.create(target.getCreatedAt(), removed.getCreatedAt(), ticket));

    return removed;
  }

  public static removeInternalByID(context: ChangeContext, target: JSONArray, createdAt: TimeTicket): JSONElement {
    const ticket = context.issueTimeTicket();
    const removed = target.remove(createdAt, ticket);
    context.push(RemoveOperation.create(target.getCreatedAt(), removed.getCreatedAt(), ticket));
    return removed;
  }

  public getHandlers(): any {
    return this.handlers;
  }
}
