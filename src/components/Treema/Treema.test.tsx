import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreemaNode } from './TreemaNode';

describe('basic types', () => {
  it('should render strings', () => {
    render(<TreemaNode data="testasdf" schema={{ 'type': 'string' }} />);
    const treema = screen.getByText('testasdf');
    expect(treema).toBeInTheDocument();
  });

  it('should render null', () => {
    render(<TreemaNode data={null} schema={{ 'type': 'null' }} />);
    const treema = screen.getByText('null');
    expect(treema).toBeInTheDocument();
  });

  it('should render numbers', () => {
    render(<TreemaNode data={123} schema={{ 'type': 'number' }} />);
    const treema = screen.getByText('123');
    expect(treema).toBeInTheDocument();
  });

  it('should render boolean', () => {
    render(<TreemaNode data={true} schema={{ 'type': 'boolean' }} />);
    const treema = screen.getByText('true');
    expect(treema).toBeInTheDocument();
  });

  it('should render arrays', () => {
    render(<TreemaNode data={[1, 234, 3]} schema={{ 'type': 'array', 'items': { 'type': 'number' } }} />);
    const treema = screen.getByText('234');
    expect(treema).toBeInTheDocument();
  });

  it('should render objects', () => {
    render(
      <TreemaNode
        data={{ 'a': 1, 'b': 234 }}
        schema={{ 'type': 'object', 'properties': { 'a': { 'type': 'number' }, 'b': { 'type': 'number' } } }}
      />,
    );
    const treema = screen.getByText('234');
    expect(treema).toBeInTheDocument();
  });
});

describe('toggles', () => {
  it('should hide data when clicked to close', () => {
    render(
      <TreemaNode
        data={{ 'a': 1, 'b': 234 }}
        schema={{ 'type': 'object', 'properties': { 'a': { 'type': 'number' }, 'b': { 'type': 'number' } } }}
      />,
    );
    // check it exists
    let treema: HTMLElement | null = screen.getByText('234');
    expect(treema).toBeInTheDocument();

    // toggle, check it's gone
    const visibityToggle = screen.getByRole('button');
    fireEvent.click(visibityToggle);
    treema = screen.queryByText('234');
    expect(treema).not.toBeInTheDocument();

    // toggle again, check it's back
    fireEvent.click(visibityToggle);
    treema = screen.queryByText('234');
    expect(treema).toBeInTheDocument();
  });
});
