import { defineConfig } from 'vitest/config';

// The room and protocol modules are deliberately free of Workers runtime
// imports, so they test under plain Node with no workers pool needed.
export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		environment: 'node'
	}
});
