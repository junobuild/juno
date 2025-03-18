import type { OnSetDocContext } from '@junobuild/functions';
import { decodeDocData, encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import type { SputnikTestTextEncodingData } from '../../../mocks/sputnik.mocks';

// TODO: why not both
// eslint-disable-next-line require-await
export const onTestTextEncoding = async ({
	caller,
	data: { collection, key, data }
}: OnSetDocContext) => {
	const sourceData = decodeDocData<SputnikTestTextEncodingData>(data.after.data);

	const decoder = new TextDecoder();
	const decodedValue = decoder.decode(sourceData.input.decode.value);

	const encoder = new TextEncoder();
	const encodedValue = encoder.encode(sourceData.input.encode.value);

	const testInputIsNotArrayBuffer = (): boolean => {
		try {
			// @ts-expect-error we want to test it throws an expected error
			decoder.decode('string');
			return false;
		} catch (_e: unknown) {
			return true;
		}
	};

	const testLabelNotSupported = (): boolean => {
		try {
			// Only utf-8 is supported
			new TextDecoder('ascii');
			return false;
		} catch (_e: unknown) {
			return true;
		}
	};

	const testEncodeIntoNotSupported = (): boolean => {
		try {
			const encoder = new TextEncoder();
			encoder.encodeInto('Hello', new Uint8Array(5));
			return false;
		} catch (_e: unknown) {
			return true;
		}
	};

	const updatedData = encodeDocData<SputnikTestTextEncodingData>({
		...sourceData,
		output: {
			decoded: {
				value: decodedValue,
				inputIsNotArrayBuffer: testInputIsNotArrayBuffer(),
				labelNotSupported: testLabelNotSupported()
			},
			encoded: {
				value: encodedValue,
				encodeIntoNotSupported: testEncodeIntoNotSupported()
			}
		}
	});

	setDocStore({
		caller,
		collection,
		doc: {
			key,
			version: data.after.version,
			data: updatedData
		}
	});
};
