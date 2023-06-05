import React from 'react';
import { TreemaStorybookTestContext } from './context';
import { render, screen } from '@testing-library/react';
import * as mainJest from '@jest/globals';
import * as mainTestingLibrary from '@testing-library/react';
import { onEvent } from './context';
import { ParentComponent, changingPropsArgs, selectStaysOnAddTest } from './changing-props';

// TODO: make the generic test interfaces better so that we don't need this manual stitching together
describe('integration with a parent component that holds the data source of truth', () => {
  for (const test of [selectStaysOnAddTest]) {
    it(test.name, async () => {
      render(<ParentComponent data={changingPropsArgs?.data} schema={changingPropsArgs?.schema || {}} initOpen={changingPropsArgs.initOpen} onEvent={onEvent} />);
      const root = screen.getByTestId('integration-test');
      const context = new TreemaStorybookTestContext(root, mainJest, mainTestingLibrary, 0);
      await test.test(context);
    });
  }
});
