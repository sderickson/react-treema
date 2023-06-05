import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import {
  args,
  editRootArrayArgs,
  editRootArrayTest,
  editRow,
  noMoreItemsArgs,
  noMoreItemsTest,
  noMorePropsArgs,
  noMorePropsTest,
} from './enter-key';
import { wrapGenericTestInStory, Story } from './utils-storybook';

/**
 * This storybook demonstrates and tests enter key behaviors.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'InteractiveTests/EnterKey',
  component: TreemaRoot,
};

export default meta;

export const EditRow: Story = wrapGenericTestInStory(editRow, args);
export const EditRootArray: Story = wrapGenericTestInStory(editRootArrayTest, editRootArrayArgs);
export const NoMoreProps: Story = wrapGenericTestInStory(noMorePropsTest, noMorePropsArgs);
export const NoMoreItems: Story = wrapGenericTestInStory(noMoreItemsTest, noMoreItemsArgs);
