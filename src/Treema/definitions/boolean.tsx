import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  valueClassName: 'treema-boolean',

  display: ({ data }) => {
    return <span>{JSON.stringify(data)}</span>;
  },

  edit: ({ data, onChange }, ref) => {
    return <span>
      {JSON.stringify(data)}
      <input
        type="checkbox"
        checked={data}
        ref={ref}
        onChange={(e) => { onChange(e.target.checked); }}
      />
    </span>
  }

  /*
    TODO
    onSpacePressed: -> @toggleValue()
    onFPressed: -> @toggleValue(false)
    onTPressed: -> @toggleValue(true)
    saveChanges: -> 
    onClick: (e) ->
      value = $(e.target).closest('.treema-value')
      return super(e) unless value.length
      @toggleValue() if @canEdit()
   */
};