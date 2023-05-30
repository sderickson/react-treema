import React from 'react';
import { TreemaRoot } from '../TreemaRoot';
import { render, screen } from '@testing-library/react';
import * as mainJest from '@jest/globals';
import * as mainTestingLibrary from '@testing-library/react';
import { TreemaStorybookTestContext } from './context';

import { genericKeyboardTests, args } from './keyboard';
import { onEvent } from './context';

describe('arrow key navigation', () => {
  for (const test of genericKeyboardTests) {
    it(test.name, async () => {
      render(<TreemaRoot data={args?.data} schema={args?.schema || {}} initOpen={1} onEvent={onEvent} />);
      const treema = screen.getByTestId('treema-root');
      const context = new TreemaStorybookTestContext(treema, mainJest, mainTestingLibrary, 0);
      await test.test(context);
    });
  }
});