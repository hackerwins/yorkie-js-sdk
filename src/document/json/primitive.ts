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

import Long from 'long';
import { Code, YorkieError } from '../../util/error';
import { TimeTicket } from '../time/ticket';
import { JSONElement } from './element';

export enum PrimitiveType {
  Null = 0,
  Boolean = 1,
  Integer = 2,
  Long = 3,
  Double = 4,
  String = 5,
  Bytes = 6,
  Date = 7
}

type PrimitiveValue = boolean | number | Long | string | Uint8Array | Date;

/**
 * Primitive represents JSON primitive data type including logical lock.
 * This is immutable.
 */
export class JSONPrimitive extends JSONElement {
  private valueType: PrimitiveType;
  private value: PrimitiveValue;

  constructor(value: PrimitiveValue, createdAt: TimeTicket) {
    super(createdAt);
    this.valueType = JSONPrimitive.getPrimitiveType(value);
    this.value = value;
  }

  public static of(value: PrimitiveValue, createdAt: TimeTicket): JSONPrimitive {
    return new JSONPrimitive(value, createdAt);
  }

  public static valueFromBytes(primitiveType: PrimitiveType, bytes: Uint8Array): PrimitiveValue {
    switch(primitiveType) {
      case PrimitiveType.Boolean:
        return bytes[0] ? true : false;
      case PrimitiveType.Integer:
        return bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
      case PrimitiveType.String:
        return decodeURIComponent(escape(atob(
          String.fromCharCode.apply(null, bytes)
        )));
      default:
        throw new YorkieError(Code.Unimplemented, `unimplemented type: ${primitiveType}`);
    }
  }

  public toJSON(): string {
    return `"${this.value}"`;
  }

  public toSortedJSON(): string {
    return `"${this.value}"`;
  }

  public deepcopy(): JSONPrimitive {
    return this;
  }

  public getType(): PrimitiveType {
    return this.valueType;
  }

  public static getPrimitiveType(value: PrimitiveValue): PrimitiveType {
    switch (typeof value) {
      case 'boolean':
        return PrimitiveType.Boolean;
      case 'number':
        if (JSONPrimitive.isInteger(value)) {
          return PrimitiveType.Integer;
        }
        return PrimitiveType.Double;
      case 'string':
        return PrimitiveType.String;
      case 'object':
        if (value instanceof Long) {
          return PrimitiveType.Long;
        } else if (value instanceof Uint8Array) {
          return PrimitiveType.Bytes;
        } else if (value instanceof Date) {
          return PrimitiveType.Date;
        }
    }

    return null;
  }

  public static isSupport(value: PrimitiveValue): boolean {
    return !!JSONPrimitive.getPrimitiveType(value);
  }

  public static isInteger(num: number): boolean {
    return num % 1 === 0;
  }

  public getValue(): PrimitiveValue {
    return this.value;
  }

  public toBytes(): Uint8Array {
    switch (this.valueType) {
      case PrimitiveType.Boolean: {
        const boolVal = this.value as boolean;
        return boolVal ? new Uint8Array([1]) : new Uint8Array([0]);
      }
      case PrimitiveType.Integer: {
        const intVal = this.value as number;
        return new Uint8Array([
          intVal & 0xff,
          (intVal >> 8) & 0xff,
          (intVal >> 16) & 0xff,
          (intVal >> 24) & 0xff
        ]);
      }
      case PrimitiveType.String: {
        const str = this.value as string;
        const bytes = [];
        for (const ch of btoa(unescape(encodeURIComponent(str)))) {
          bytes.push(ch.charCodeAt(0));
        }
        return new Uint8Array(bytes);
      }
      default:
        throw new YorkieError(Code.Unimplemented, `unimplemented type: ${this.valueType}`);
    }
  }
}
