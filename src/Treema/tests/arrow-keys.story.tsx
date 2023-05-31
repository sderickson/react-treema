import { TreemaRoot } from '../TreemaRoot';
import type { Meta } from '@storybook/react';
import { args, downStartTest, rightOpens, skipClosed, traverseOpenCollections, closeCollections, eitherEnd } from './arrow-keys';
import { wrapGenericTestInStory, Story } from './utils-storybook';

/**
 * This storybook demonstrates and tests arrow key behaviors.
 */
const meta: Meta<typeof TreemaRoot> = {
  title: 'InteractiveTests/ArrowKeys',
  component: TreemaRoot,
};

export default meta;

export const DownStart: Story = wrapGenericTestInStory(downStartTest, args);
export const SkipClosed: Story = wrapGenericTestInStory(skipClosed, args);
export const RightOpens: Story = wrapGenericTestInStory(rightOpens, args);
export const TraverseCollections: Story = wrapGenericTestInStory(traverseOpenCollections, args);
export const CloseCollections: Story = wrapGenericTestInStory(closeCollections, args);
export const EitherEnd: Story = wrapGenericTestInStory(eitherEnd, args);
