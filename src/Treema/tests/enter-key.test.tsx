import { enterKeyTests, args, editRootArrayTest, editRootArrayArgs, noMorePropsTest, noMorePropsArgs, noMoreItemsTest, noMoreItemsArgs } from './enter-key';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('edit a row', enterKeyTests, args);
wrapGenericTestInJest('add an element to the end of an array', [editRootArrayTest], editRootArrayArgs);
wrapGenericTestInJest('do not allow adding props when all possible props exist', [noMorePropsTest], noMorePropsArgs);
wrapGenericTestInJest('do not allow adding items when the max exist', [noMoreItemsTest], noMoreItemsArgs);