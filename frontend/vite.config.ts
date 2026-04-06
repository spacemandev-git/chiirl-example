import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

export default defineConfig(({ mode }) => {
	// Load env from root dir and inject into process.env so $env/dynamic/private works
	const env = loadEnv(mode, rootDir, '');
	for (const [key, value] of Object.entries(env)) {
		if (!process.env[key]) {
			process.env[key] = value;
		}
	}

	return {
		plugins: [sveltekit()],
		ssr: {
			noExternal: [],
			external: ['web-push'],
		},
	};
});
