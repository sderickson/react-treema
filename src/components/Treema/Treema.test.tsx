import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreemaRoot } from './TreemaRoot';
import { wrapAjv, wrapTv4 } from './utils';
import tv4 from 'tv4';
import Ajv from 'ajv';

describe('basic types', () => {
  it('should render strings', () => {
    render(<TreemaRoot data="testasdf" schema={{ 'type': 'string' }} />);
    const treema = screen.getByText('testasdf');
    expect(treema).toBeInTheDocument();
  });

  it('should render null', () => {
    render(<TreemaRoot data={null} schema={{ 'type': 'null' }} />);
    const treema = screen.getByText('null');
    expect(treema).toBeInTheDocument();
  });

  it('should render numbers', () => {
    render(<TreemaRoot data={123} schema={{ 'type': 'number' }} />);
    const treema = screen.getByText('123');
    expect(treema).toBeInTheDocument();
  });

  it('should render boolean', () => {
    render(<TreemaRoot data={true} schema={{ 'type': 'boolean' }} />);
    const treema = screen.getByText('true');
    expect(treema).toBeInTheDocument();
  });

  it('should render arrays', () => {
    render(<TreemaRoot data={[1, 234, 3]} schema={{ 'type': 'array', 'items': { 'type': 'number' } }} />);
    const treema = screen.getByText('234');
    expect(treema).toBeInTheDocument();
  });

  it('should render objects', () => {
    render(
      <TreemaRoot
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
      <TreemaRoot
        data={{ 'nested': {'a': 1, 'b': 234 }}}
        schema={{ 'type': 'object', 'properties': { 'nested': { 'type': 'object', 'properties': { 'a': { 'type': 'number' }, 'b': { 'type': 'number' } } }}}}
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

describe('validation', () => {
  it('validates with tv4', () => {
    render(
      <TreemaRoot
        data={{ 'a': 1 }}
        schema={{ 'type': 'object', 'properties': {'a': { 'type': 'boolean'}} }}
        schemaLib={wrapTv4(tv4)}
      />,
    );
    screen.getByText('Invalid type: number (expected boolean)');  // tv4 error message
  });

  it('validates with ajv', () => {
    render(
      <TreemaRoot
        data={{ 'a': 1 }}
        schema={{ 'type': 'object', 'properties': {'a': { 'type': 'boolean'}} }}
        schemaLib={wrapAjv(new Ajv({allErrors: true}))}
      />,
    );
    screen.getByText('must be boolean');  // ajv error message
  });
});
