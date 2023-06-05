import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { wrapGenericTestInStory, Story } from './utils-storybook';
import { ParentComponent, changingPropsArgs, selectStaysOnAddTest } from './changing-props';

/**
 * This storybook demonstrates and tests having the parent component be the source of truth for
 * the data.
 * 
 * In all but the most simple uses of Treema, an ancestor node of Treema will need
 * to mediate between other sources of changes such as other inputs on the page,
 * or I/O streams such as file or network activity.
 * 
 * If the data value passed in changes, Treema will replace whatever it currently has with
 * the new value and, as much as possible, maintain other state continuity such as selection
 * and opened/closed states. Likewise, when Treema emits that its data has changed, the
 * component which is managing data should broadcast these changes appropriately.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'IntegrationTests/UpdateData',
  component: ParentComponent,
};

export default meta;

export const SelectStaysOnAdd: Story = wrapGenericTestInStory(selectStaysOnAddTest, changingPropsArgs);
