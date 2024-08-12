# @warp-ds/esbuild-plugin

Used along with [@warp-ds/elements-core](https://github.com/warp-ds/warp-element) this ESBuild plugin lets you get a minimal set of UnoCSS utility CSS classes for your `WarpElement.styles` property.

## Usage

```sh
npm install @warp-ds/esbuild-plugin
```

```js
// build.js
import * as glob from "glob";
import * as esbuild from "esbuild";
import * as eik from "@eik/esbuild-plugin";
import warpPlugin from "@warp-ds/esbuild-plugin";

const useWatch = (process.argv[2] && process.argv[2] === "watch") || false;

/**
 * @type {import("esbuild").BuildOptions}
 */
const clientBuildOptions = {
	entryPoints: ["./src/client/client.js"],
	format: "esm",
	logLevel: "info", // Adjust this if you get problems
	bundle: true,
	platform: "browser",
	sourcemap: true,
	plugins: [
		eik.plugin(), // Enables the use of Eik import maps
		warpPlugin(), // Ensures WARP gets added to components
	],
	minify: true,
	target: ["es2022"],
	outfile: "./public/${{ values.name }}.js",
};

const files = glob.sync("./src/**/*.js");

/**
 * @type {import("esbuild").BuildOptions}
 */
const serverBuildOptions = {
	entryPoints: files,
	outdir: "./build",
	format: "esm",
	logLevel: "info", // Adjust this if you get problems
	bundle: false,
	platform: "node",
	sourcemap: true,
	plugins: [
		warpPlugin(), // Ensures WARP gets added to server-side rendered components
	],
	minify: false,
	target: ["es2022"],
};

// Build or watch
if (useWatch) {
	const ctxClient = await esbuild.context(clientBuildOptions);
	const ctxServer = await esbuild.context(serverBuildOptions);
	await Promise.all([ctxClient.watch(), ctxServer.watch()]);
} else {
	await Promise.all([esbuild.build(clientBuildOptions), esbuild.build(serverBuildOptions)]);
}
```

```js
// Component.js
export class HelloWorld extends WarpElement {
	static styles = [
		css`
			@warp-css;
		`,
		WarpElement.styles,
	];

	render() {
		return html`
			<p class="text-xl p-32 m-16">
				Hello, World!
			</p>
		`;
	}
}

if (!customElements.get("hello-world")) {
	customElements.define("hello-world", HelloWorld);
}
```
