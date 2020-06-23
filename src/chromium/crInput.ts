/**
 * Copyright 2017 Google Inc. All rights reserved.
 * Modifications copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as input from '../input';
import * as types from '../types';
import { CRSession } from './crConnection';

function toModifiersMask(modifiers: Set<types.KeyboardModifier>): number {
  let mask = 0;
  if (modifiers.has('Alt'))
    mask |= 1;
  if (modifiers.has('Control'))
    mask |= 2;
  if (modifiers.has('Meta'))
    mask |= 4;
  if (modifiers.has('Shift'))
    mask |= 8;
  return mask;
}

export class RawKeyboardImpl implements input.RawKeyboard {
  private _client: CRSession;

  constructor(client: CRSession) {
    this._client = client;
  }

  async keydown(modifiers: Set<types.KeyboardModifier>, code: string, keyCode: number, keyCodeWithoutLocation: number, key: string, location: number, autoRepeat: boolean, text: string | undefined): Promise<void> {
    await this._client.send('Input.dispatchKeyEvent', {
      type: text ? 'keyDown' : 'rawKeyDown',
      modifiers: toModifiersMask(modifiers),
      windowsVirtualKeyCode: keyCodeWithoutLocation,
      code,
      key,
      text,
      unmodifiedText: text,
      autoRepeat,
      location,
      isKeypad: location === input.keypadLocation
    });
  }

  async keyup(modifiers: Set<types.KeyboardModifier>, code: string, keyCode: number, keyCodeWithoutLocation: number, key: string, location: number): Promise<void> {
    await this._client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      modifiers: toModifiersMask(modifiers),
      key,
      windowsVirtualKeyCode: keyCodeWithoutLocation,
      code,
      location
    });
  }

  async sendText(text: string): Promise<void> {
    await this._client.send('Input.insertText', { text });
  }
}

export class RawMouseImpl implements input.RawMouse {
  private _client: CRSession;

  constructor(client: CRSession) {
    this._client = client;
  }

  async move(x: number, y: number, button: types.MouseButton | 'none', buttons: Set<types.MouseButton>, modifiers: Set<types.KeyboardModifier>): Promise<void> {
    await this._client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      button,
      x,
      y,
      modifiers: toModifiersMask(modifiers)
    });
  }

  async down(x: number, y: number, button: types.MouseButton, buttons: Set<types.MouseButton>, modifiers: Set<types.KeyboardModifier>, clickCount: number): Promise<void> {
    await this._client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button,
      x,
      y,
      modifiers: toModifiersMask(modifiers),
      clickCount
    });
  }

  async up(x: number, y: number, button: types.MouseButton, buttons: Set<types.MouseButton>, modifiers: Set<types.KeyboardModifier>, clickCount: number): Promise<void> {
    await this._client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      button,
      x,
      y,
      modifiers: toModifiersMask(modifiers),
      clickCount
    });
  }
}
