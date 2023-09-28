const CSV_PICKER_OPTIONS: FilePickerAcceptType = {
	description: 'CSV file',
	accept: {
		'text/csv': ['.csv']
	}
};

export const saveToCSVFile = ({ blob, filename }: { blob: Blob; filename: string }) => {
	if ('showSaveFilePicker' in window) {
		return exportNativeFileSystem({ blob, filename });
	}

	return download({ blob, filename });
};

const exportNativeFileSystem = async ({ blob, filename }: { blob: Blob; filename: string }) => {
	const fileHandle: FileSystemFileHandle = await getNewFileHandle({
		filename,
		types: [CSV_PICKER_OPTIONS]
	});

	if (fileHandle === undefined || fileHandle === null) {
		throw new Error('Cannot access filesystem');
	}

	await writeFile({ fileHandle, blob });
};

const getNewFileHandle = ({
	filename,
	types
}: {
	filename: string;
	types: FilePickerAcceptType[];
}): Promise<FileSystemFileHandle> => {
	const opts: SaveFilePickerOptions = {
		suggestedName: filename,
		types
	};

	return showSaveFilePicker(opts);
};

const writeFile = async ({
	fileHandle,
	blob
}: {
	fileHandle: FileSystemFileHandle;
	blob: Blob;
}) => {
	const writer: FileSystemWritableFileStream = await fileHandle.createWritable();
	await writer.write(blob);
	await writer.close();
};

const download = ({ filename, blob }: { filename: string; blob: Blob }) => {
	const a: HTMLAnchorElement = document.createElement('a');
	a.style.display = 'none';
	document.body.appendChild(a);

	const url = window.URL.createObjectURL(blob);

	a.href = url;
	a.download = filename;

	a.click();

	window.URL.revokeObjectURL(url);
	a.parentElement?.removeChild(a);
};
