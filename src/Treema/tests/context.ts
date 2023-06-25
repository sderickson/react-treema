import * as storybookJest from '@storybook/jest';
import * as storybookTestingLibrary from '@storybook/testing-library';
import * as mainJest from '@jest/globals';
import * as mainTestingLibrary from '@testing-library/react';
import { JsonPointer, TreemaEvent } from '../types';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

type Jest = typeof storybookJest | typeof mainJest;
type TestingLibrary = typeof storybookTestingLibrary | typeof mainTestingLibrary;
const defaultSpeed = 200;
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastPath: JsonPointer | undefined;
let lastData: any;
export const onEvent = (event: TreemaEvent) => {
  if (event.type === 'change_select_event') {
    lastPath = event.path;
  }
  if (event.type === 'change_data_event') {
    lastData = event.data;
  }
};

export class TreemaStorybookTestContext {
  root: HTMLElement;
  treema: HTMLElement;
  testingLibrary: TestingLibrary;
  expect: typeof storybookJest.expect | typeof mainJest.expect;
  speed: number;

  constructor(root: HTMLElement, jest: Jest, testingLibrary: TestingLibrary, speed: number = defaultSpeed) {
    this.root = root;
    if (this.root.getAttribute('data-testid') === 'treema-root') {
      this.treema = this.root;
    } else {
      this.treema = testingLibrary.within(this.root).getByTestId('treema-root');
    }
    this.testingLibrary = testingLibrary;
    this.expect = jest.expect;
    this.speed = speed;
  }

  query() {
    return this.testingLibrary.within(this.root);
  }

  async fireFocus(): Promise<void> {
    await this.testingLibrary.fireEvent.focus(this.treema);
    await sleep(this.speed);
  }

  async fireArrowDown(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'ArrowDown', code: 'ArrowDown' });
    await sleep(this.speed);
  }

  async fireArrowUp(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'ArrowUp', code: 'ArrowUp' });
    await sleep(this.speed);
  }

  async fireArrowLeft(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'ArrowLeft', code: 'ArrowLeft' });
    await sleep(this.speed);
  }

  async fireArrowRight(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'ArrowRight', code: 'ArrowRight' });
    await sleep(this.speed);
  }

  async fireEnter(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'Enter', code: 'Enter' });
    await sleep(this.speed);
  }

  async fireTab(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'Tab', code: 'Tab' });
    await sleep(this.speed);
  }

  async fireBackspace(): Promise<void> {
    await this.testingLibrary.fireEvent.keyDown(this.treema, { key: 'Backspace', code: 'Backspace' });
    await sleep(this.speed);
  }

  async type(input: string): Promise<void> {
    await user.keyboard(input);
    await sleep(this.speed);
  }

  async clear(): Promise<void> {
    await user.clear(this.testingLibrary.within(this.treema).getByRole('textbox'));
  }

  async selectOptions(select: Element, values: string | HTMLElement | string[] | HTMLElement[]): Promise<void> {
    await user.selectOptions(select, values);
    await sleep(this.speed);
  }

  getLastPath(): JsonPointer | undefined {
    return lastPath;
  }

  getData(): any {
    return lastData;
  }
}
