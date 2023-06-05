import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { renderStringTest, renderStringArgs, renderNullTest, renderNullArgs, renderNumberTest, renderBooleanTest, renderArrayTest, renderObjectTest, renderNumberArgs, renderBooleanArgs, renderArrayArgs, renderObjectArgs } from './core-types';
import { wrapGenericTestInStory, Story } from './utils-storybook';

/**
 * This storybook demonstrates and tests enter key behaviors.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'RenderTests/CoreTypes',
  component: TreemaRoot,
};

export default meta;

export const StringType: Story = wrapGenericTestInStory(renderStringTest, renderStringArgs);
export const NullType: Story = wrapGenericTestInStory(renderNullTest, renderNullArgs);
export const NumberType: Story = wrapGenericTestInStory(renderNumberTest, renderNumberArgs);
export const BooleanType: Story = wrapGenericTestInStory(renderBooleanTest, renderBooleanArgs);
export const ArrayType: Story = wrapGenericTestInStory(renderArrayTest, renderArrayArgs);
export const ObjectType: Story = wrapGenericTestInStory(renderObjectTest, renderObjectArgs);