import { jsonReviver } from '@dfinity/utils';
import type { ExcludeDate } from '@junobuild/core';

export const fileToDocData = async (file: File): Promise<ExcludeDate<unknown>> => {
	const reader = new FileReader();

	await new Promise((resolve, reject) => {
		reader.onload = resolve;
		reader.onerror = reject;
		reader.readAsText(file);
	});

	const dataURL = reader?.result as string;

	return JSON.parse(dataURL, jsonReviver);
};
