import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { wrapGenericTestInStory, Story } from './utils-storybook';
import { ParentComponent, stringFilterTest, stringFilterProps } from './filters';

/**
 * This storybook demonstrates and tests the filter TreemaRoot prop.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'IntegrationTests/Filters',
  component: ParentComponent,
};

export default meta;

export const StringFilter: Story = wrapGenericTestInStory(stringFilterTest, stringFilterProps);
