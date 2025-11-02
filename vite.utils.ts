import { assertNonNullish, notEmptyString } from '@dfinity/utils';
import type {
	JunoConfigEnv,
	JunoConsoleConfig,
	JunoConsoleConfigFnOrObject
} from '@junobuild/config';
import { readConsoleConfig as readConsoleConfigTools } from '@junobuild/config-loader';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const JUNO_CONFIG_FILENAME = 'juno.config';

const readConsoleConfig = async (env: JunoConfigEnv): Promise<JunoConsoleConfig> => {
	const config = (userConfig: JunoConsoleConfigFnOrObject): JunoConsoleConfig =>
		typeof userConfig === 'function' ? userConfig(env) : userConfig;

	return await readConsoleConfigTools({
		filename: JUNO_CONFIG_FILENAME,
		config
	});
};

const defineJunoEnv = async ({
	mode
}: JunoConfigEnv): Promise<Omit<ViteReplacements, 'VITE_APP_VERSION'>> => {
	const { id, ids, authentication } = await readConsoleConfig({ mode });

	const consoleId = id ?? ids[mode];

	assertNonNullish(consoleId, 'Console ID not defined.');

	const googleClientId = authentication?.google?.clientId;

	return {
		VITE_CONSOLE_ID: JSON.stringify(consoleId),
		VITE_GOOGLE_CLIENT_ID: notEmptyString(googleClientId)
			? JSON.stringify(googleClientId)
			: undefined
	};
};

const defineAppVersion = (): Pick<ViteReplacements, 'VITE_APP_VERSION'> => {
	const file = fileURLToPath(new URL('package.json', import.meta.url));
	const json = readFileSync(file, 'utf8');
	const { version } = JSON.parse(json);

	return {
		VITE_APP_VERSION: JSON.stringify(version)
	};
};

interface ViteReplacements {
	VITE_CONSOLE_ID: string;
	VITE_GOOGLE_CLIENT_ID: string | undefined;
	VITE_APP_VERSION: string;
}

export const defineViteReplacements = async (env: JunoConfigEnv) => {
	const prefix = `import.meta.env`;

	const replacements = {
		...defineAppVersion(),
		...(await defineJunoEnv(env))
	};

	return Object.entries(replacements).reduce(
		(acc, [key, value]) => ({
			...acc,
			[`${prefix}.${key}`]: value
		}),
		{}
	);
};
