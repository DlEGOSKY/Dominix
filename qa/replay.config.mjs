import base from '../vite.config.ts';
// Unmodified application under React development StrictMode. Keep its optimizer
// cache separate from the other live QA server on Windows.
export default { ...base, cacheDir: 'node_modules/.vite-replay' };
