import React from 'react';
import { TreemaRoot } from '../TreemaRoot';
import { render, screen, fireEvent } from '@testing-library/react';
import { JsonPointer, SupportedJsonSchema, TreemaEvent } from '../types';

describe('arrow key navigation', () => {
  const schema: SupportedJsonSchema = {
    type: 'object',
    displayProperty: 'name',
    properties: {
      name: { type: 'string', title: 'NAME' },
      numbers: { type: 'array', items: { 'type': ['string', 'array'] } },
      address: { type: 'string' },
    },
  };
  const data = { name: 'Bob', numbers: ['401-401-1337', ['123-456-7890']], address: 'Mars' };
  let lastPath: JsonPointer | undefined;
  const onEvent = (event: TreemaEvent) => {
    if (event.type === 'change_select_event') {
      lastPath = event.path;
    }
  };
  const getTreemaRoot = () => screen.getByTestId('treema-root');
  const fireFocusTreema = () => {
    fireEvent.focus(getTreemaRoot());
  };
  const fireArrowDown = () => {
    fireEvent.keyDown(getTreemaRoot(), { key: 'ArrowDown', code: 'ArrowDown' });
  };
  const fireArrowUp = () => {
    fireEvent.keyDown(getTreemaRoot(), { key: 'ArrowUp', code: 'ArrowUp' });
  };
  const fireArrowRight = () => {
    fireEvent.keyDown(getTreemaRoot(), { key: 'ArrowRight', code: 'ArrowRight' });
  };
  const fireArrowLeft = () => {
    fireEvent.keyDown(getTreemaRoot(), { key: 'ArrowLeft', code: 'ArrowLeft' });
  };
  const fireOpenPhoneNumbers = () => {
    fireEvent.click(screen.getByPlaceholderText('Open /numbers'));
  };
  const fireClickAddress = () => {
    fireEvent.click(screen.getByText('Mars'));
  };

  beforeEach(() => {});
  describe('down arrow key press', () => {
    it('selects the top row if nothing is selected', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireFocusTreema();
      expect(lastPath).toBeUndefined();
      fireArrowDown();
      expect(lastPath).toEqual('/name');
    });

    it('skips past closed collections', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireFocusTreema();
      expect(lastPath).toBeUndefined();
      fireArrowDown();
      expect(lastPath).toEqual('/name');
      fireArrowDown();
      expect(lastPath).toEqual('/numbers');
      fireArrowDown();
      expect(lastPath).toEqual('/address');
    });

    it('traverses open collections', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireOpenPhoneNumbers();
      expect(lastPath).toBeUndefined();
      fireArrowDown();
      expect(lastPath).toEqual('/name');
      fireArrowDown();
      expect(lastPath).toEqual('/numbers');
      fireArrowDown();
      expect(lastPath).toEqual('/numbers/0');
      fireArrowDown();
      expect(lastPath).toEqual('/numbers/1');
      fireArrowDown();
      expect(lastPath).toEqual('/numbers/1/0');
      fireArrowDown();
      expect(lastPath).toEqual('/address');
    });

    it('does nothing if the last treema is selected', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireClickAddress();
      expect(lastPath).toEqual('/address');
      fireArrowDown();
      expect(lastPath).toEqual('/address');
    });
  });

  describe('up arrow key press', () => {
    it('selects the bottom row if nothing is selected', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireFocusTreema();
      expect(lastPath).toBeUndefined();
      fireArrowUp();
      expect(lastPath).toEqual('/address');
    });

    it('skips past closed collections', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireClickAddress();
      expect(lastPath).toEqual('/address');
      fireArrowUp();
      expect(lastPath).toEqual('/numbers');
    });

    it('traverses open collections', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireClickAddress();
      fireOpenPhoneNumbers();
      expect(lastPath).toEqual('/address');
      fireArrowUp();
      expect(lastPath).toEqual('/numbers/1/0');
      fireArrowUp();
      expect(lastPath).toEqual('/numbers/1');
      fireArrowUp();
      expect(lastPath).toEqual('/numbers/0');
      fireArrowUp();
      expect(lastPath).toEqual('/numbers');
      fireArrowUp();
      expect(lastPath).toEqual('/name');
    });

    it('wraps around if the first treema is selected', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireFocusTreema();
      expect(lastPath).toBeUndefined();
      fireArrowDown();
      expect(lastPath).toEqual('/name');
      fireArrowUp();
      expect(lastPath).toEqual('/address');
    });
  });

  describe('right arrow key press', () => {
    it("does nothing if the selected row isn't a collection", () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireArrowDown();
      expect(lastPath).toEqual('/name');
      fireArrowRight();
      expect(lastPath).toEqual('/name');
    });

    it('opens a collection if a collection is selected', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireArrowDown();
      expect(lastPath).toEqual('/name');
      fireArrowDown();
      expect(lastPath).toEqual('/numbers');
      fireArrowRight();
      expect(lastPath).toEqual('/numbers');
      fireArrowRight();
      expect(lastPath).toEqual('/numbers/0');
    });
  });

  describe('left arrow key press', () => {
    it('closes an open, selected collection', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireClickAddress();
      fireArrowUp();
      expect(lastPath).toEqual('/numbers');
      expect(screen.queryByText('401-401-1337')).toBeNull();
      fireOpenPhoneNumbers();
      expect(screen.getByText('401-401-1337')).not.toBeNull();
      fireArrowLeft();
      expect(screen.queryByText('401-401-1337')).toBeNull();
    });

    it('closes the selection if it can be closed, otherwise moves the selection up a level', () => {
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireArrowDown();
      fireArrowDown();
      expect(lastPath).toEqual('/numbers');
      fireArrowRight();
      fireArrowRight();
      expect(lastPath).toEqual('/numbers/0');
      fireArrowLeft();
      expect(lastPath).toEqual('/numbers');
    });

    xit('affects one collection at a time, deepest first', () => {
      // TODO: need to support working schemas before this test will work
      render(<TreemaRoot data={data} schema={schema} initOpen={1} onEvent={onEvent} />);
      fireClickAddress();
      fireOpenPhoneNumbers();
      expect(lastPath).toEqual('/address');
      fireArrowUp();
      expect(lastPath).toEqual('/numbers/1/0');
      fireArrowLeft();
      expect(lastPath).toEqual('/numbers/1');
      screen.getByPlaceholderText('Close /numbers/1');
      fireArrowLeft();
      expect(lastPath).toEqual('/numbers/1');
      screen.getByPlaceholderText('Open /numbers/1');
      fireArrowLeft();
      expect(lastPath).toEqual('/numbers');
    });
  });
});
