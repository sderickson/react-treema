import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  directlyEditable: false,
  editable: true,
  collection: true,
  keyed: true,
  valueClassName: 'treema-array',
  sort: false,

  display: () => {
    return <span></span>;
  },

  /*
  TODO

    open: ->
      @data.sort(@sortFunction) if @data and @sort
      super(arguments...)

    sortFunction: (a, b) ->
      return 1 if a > b
      return -1 if a < b
      return 0

  */
};
