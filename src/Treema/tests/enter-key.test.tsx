import { enterKeyTests, args } from './enter-key';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('delete key', enterKeyTests, args);
