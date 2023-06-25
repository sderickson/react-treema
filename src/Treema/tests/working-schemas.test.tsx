import { workingSchemaTests, args } from './working-schemas';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('working schema interactions', workingSchemaTests, args);
