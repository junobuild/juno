export const downloadWasm = async ({ downloadUrl }: { downloadUrl: string }): Promise<Blob> => {
	const response: Response = await fetch(downloadUrl);

	return await response.blob();
};
