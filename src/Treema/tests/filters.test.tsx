import React from 'react';
import { TreemaStorybookTestContext } from './context';
import { render, screen } from '@testing-library/react';
import * as mainJest from '@jest/globals';
import * as mainTestingLibrary from '@testing-library/react';
import { onEvent } from './context';
import { ParentComponent, stringFilterProps, stringFilterTest } from './filters';

// TODO: make the generic test interfaces better so that we don't need this manual stitching together
describe('a basic string filter works', () => {
  for (const test of [stringFilterTest]) {
    it(test.name + '', async () => {
      render(
        <ParentComponent
          data={stringFilterProps?.data}
          schema={stringFilterProps?.schema || {}}
          initOpen={stringFilterProps.initOpen}
          onEvent={onEvent}
        />,
      );
      const root = screen.getByTestId('integration-test');
      const context = new TreemaStorybookTestContext(root, mainJest, mainTestingLibrary, 0);
      await test.test(context);
    });
  }
});
