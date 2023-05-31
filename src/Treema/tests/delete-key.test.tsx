import { deleteKeyTests, args } from './delete-key';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('delete key', deleteKeyTests, args);