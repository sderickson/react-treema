import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { args, switchWorkingSchema } from './working-schemas';
import { wrapGenericTestInStory, Story } from './utils-storybook';

/**
 * This storybook demonstrates and tests enter key behaviors.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'InteractiveTests/WorkingSchemas',
  component: TreemaRoot,
};

export default meta;

export const SwitchWorkingSchema: Story = wrapGenericTestInStory(switchWorkingSchema, args);
