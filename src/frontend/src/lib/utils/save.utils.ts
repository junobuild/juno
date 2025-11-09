export const CSV_PICKER_OPTIONS: FilePickerAcceptType = {
	description: 'CSV file',
	accept: {
		'text/csv': ['.csv']
	}
};

export const JSON_PICKER_OPTIONS: FilePickerAcceptType = {
	description: 'JSON file',
	accept: {
		'application/json': ['.json']
	}
};

export const ZIP_PICKER_OPTIONS: FilePickerAcceptType = {
	description: 'Zip file',
	accept: {
		'application/zip': ['.zip']
	}
};

export const filenameTimestamp = (): string => new Date().toJSON().split('.')[0].replace(/:/g, '-');

export const saveToFileSystem = ({
	type,
	...rest
}: {
	blob: Blob;
	filename: string;
	type: FilePickerAcceptType;
}) => {
	if ('showSaveFilePicker' in window) {
		return exportNativeFileSystem({ ...rest, type });
	}

	return download(rest);
};

const exportNativeFileSystem = async ({
	blob,
	filename,
	type
}: {
	blob: Blob;
	filename: string;
	type: FilePickerAcceptType;
}) => {
	try {
		const fileHandle: FileSystemFileHandle = await getNewFileHandle({
			filename,
			types: [type]
		});

		if (fileHandle === undefined || fileHandle === null) {
			throw new Error('Cannot access filesystem');
		}

		await writeFile({ fileHandle, blob });
	} catch (err: unknown) {
		if (
			typeof err === 'object' &&
			(err as { message: string })?.message?.includes('The user aborted a request')
		) {
			// We do not display an error if user just clicked "Cancel".
			return;
		}

		throw err;
	}
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

export const download = ({ filename, blob }: { filename: string; blob: Blob }) => {
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
