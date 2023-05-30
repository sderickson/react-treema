import React from 'react';
import { TreemaStorybookTestContext } from './context';
import { GenericTest } from './types';
import { TreemaRootProps, TreemaRoot } from '../TreemaRoot';
import { render, screen } from '@testing-library/react';
import * as mainJest from '@jest/globals';
import * as mainTestingLibrary from '@testing-library/react';
import { onEvent } from './context';

export const wrapGenericTestInJest = (overallName: string, tests: GenericTest[], args: TreemaRootProps) => {
  describe(overallName, () => {
    for (const test of tests) {
      it(test.name, async () => {
        render(<TreemaRoot data={args?.data} schema={args?.schema || {}} initOpen={args.initOpen} onEvent={onEvent} />);
        const treema = screen.getByTestId('treema-root');
        const context = new TreemaStorybookTestContext(treema, mainJest, mainTestingLibrary, 0);
        await test.test(context);
      });
    }
  });
};
