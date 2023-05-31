import { TreemaStorybookTestContext } from './context';

/**
 * A generic test is set up to be able to be run in both storybook and jest.
 * Presumably could set up storybook to run its tests with CLI, but it didn't
 * work out of the box, and there'd be no way to get complete test coverage.
 * So instead a context is provided that wraps either the general testing and
 * jest functinos, or the storybook ones, and each test uses that.
 */
export interface GenericTest {
  name: string;
  test: (ctx: TreemaStorybookTestContext) => Promise<void>;
}
