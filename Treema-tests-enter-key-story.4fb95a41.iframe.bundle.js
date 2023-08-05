(self.webpackChunkreact_treema=self.webpackChunkreact_treema||[]).push([[199],{"./src/Treema/tests/enter-key.story.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{EditEnum:()=>EditEnum,EditRootArray:()=>EditRootArray,EditRow:()=>EditRow,NoMoreItems:()=>NoMoreItems,NoMoreProps:()=>NoMoreProps,default:()=>enter_key_story});var TreemaRoot=__webpack_require__("./src/Treema/TreemaRoot.tsx"),context=__webpack_require__("./src/Treema/tests/context.ts");const editRow={name:"edits the selected row, if editable",test:async ctx=>{await ctx.fireFocus(),await ctx.fireEnter(),await ctx.fireEnter(),await ctx.keyboard("Hi!"),await ctx.fireEnter();const data=ctx.getData();ctx.expect(data.name).toEqual("BobHi!")}},args={schemaLib:(0,__webpack_require__("./src/Treema/utils.ts").cD)(),onEvent:context.Vl,initOpen:1,data:{name:"Bob",numbers:["401-401-1337",["123-456-7890"]],address:"Mars"},schema:{type:"object",displayProperty:"name",properties:{name:{type:"string",title:"NAME"},numbers:{type:"array",items:{type:["string","array"]}},address:{type:"string"}}}},editRootArrayArgs={data:[1,2,3],schema:{type:"array",items:{type:"number"}},onEvent:context.Vl},noMoreItemsArgs={data:[1,2],schema:{type:"array",items:{type:"number"},maxItems:3},onEvent:context.Vl},noMorePropsArgs={data:{},schema:{type:"object",properties:{a:{type:"string"}},additionalProperties:!1},onEvent:context.Vl},enumArgs={data:{a:"b"},schema:{type:"object",properties:{a:{enum:["a","b","c"],type:"string"}}},onEvent:context.Vl};var utils_storybook=__webpack_require__("./src/Treema/tests/utils-storybook.ts");const enter_key_story={title:"InteractiveTests/EnterKey",component:TreemaRoot.W,parameters:{docs:{description:{component:"This storybook demonstrates and tests enter key behaviors."}}}},EditRow=(0,utils_storybook.x)(editRow,args),EditRootArray=(0,utils_storybook.x)({name:"can get to the final row and add another element to the array",test:async ctx=>{await ctx.fireFocus(),await ctx.fireTab(),await ctx.fireTab(),await ctx.fireTab(),await ctx.fireTab(),await ctx.fireTab(),await ctx.fireEnter(),await ctx.fireArrowRight(),await ctx.keyboard("9001"),await ctx.fireEnter(),await ctx.keyboard("9002"),await ctx.fireEnter();const data=ctx.getData();ctx.expect(data).toEqual([1,2,3,90010,90020,0])}},editRootArrayArgs),NoMoreProps=(0,utils_storybook.x)({name:"should not allow adding properties once all allowed have been added",test:async ctx=>{await ctx.fireFocus(),await ctx.fireTab(),await ctx.fireEnter(),await ctx.keyboard("a"),await ctx.fireEnter(),await ctx.keyboard("asdf"),await ctx.fireEnter(),await ctx.keyboard("b"),await ctx.fireEnter();const data=ctx.getData();ctx.expect(data).toEqual({a:"asdf"}),ctx.expect(ctx.query().queryByTestId("treema-new-prop-input")).toBeNull()}},noMorePropsArgs),NoMoreItems=(0,utils_storybook.x)({name:"should not allow adding items once all allowed have been added",test:async ctx=>{await ctx.fireFocus(),await ctx.fireTab(),await ctx.fireTab(),await ctx.fireTab(),await ctx.fireEnter(),await ctx.fireEnter();const data=ctx.getData();ctx.expect(data).toEqual([1,2,0]),ctx.expect(ctx.query().queryByTestId("treema-new-prop-input")).toBeNull()}},noMoreItemsArgs),EditEnum=(0,utils_storybook.x)({name:"should show a select box for enums",test:async ctx=>{await ctx.fireFocus(),await ctx.fireTab(),await ctx.fireEnter();const result=await ctx.testingLibrary.within(ctx.treema).getByRole("combobox");await ctx.selectOptions(result,"c"),await ctx.fireEnter(),ctx.expect(ctx.getData()).toEqual({a:"c"})}},enumArgs);EditRow.parameters={...EditRow.parameters,docs:{...EditRow.parameters?.docs,source:{originalSource:"wrapGenericTestInStory(editRow, args)",...EditRow.parameters?.docs?.source}}},EditRootArray.parameters={...EditRootArray.parameters,docs:{...EditRootArray.parameters?.docs,source:{originalSource:"wrapGenericTestInStory(editRootArrayTest, editRootArrayArgs)",...EditRootArray.parameters?.docs?.source}}},NoMoreProps.parameters={...NoMoreProps.parameters,docs:{...NoMoreProps.parameters?.docs,source:{originalSource:"wrapGenericTestInStory(noMorePropsTest, noMorePropsArgs)",...NoMoreProps.parameters?.docs?.source}}},NoMoreItems.parameters={...NoMoreItems.parameters,docs:{...NoMoreItems.parameters?.docs,source:{originalSource:"wrapGenericTestInStory(noMoreItemsTest, noMoreItemsArgs)",...NoMoreItems.parameters?.docs?.source}}},EditEnum.parameters={...EditEnum.parameters,docs:{...EditEnum.parameters?.docs,source:{originalSource:"wrapGenericTestInStory(enumTest, enumArgs)",...EditEnum.parameters?.docs?.source}}}},"./src/Treema/tests/context.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Vl:()=>onEvent,_v:()=>sleep,g6:()=>TreemaStorybookTestContext});const user=__webpack_require__("./node_modules/@testing-library/user-event/dist/esm/index.js").Z.setup();function sleep(ms){return new Promise((resolve=>setTimeout(resolve,ms)))}let lastPath,lastData;const onEvent=event=>{"change_select_event"===event.type&&(lastPath=event.path),"change_data_event"===event.type&&(lastData=event.data)};class TreemaStorybookTestContext{constructor(root,jest,testingLibrary,speed=200){this.root=void 0,this.treema=void 0,this.testingLibrary=void 0,this.expect=void 0,this.speed=void 0,this.root=root,"treema-root"===this.root.getAttribute("data-testid")?this.treema=this.root:this.treema=testingLibrary.within(this.root).getByTestId("treema-root"),this.testingLibrary=testingLibrary,this.expect=jest.expect,this.speed=speed}query(){return this.testingLibrary.within(this.root)}async fireFocus(e){await this.testingLibrary.fireEvent.focus(e||this.treema),await sleep(this.speed)}async fireArrowDown(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"ArrowDown",code:"ArrowDown"}),await sleep(this.speed)}async fireArrowUp(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"ArrowUp",code:"ArrowUp"}),await sleep(this.speed)}async fireArrowLeft(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"ArrowLeft",code:"ArrowLeft"}),await sleep(this.speed)}async fireArrowRight(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"ArrowRight",code:"ArrowRight"}),await sleep(this.speed)}async fireEnter(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"Enter",code:"Enter"}),await sleep(this.speed)}async fireTab(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"Tab",code:"Tab"}),await sleep(this.speed)}async fireBackspace(){await this.testingLibrary.fireEvent.keyDown(this.treema,{key:"Backspace",code:"Backspace"}),await sleep(this.speed)}async fireMouseClick(e){await this.testingLibrary.fireEvent.click(e),await sleep(this.speed)}async keyboard(input){await user.keyboard(input),await sleep(this.speed)}async type(element,text){await user.type(element,text),await sleep(this.speed)}async clear(){await user.clear(this.testingLibrary.within(this.treema).getByRole("textbox"))}async selectOptions(select,values){await user.selectOptions(select,values),await sleep(this.speed)}getLastPath(){return lastPath}getData(){return lastData}}},"./src/Treema/tests/utils-storybook.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{x:()=>wrapGenericTestInStory});var _context__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/Treema/tests/context.ts"),_storybook_jest__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/jest/dist/esm/index.js"),_storybook_testing_library__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@storybook/testing-library/dist/esm/index.js");const wrapGenericTestInStory=(test,args)=>({name:test.name,args,play:async({canvasElement})=>{const context=new _context__WEBPACK_IMPORTED_MODULE_0__.g6(canvasElement,_storybook_jest__WEBPACK_IMPORTED_MODULE_1__,_storybook_testing_library__WEBPACK_IMPORTED_MODULE_2__);await(0,_context__WEBPACK_IMPORTED_MODULE_0__._v)(100),await test.test(context)}})},"?4f7e":()=>{}}]);