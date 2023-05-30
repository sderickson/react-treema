import { arrowKeyTests, args } from './arrow-keys';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('arrow key navigation', arrowKeyTests, args);