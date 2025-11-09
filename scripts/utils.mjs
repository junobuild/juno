import { hasArgs } from '@junobuild/cli-tools';

export const targetMainnet = () => {
	const args = process.argv.slice(2);
	return hasArgs({ args, options: ['--mainnet'] });
};

export const isHeadless = () => {
	const args = process.argv.slice(2);
	return hasArgs({ args, options: ['--headless'] });
};
