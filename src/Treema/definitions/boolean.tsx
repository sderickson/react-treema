import React from 'react';
import { DisplayProps, EditProps, TreemaTypeDefinition } from './types';
import { useTreemaEditRef } from './hooks';

export const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  id: 'boolean',

  Display: (props: DisplayProps) => {
    const { data } = props;

    return <span>{JSON.stringify(data)}</span>;
  },

  Edit: (props: EditProps) => {
    const { data, onChange } = props;
    const ref = useTreemaEditRef();

    return (
      <span>
        {JSON.stringify(data)}
        <input
          type="checkbox"
          checked={data}
          ref={ref}
          onChange={(e) => {
            onChange(e.target.checked);
          }}
        />
      </span>
    );
  },

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
