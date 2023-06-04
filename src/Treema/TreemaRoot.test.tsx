import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreemaRoot } from './TreemaRoot';
import { wrapAjv, wrapTv4 } from './utils';
import tv4 from 'tv4';
import Ajv from 'ajv';

describe('toggles', () => {
  it('should hide data when clicked to close', () => {
    render(
      <TreemaRoot
        data={{ 'nested': { 'a': 1, 'b': 234 } }}
        schema={{
          'type': 'object',
          'properties': { 'nested': { 'type': 'object', 'properties': { 'a': { 'type': 'number' }, 'b': { 'type': 'number' } } } },
        }}
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
      <TreemaRoot data={{ 'a': 1 }} schema={{ 'type': 'object', 'properties': { 'a': { 'type': 'boolean' } } }} schemaLib={wrapTv4(tv4)} />,
    );
    screen.getByText('Invalid type: number (expected boolean)'); // tv4 error message
  });

  it('validates with ajv', () => {
    render(
      <TreemaRoot
        data={{ 'a': 1 }}
        schema={{ 'type': 'object', 'properties': { 'a': { 'type': 'boolean' } } }}
        schemaLib={wrapAjv(new Ajv({ allErrors: true }))}
      />,
    );
    screen.getByText('must be boolean'); // ajv error message
  });
});

describe('description', () => {
  it('puts the description from the schema in the title of the key', () => {
    render(
      <TreemaRoot
        data={{ 'a': 1 }}
        schema={{ 'type': 'object', 'properties': { 'a': { 'type': 'boolean', description: 'the a key' } } }}
      />,
    );
    screen.getByTitle('the a key');
  });
});
