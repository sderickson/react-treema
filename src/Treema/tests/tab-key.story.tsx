import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { args, tabHiddenAndClosedRowTest } from './tab-key';
import { wrapGenericTestInStory, Story } from './utils-storybook';

/**
 * This storybook demonstrates and tests enter key behaviors.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'InteractiveTests/TabKey',
  component: TreemaRoot,
};

export default meta;

export const TabHiddenAndClosedRow: Story = wrapGenericTestInStory(tabHiddenAndClosedRowTest, args);
