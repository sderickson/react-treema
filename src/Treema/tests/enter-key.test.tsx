import React from 'react';
import { TreemaRoot } from '../TreemaRoot';
import { render, screen } from '@testing-library/react';
import * as mainJest from '@jest/globals';
import * as mainTestingLibrary from '@testing-library/react';
import { TreemaStorybookTestContext } from './context';

import { enterKeyTests, args } from './enter-key';
import { onEvent } from './context';

describe('enter key', () => {
  for (const test of enterKeyTests) {
    it(test.name, async () => {
      render(<TreemaRoot data={args?.data} schema={args?.schema || {}} initOpen={args.initOpen} onEvent={onEvent} />);
      const treema = screen.getByTestId('treema-root');
      const context = new TreemaStorybookTestContext(treema, mainJest, mainTestingLibrary, 0);
      await test.test(context);
    });
  }
});