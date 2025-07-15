import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

export const defineViteReplacements = (): {
	VITE_APP_VERSION: string;
} => {
	const file = fileURLToPath(new URL('package.json', import.meta.url));
	const json = readFileSync(file, 'utf8');
	const { version } = JSON.parse(json);

	return {
		VITE_APP_VERSION: JSON.stringify(version)
	};
};
