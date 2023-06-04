import { renderArrayArgs, renderArrayTest, renderBooleanArgs, renderBooleanTest, renderNullArgs, renderNullTest, renderNumberArgs, renderNumberTest, renderObjectArgs, renderObjectTest, renderStringArgs, renderStringTest } from './core-types';
import { wrapGenericTestInJest } from './utils-jest';

wrapGenericTestInJest('strings', [renderStringTest], renderStringArgs);
wrapGenericTestInJest('null', [renderNullTest], renderNullArgs);
wrapGenericTestInJest('number', [renderNumberTest], renderNumberArgs);
wrapGenericTestInJest('boolean', [renderBooleanTest], renderBooleanArgs);
wrapGenericTestInJest('array', [renderArrayTest], renderArrayArgs);
wrapGenericTestInJest('object', [renderObjectTest], renderObjectArgs);
