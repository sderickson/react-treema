import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { args, deleteAllData } from './delete-key';
import { wrapGenericTestInStory, Story } from './utils-storybook';

/**
 * This storybook demonstrates and tests enter key behaviors.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'InteractiveTests/DeleteKey',
  component: TreemaRoot,
};

export default meta;

export const DeleteAllItems: Story = wrapGenericTestInStory(deleteAllData, args);
