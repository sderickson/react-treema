import {
  tabKeyTests,
  args,
} from './tab-key';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('tab', tabKeyTests, args);
