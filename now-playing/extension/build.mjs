import { build, context } from 'esbuild';
import { cp, rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const outdir = path.join(root, 'dist');
const watch = process.argv.includes('--watch');

const shared = {
	outdir,
	bundle: true,
	target: 'chrome116',
	sourcemap: watch ? 'inline' : false,
	minify: !watch,
	logLevel: 'info'
};

/**
 * Content scripts must be IIFE, never ESM.
 *
 * Chrome injects content scripts as *classic* scripts, so a top-level `export`
 * is a SyntaxError and the whole file silently fails to run — which looks
 * exactly like "the extension connects but never reports a track". esbuild
 * emits that export whenever an entry point has one, so this is easy to
 * reintroduce by accident. Keep these two entries here and keep their modules
 * export-free.
 */
const contentScripts = {
	...shared,
	format: 'iife',
	entryPoints: {
		content: path.join(root, 'src/content.ts'),
		youtubeMusic: path.join(root, 'src/youtubeMusic.ts')
	}
};

/**
 * These two are genuine modules: the service worker is declared
 * `"type": "module"` in the manifest, and options.html loads its script with
 * `type="module"`.
 */
const modules = {
	...shared,
	format: 'esm',
	entryPoints: {
		background: path.join(root, 'src/background.ts'),
		options: path.join(root, 'src/options.ts')
	}
};

async function copyStatic() {
	await cp(path.join(root, 'public'), outdir, { recursive: true });
}

/**
 * Fails the build if a content script came out as ESM.
 *
 * Chrome injects content scripts as classic scripts, so a top-level `import`
 * or `export` is a SyntaxError — the file silently never runs, and the symptom
 * (extension connects, no track ever appears) points nowhere near the build
 * config. Adding an `export` to one of these modules is an easy accident, so
 * the build checks rather than trusting.
 */
async function assertClassicScripts() {
	const { readFile } = await import('node:fs/promises');
	const vm = await import('node:vm');

	for (const name of Object.keys(contentScripts.entryPoints)) {
		const file = path.join(outdir, `${name}.js`);
		const source = await readFile(file, 'utf8');
		try {
			// Compile, do not run. `new vm.Script` uses classic-script parsing —
			// the same rules Chrome applies to a content script — so a top-level
			// import/export throws here exactly as it would in the browser.
			// Pattern-matching the output does not work: the bundle is minified
			// onto one line, so `;export{...}` has no line start to anchor to.
			new vm.Script(source, { filename: file });
		} catch (err) {
			throw new Error(
				`${name}.js is not a valid classic script (${err.message}). ` +
					`Content scripts cannot be ESM — remove the export from src/${name}.ts, ` +
					`or move that entry out of contentScripts in build.mjs.`
			);
		}
	}
}

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

if (watch) {
	const copyPlugin = {
		name: 'copy-static',
		setup(b) {
			b.onEnd(async () => {
				await copyStatic();
				// Surface the mistake immediately in watch mode too, without
				// tearing the watcher down.
				try {
					await assertClassicScripts();
				} catch (err) {
					console.error(`
  ${err.message}
`);
				}
			});
		}
	};
	const ctxA = await context({ ...contentScripts, plugins: [copyPlugin] });
	const ctxB = await context({ ...modules, plugins: [copyPlugin] });
	await Promise.all([ctxA.watch(), ctxB.watch()]);
	console.log(`\nwatching — load unpacked from: ${outdir}\n`);
} else {
	await Promise.all([build(contentScripts), build(modules)]);
	await assertClassicScripts();
	await copyStatic();
	console.log(`\nbuilt — load unpacked from: ${outdir}\n`);
}
