import { useEffect, useContext } from 'react';
import { TreemaContext } from '../context';
import React from 'react';

export type NodeEventCallbackHandler = (event: KeyboardEvent) => boolean;

/**
 * Use this in `edit` for definitions to register a callback for keyboard events.
 * Return `false` to prevent Treema's default handling of that event. This is useful
 * for example to cancel moving to the next node, such as when editing multiple
 * lines where tab and enter are normally used. This can also be used to implement
 * custom errors where navigation is prevented until an error is fixed.
 */
export const useTreemaKeyboardEvent = (callback: NodeEventCallbackHandler): NodeEventCallbackHandler | void => {
  const { keyboardCallbackRef } = useContext(TreemaContext);

  useEffect(() => {
    if (keyboardCallbackRef) {
      keyboardCallbackRef.current = callback;
    }

    return () => {
      if (keyboardCallbackRef) {
        keyboardCallbackRef.current = undefined;
      }
    };
  }, [keyboardCallbackRef, callback]);
};

export const useTreemaInput = () => {
  const { editRefs } = useContext(TreemaContext);
  const editRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    editRefs.push(editRef);

    return () => {
      const refIndex = editRefs.indexOf(editRef);
      if (refIndex >= 0) {
        editRefs.splice(refIndex, 1);
      }
    };
  }, [editRef, editRefs]);

  return editRef;
};

export const useTreemaTextArea = () => {
  const { editRefs } = useContext(TreemaContext);
  const editRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    editRefs.push(editRef);

    return () => {
      const refIndex = editRefs.indexOf(editRef);
      if (refIndex >= 0) {
        editRefs.splice(refIndex, 1);
      }
    };
  }, [editRef, editRefs]);

  return editRef;
};
