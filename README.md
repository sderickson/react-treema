# React Treema

Cloned from https://github.com/KaiHotz/react-rollup-boilerplate

## TODO

### View Component
Drawing from https://www.learnjsonschema.com/
And http://codecombat.github.io/treema/demo.html

#### Done
- [X] Basic types
- [X] View toggle
- [X] Walk
- [X] Keyboard nav
- [X] open/close
- [X] Styling
- [X] Storybook docs
- [X] General schema validation (ajv, tv4)
- [X] oneOf/allOf/anyOf (working schemas)
- [X] Additional schemas ($ref)
- [X] items, properties, patternProperties, additionalProperties, additionalItems
- [X] Description prop
- [X] Default data
- [X] Required data
- [X] Editing
  - [X] Make default story work, able to set data
  - [X] Make arrays and objects able to add children
  - [X] Make able to delete properties and children
- [X] Callbacks
- [X] Custom treema nodes
- [X] Extras (2d point, etc)
- [X] Preventing adding items, props where no more can be added
- [X] Test data prop changing
- [X] Hidden format
- [X] Object and array displays

#### In Progress
- [X] Feature Parity for AI Scenario
  - [X] Edit working schemas
    - [X] Show errors by working schema
    - [X] Retain initial working schema settings
    - [X] advanced combineSchemas
      - [X] combine properties
      - [X] combine required
    - [X] Deleting prompt quiz content breaks treema
  - [X] Migrate to json pointer utils
  - [X] Support for enum
  - [X] Show root elem
  - [X] Ace Editor integration
  - [ ] Full custom type definition interface
    - [X] Write documentation on making them
    - [X] Export all tools necessary
    - [ ] Put documentation in storybook mdx?
    - [ ] Finalize names
    - [ ] Add schema prop to definition
  - [ ] export getters/setters
  - [ ] export utility functions

#### TODO
- [ ] Mouse click to edit
- [ ] Shift/Meta click
- [ ] readOnly, skipValidation
- [ ] undo/redo
- [ ] A11y
  - [ ] Add roles, test with screen reader
  - [ ] Form mode
  - [ ] Update tests to use role
- [ ] CSS
  - [ ] "Border" error look when error is for collection
  - [ ] Audit existing CSS, remove floats and unnecessary rules
  - [ ] Responsive
- [ ] Copy/Paste
- [ ] filter?
- [ ] search (that one jquery ui thing)
- [ ] drag and drop (that other jquery ui thing), noSortable
- [ ] comprehensive input attribute support
- [ ] README
- [ ] Github pages
- [ ] Publish



## Developing

To start the developing run :

```
yarn start
```

This will build Treema and run Storybook.
To open Storybook manually open your Browser and navigate to [http://localhost:6060](http://localhost:6060).

## Testing

Testing is done with [Jest](https://facebook.github.io/jest/) and [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
```
yarn test
```
or (for getting coverage)
```
yarn test:coverage
```
or (for automatic running)
```
yarn test:watch
```

Note that Storybook is also set up to run the interactive tests. Unit tests are not run in Storybook.


## Linting

Linting is set up through [ESLint](https://eslint.org/) and configured with  [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app) and
[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier).

```
yarn lint
```
or (if automatic fixing is possible)
```
yarn lint:fix
```

## Publishing your library to NPM

`TODO`

To release to NPM, make sure you have an active account at [NPM](https://www.npmjs.com/), your `.npmrc` file is correctly setup and the repository url in `package.json` file is set to your repository url, then:

```
yarn release
```

## Storybook

For custom layouts, styling and more information about Storybook, please refer to [Storybook](https://storybook.js.org/basics/writing-stories/) documentation.

#### Deploy Storybook to GitHub Pages

`TODO`

Make sure the repository url in `package.json` file is set to your repository url, then:

```
yarn deploy
```

## Scripts

- `yarn start` : Only serves Storybook.
- `yarn build` : Builds your library (build can be found in `dist` folder).
- `yarn storybook:build` : Builds the static Storybook in case you want to deploy it.
- `yarn test` : Runs the tests.
- `yarn test:watch` : Runs the tests with a watcher.
- `yarn test:coverage`: Runs the test and shows the coverage.
- `yarn lint` : Runs the linter, Typescript typecheck and stylelint.
- `yarn lint:fix` : Runs the linter, Typescript typecheck and stylelint and fixes automatic fixable issues.
- `yarn eslint`: Runs only the JavaScript linter.
- `yarn eslint:fix`: Runs only the JavaScript linter and fixes automatic fixable issues.
- `yarn stylelint`: Runs only the style linter.
- `yarn stylelint:fix`: Runs only the style linter and fixes automatic fixable issues.
- `yarn check-types`: Runs typescript type checker.
- `yarn release` : Publishes your Library on NPM or your private Registry (depending on your config in your `.npmrc` file).
- `yarn deploy`: Deploys the Styleguide to GitHub Pages.


## Resources

### Bundler
- [Rollup.js](https://rollupjs.org/guide/en)

### Code Formatter
- [Prettier](https://prettier.io/)

### Storybook
- [Storybook](https://storybook.js.org/)

### Testing
- [Jest](https://facebook.github.io/jest/)
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)

### Linting
- [ESLint](https://eslint.org/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [stylelint-prettier](https://github.com/prettier/stylelint-prettier)
- [stylelint-scss](https://github.com/kristerkari/stylelint-scss)
### Compiler
- [Babel 7](https://babeljs.io/)
- [Typescript](https://www.typescriptlang.org/)
