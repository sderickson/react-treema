import { TreemaRoot } from '../TreemaRoot';
import { expect } from '@storybook/jest';
import { within, fireEvent } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/react';
import { noopLib } from '../utils';
import { JsonPointer, TreemaEvent } from '../types';

/**
 * This storybook demosntrates and tests keyboard and mouse interactions.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'KeyboardNav',
  component: TreemaRoot,
};

export default meta;

type Story = StoryObj<typeof TreemaRoot>;


const defaultSpeed = 50;

const fireFocus = async (treema: HTMLElement) => {
  fireEvent.focus(treema);
  await sleep(defaultSpeed);
};

const fireArrowDown = async (treema: HTMLElement) => {
  fireEvent.keyDown(treema, { key: 'ArrowDown', code: 'ArrowDown' });
  await sleep(defaultSpeed);
};

const fireArrowUp = async (treema: HTMLElement) => {
  fireEvent.keyDown(treema, { key: 'ArrowUp', code: 'ArrowUp' });
  await sleep(defaultSpeed);
};
const fireArrowRight = async (treema: HTMLElement) => {
  fireEvent.keyDown(treema, { key: 'ArrowRight', code: 'ArrowRight' });
  await sleep(defaultSpeed);
};
const fireArrowLeft = async (treema: HTMLElement) => {
  fireEvent.keyDown(treema, { key: 'ArrowLeft', code: 'ArrowLeft' });
  await sleep(defaultSpeed);
};

// Function to emulate pausing between interactions
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastPath: JsonPointer | undefined;
const onEvent = (event: TreemaEvent) => {
  if (event.type === 'change_select_event') {
    lastPath = event.path;
  }
};

/**
 * 
 */
export const ArrowKeys: Story = {
  args: {
    schemaLib: noopLib,
    onEvent,
    initOpen: 1,
    data: { name: 'Bob', numbers: ['401-401-1337', ['123-456-7890']], address: 'Mars' },
    schema: {
      type: 'object',
      displayProperty: 'name',
      properties: {
        name: { type: 'string', title: 'NAME' },
        numbers: { type: 'array', items: { 'type': ['string', 'array'] } },
        address: { type: 'string' },
      },
    },
  },

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const root: HTMLElement = canvas.getByTestId('treema-root');
    
    await step('select the top row by pressing the down arrow', async () => {
      await sleep(100);
      await fireFocus(root);
      await fireArrowDown(root);
      expect(lastPath).toEqual('/name');
    });

    await step('up and down skip past closed collections', async () => {
      await fireArrowDown(root);
      expect(lastPath).toEqual('/numbers');
      await fireArrowDown(root);
      expect(lastPath).toEqual('/address');
      await fireArrowUp(root);
      expect(lastPath).toEqual('/numbers');
    });

    await step('right arrow opens a collection', async () => {
      fireArrowRight(root);
      await fireArrowDown(root);
      expect(lastPath).toEqual('/numbers/0');
    });

    await step('up and down traverse open collections', async () => {
      await fireArrowDown(root);
      expect(lastPath).toEqual('/numbers/1');
      await fireArrowDown(root);
      expect(lastPath).toEqual('/numbers/1/0');
      await fireArrowDown(root);
      expect(lastPath).toEqual('/address');
      await fireArrowUp(root);
      expect(lastPath).toEqual('/numbers/1/0');
      await fireArrowUp(root);
      expect(lastPath).toEqual('/numbers/1');
      await fireArrowUp(root);
      expect(lastPath).toEqual('/numbers/0');
    });

    await step('left arrow goes to parent and closes a collection', async () => {
      await fireArrowLeft(root);
      expect(lastPath).toEqual('/numbers');
      await fireArrowLeft(root);
      await fireArrowDown(root);
      expect(lastPath).toEqual('/address');
    });

    await step('down arrow goes no further at bottom', async () => {
      await fireArrowDown(root);
      expect(lastPath).toEqual('/address');
    });

    await step('up arrow wraps around at top', async () => {
      await fireArrowUp(root);
      expect(lastPath).toEqual('/numbers');
      await fireArrowUp(root);
      expect(lastPath).toEqual('/name');
      await fireArrowUp(root);
      expect(lastPath).toEqual('/address');
    });

    await step('right arrow does nothing if not on a collection', async () => {
      await fireArrowRight(root);
      expect(lastPath).toEqual('/address');
    });
  },
};
