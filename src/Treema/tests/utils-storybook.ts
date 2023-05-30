import { within } from '@storybook/testing-library';
import { TreemaStorybookTestContext } from './context';
import * as jest from '@storybook/jest';
import * as testLibrary from '@storybook/testing-library';
import { sleep } from './context';
import { GenericTest } from './types';
import { TreemaRootProps, TreemaRoot } from '../TreemaRoot';
import type { StoryObj } from '@storybook/react';

export type Story = StoryObj<typeof TreemaRoot>;

export const wrapGenericTestInStory = (test: GenericTest, args: TreemaRootProps): Story => {
  return {
    name: test.name,
    args,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const root: HTMLElement = canvas.getByTestId('treema-root');
      const context = new TreemaStorybookTestContext(root, jest, testLibrary);
      await sleep(100);
      await test.test(context);
    }
  };
};
