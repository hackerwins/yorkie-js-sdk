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

import { JSONElement } from '../json/element';
import { ChangeContext } from '../change/context';
import { ObjectProxy } from './object_proxy';
import { ArrayProxy } from './array_proxy';
import { JSONObject } from '../json/object';
import { JSONArray } from '../json/array';
import { JSONPrimitive } from '../json/primitive';


export function createProxy(context: ChangeContext, target: JSONObject): JSONObject {
  return ObjectProxy.create(context, target);
}

export function toProxy(context: ChangeContext, elem: JSONElement): any {
  if (elem instanceof JSONPrimitive) {
    const primitive = elem as JSONPrimitive;
    return primitive.getValue();
  } else if (elem instanceof JSONObject) {
    const obj = elem as JSONObject;
    return ObjectProxy.create(context, obj);
  } else if (elem instanceof JSONArray) {
    const array = elem as JSONArray;
    return ArrayProxy.create(context, array);
  } else if (elem === null) {
    return null;
  } else {
    throw new TypeError(`Unsupported type of element: ${typeof elem}`);
  }
}
