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
import { SetOperation } from '../operation/set_operation';
import { AddOperation } from '../operation/add_operation';
import { RemoveOperation } from '../operation/remove_operation';
import { ChangeContext } from '../change/context';
import { JSONElement } from '../json/element';
import { JSONObject } from '../json/object';
import { JSONArray } from '../json/array';
import { JSONPrimitive } from '../json/primitive';
import { ObjectProxy } from './object_proxy';

export class ArrayProxy {
  private context: ChangeContext;
  private handlers: any;
  private array: JSONArray;

  constructor(context: ChangeContext, array: JSONArray) {
    this.context = context;
    this.array = array;
    this.handlers = {
      get: (target: JSONArray, method: string|Symbol) => {
        if (method === 'push') {
          return (value: any) => {
            if (logger.isEnabled(LogLevel.Trivial)) {
              logger.trivial(`array.push(${JSON.stringify(value)})`);
            }

            ArrayProxy.pushInternal(this.context, target, value);
          }; 
        } else if (method === 'toJSON') {
          return target.toJSON();
        } else if (method === 'length') {
          return target.length;
        } else if (method === Symbol.iterator) {
          return ArrayProxy.iteratorInternal.bind(this.context, target);
        }

        return target[method as any];
      },
      deleteProperty: (target: JSONArray, key: number): boolean => {
        if (logger.isEnabled(LogLevel.Trivial)) {
          logger.trivial(`array[${key}]`);
        }

        ArrayProxy.removeInternal(this.context, target, key);
        return true;
      }
    }
  }

  public static *iteratorInternal(target: JSONArray): IterableIterator<any> {
    for (const elem of target) {
      if (elem instanceof JSONPrimitive) {
        const primitive = elem as JSONPrimitive;
        yield primitive.getValue();
      } else if (elem instanceof JSONObject) {
        const obj = elem as JSONObject;
        yield ObjectProxy.create(this as any, obj);
      } else if (elem instanceof JSONArray) {
        const array = elem as JSONArray;
        yield ArrayProxy.create(this as any, array);
      } else if (elem === null) {
        yield null;
      } else {
        throw new TypeError(`Unsupported type of element: ${typeof elem}`);
      }
    }
  }

  public static create(context: ChangeContext, target: JSONArray): JSONArray {
    const arrayProxy = new ArrayProxy(context, target);
    return new Proxy(target, arrayProxy.getHandlers());
  }

  public static pushInternal(context: ChangeContext, target: JSONArray, value: any): void {
    const ticket = context.issueTimeTicket();
    const prevCreatedAt = target.getLastCreatedAt();

    if (JSONPrimitive.isSupport(value)) {
      const primitive = JSONPrimitive.of(value, ticket);
      target.insertAfter(prevCreatedAt, primitive);
      context.registerElement(primitive);
      context.push(AddOperation.create(target.getCreatedAt(), prevCreatedAt, primitive, ticket));
    } else if (Array.isArray(value)) {
      const array = JSONArray.create(ticket);
      target.insertAfter(prevCreatedAt, array);
      context.registerElement(array);
      context.push(AddOperation.create(target.getCreatedAt(), prevCreatedAt, array, ticket));
      for (const element of value) {
        ArrayProxy.pushInternal(context, array, element)
      }
    } else if (typeof value === 'object') {
      const obj = JSONObject.create(ticket);
      target.insertAfter(prevCreatedAt, obj);
      context.registerElement(obj);
      context.push(AddOperation.create(target.getCreatedAt(), prevCreatedAt, obj, ticket));

      for (const [k, v] of Object.entries(value)) {
        ObjectProxy.setInternal(context, obj, k, v);
      }
    } else {
      throw new TypeError(`Unsupported type of value: ${typeof value}`)
    }
  }

  public static removeInternal(context: ChangeContext, target: JSONArray, index: number): void {
    const ticket = context.issueTimeTicket();
    const removed = target.removeByIndex(index);
    context.push(RemoveOperation.create(target.getCreatedAt(), removed.getCreatedAt(), ticket));
  }

  public getHandlers(): any {
    return this.handlers;
  }
}
