import { TreemaRoot } from '../TreemaRoot';
import { within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/react';
import { TreemaStorybookTestContext } from './context';
import * as jest from '@storybook/jest';
import * as testLibrary from '@storybook/testing-library';
import {
  args,
  downStartTest,
  rightOpens,
  skipClosed,
  traverseOpenCollections,
  closeCollections,
  eitherEnd,
} from './keyboard';
import { sleep } from './context';
import { GenericTest } from './types';


/**
 * This storybook demonstrates and tests keyboard and mouse interactions.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'InteractiveTests/Keyboard',
  component: TreemaRoot,
};

export default meta;

type Story = StoryObj<typeof TreemaRoot>;

const wrapGenericTestInStory = (test: GenericTest): Story => {
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

export const DownStart: Story = wrapGenericTestInStory(downStartTest);
export const SkipClosed: Story = wrapGenericTestInStory(skipClosed);
export const RightOpens: Story = wrapGenericTestInStory(rightOpens);
export const TraverseCollections: Story = wrapGenericTestInStory(traverseOpenCollections);
export const CloseCollections: Story = wrapGenericTestInStory(closeCollections);
export const EitherEnd: Story = wrapGenericTestInStory(eitherEnd);