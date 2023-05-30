import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import {
  args,
  editRow,
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
