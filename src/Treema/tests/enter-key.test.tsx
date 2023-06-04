import { enterKeyTests, args, editRootArrayTest, editRootArrayArgs } from './enter-key';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('edit a row', enterKeyTests, args);
wrapGenericTestInJest('add an element to the end of an array', [editRootArrayTest], editRootArrayArgs);