import { lstatSync, readdirSync } from 'fs';
import { extname, join } from 'path';

const findFiles = ({ dir, files }) => {
	readdirSync(dir).forEach((file) => {
		const fullPath = join(dir, file);
		if (lstatSync(fullPath).isDirectory()) {
			findFiles({ dir: fullPath, files });
		} else {
			files.push(fullPath);
		}
	});
};

export const findHtmlFiles = (dir = join(process.cwd(), 'build')) => {
	const files = [];
	findFiles({ dir, files });

	return files.filter((entry) => ['.html'].includes(extname(entry)));
};
