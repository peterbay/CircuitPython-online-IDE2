# Dev Log

## Boilerplate

### Changes
- `npm create vite@latest .`
- Removed Vite example code
    - Kept the counter there
    - Kept the CSS files but empty
- Icon
    - Saved the icon file in `./public`
    - Referred in `index.html`
- Changed page title in `index.html`

### Test
- `npm run dev`
    - Counter working
    - Icon not working
- `npm run build` then run by VSCode live server
    - Icon working

## Deployment

### Changes
- Added `base: "./"` in `vite.config.js`
- Added `.github` actions

### Minor Changes
- Changed directory and file name of dev log
- Formatter uses 4 spaces in all edited files

## Install Packages
- `npm install @mui/material @emotion/react @emotion/styled`
    - For some common components, such as:
        - Menu bar
        - Buttons
- `npm install vite-plugin-singlefile --save-dev`
    - For single-file release
- `npm install flexlayout-react`
    - For tab management
- `npm install react-ace ace-builds`
    - Editor
- `npm install @rjsf/core @rjsf/utils @rjsf/validator-ajv8 --save`
    - JSON form, for settings
    - `npm install tslib`
    - `npm install @rjsf/mui`
- `npm install react-complex-tree`
    - For file tree

## Single-File Build Config

### Reason
- Single-file build is portable and can help with distribution
- However, there are some functions that are not supported in the single HTML file version
    - Popup window in FlexLayout (requires server)
    - Some file system APIs (require HTTPS)

### Changes
- Added a `build-config.json`
    - Not a single field just in case more fields are added in the future
    - Not a command line for `vite.config.js` because it's easier to access from JSX
- Read this config from:
    - `vite.config.js`
    - `App.jsx`
- `./release` directory for holding the single HTML file build

### Usage
- In `build-config.json`:
    - Change the `single-file` to `true` and build to get the release file(s)
    - Change the `single-file` to `false` and commit to GitHub
        - Otherwise, the GitHub action could fail as no `./dist` folder will be created.

## Base Layout

### Changes
- Used Flexbox to divide the screen into three pieces:
    - Header: size depends on content (`flex-grow: 0`)
    - Tail: size depends on content (`flex-grow: 0`)
    - Body: grows to fill the rest of the screen (`flex-grow: 1`)
- Used a unique background color
- Used `overflow: hidden` to disable scrolling

### Minor Changes
- Not committing the `release` folder

## Fitting FlexLayout into `ide-body`

### Note
- Needs to have `position: relative` in `light.css` to fit the layout within the parent instead of the body.

## Device Detection

### Changes
- `npm install react-device-detect --save`
    - For device detection
    - ref https://github.com/duskload/react-device-detect/blob/master/docs/selectors.md
- `npm install react-router-dom --save`
    - For redirecting to an error page
    - Not used; didn't figure it out
- Used an error component for information display
- Used `if` switch in `App.jsx` as a switch


## Menu Mock

### Changes
- Used MUI menu example
    - Mock data for now
- Used a disabled button as the title
    - Colored using MUI color

## Menu Component

### Changes
- Made the menu item a separate component
    - With parameters `label` and `options`
    - Example:
        ```jsx
        <Menu
            label="Open"
            options={[
                {
                    text: "Settings",
                    handler: () => {
                        console.log("clicked on Settings");
                    },
                },
                {
                    text: "Folder View",
                    handler: () => {
                        console.log("clicked on Folder View");
                    },
                },
            ]}
        />
        ```

### Minor Changes
- Set Vite to avoid copying the `./public` folder when building a single file.

## Switch to `gh-pages`

### Changes
- Removed GitHub Actions as it fails randomly
- Installed `npm install gh-pages`

## Git Submodule
- added Wiki
- add file system
    - `git submodule add https://github.com/urfdvw/useFileSystem.git`
    
## TODOs before alpha

1. ~~Editor tab name conflicting~~
1. ~~Command shortcut~~
1. ~~Close ide confirmation~~
1. Plot
    1. ~~popup~~ not considered any more
    1. ~~dynamic size~~
    1. ~~bug: graph updating wrong when data flow in fast~~ not a bug
1. ~~Serial Command history~~
1. ~~Editor serial shortcut~~
1. ~~Editor tab edited indicator~~
1. ~~Close tab confirmation~~

## remove random component key
- if use random component key,
    - the component will be recreated every time there is a refresh.

## about editor serial shortcut
- removed the feature drag command from console,
    - didn't actually ever used
    - can achieve the same goal by undo
- editor serial commands are not going to show up n raw console,
    - not very clean
    - can achieve the same goal by undo
