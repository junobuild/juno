import { jsonReviver } from '@dfinity/utils';

export const fileToDocData = async (file: File): Promise<unknown> => {
	const reader = new FileReader();

	await new Promise((resolve, reject) => {
		reader.onload = resolve;
		reader.onerror = reject;
		reader.readAsText(file);
	});

	const dataURL = reader?.result as string;

	return JSON.parse(dataURL, jsonReviver);
};
