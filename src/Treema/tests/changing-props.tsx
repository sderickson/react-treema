import { onEvent } from './context';
import { clone, getNoopLib } from '../utils';
import { TreemaRoot } from '../TreemaRoot';
import { GenericTest } from './types';
import React, { useCallback, useState } from 'react';
import { TreemaEventHandler, TreemaRootProps } from '../types';

/**
 * A parent component that has the data stored in its useState hook. It includes buttons for
 * changing the data, a display for the data, and a Treema instance.
 */
export const ParentComponent: React.FC<TreemaRootProps> = (props) => {
  const [data, setData] = useState<any>(props.data);
  const onClick = useCallback(() => {
    const newData = clone(data);
    newData.push(newData.length);
    setData(newData);
  }, [data]);
  const onEvent = useCallback<TreemaEventHandler>(
    (e) => {
      if (e.type === 'change_data_event') {
        setData(e.data);
      }
    },
    [setData],
  );

  return (
    <div data-testid="integration-test">
      <input type="button" onClick={onClick} value={'test?'} data-testid="test-add-element" />
      <TreemaRoot {...props} data={data} onEvent={onEvent} />
      <pre data-testid="test-display">{JSON.stringify(data)}</pre>
    </div>
  );
};

export const selectStaysOnAddTest: GenericTest = {
  name: 'selection should remain when items are added, and undo/redo should work',
  test: async (ctx) => {
    // add "3" to the end of the array by separate button
    await ctx.fireMouseClick(await ctx.testingLibrary.within(ctx.root).findByTestId('test-add-element'));

    // get to the add item button
    await ctx.fireFocus();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireTab();

    // // add "40" to the end via treema
    await ctx.fireEnter();
    await ctx.keyboard('4');
    await ctx.fireTab();

    // add "5" to the end of the array by separate button
    await ctx.fireMouseClick(await ctx.testingLibrary.within(ctx.root).findByTestId('test-add-element'));

    // array should be visible, and accurately display
    await ctx.testingLibrary.within(ctx.root).findByText(JSON.stringify([0, 1, 2, 3, 40, 5]));

    // undo/redo should work
    await ctx.fireUndo();
    await ctx.fireUndo();
    await ctx.testingLibrary.within(ctx.root).findByText(JSON.stringify([0, 1, 2, 3, 0]));

    await ctx.fireRedo();
    await ctx.fireRedo();
    await ctx.testingLibrary.within(ctx.root).findByText(JSON.stringify([0, 1, 2, 3, 40, 5]));
  },
};

export const changingPropsArgs: TreemaRootProps = {
  schemaLib: getNoopLib(),
  onEvent,
  data: [0, 1, 2],
  schema: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
};
