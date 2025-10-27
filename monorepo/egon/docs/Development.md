# Development

## NX

- **Build all**: `npx nx run-many --target build --all --prod`
- **Single project build**: `npx nx run <project-name>:build`
- **Start dev server**: `yarn nx run egon-modeler-webview:serve` (after building diagram-js-egon-plugin once)

## The Visual Studio Code Extension (VSCE)

This tool assists in packaging and publishing Visual Studio Code extensions.  
Read the [Documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)on the VS Code website.

```shell
vsce package --out egon-io.vsix --yarn --no-dependencies
```

## Tips & Tricks

### Debugging with WebStorm

1. Run `yarn nx run egon-modeler-webview:serve`
2. Use the pre-configured debug configuration in [.run](../.run)
3. Add a breakpoint in the code you want to debug (e.g. in [egon-modeler-webview](../apps/vscode/egon-modeler-webview/src) or [diagram-js-egon-plugin](../libs/diagram-js-egon-plugin/src))
4. Run the debug configuration
