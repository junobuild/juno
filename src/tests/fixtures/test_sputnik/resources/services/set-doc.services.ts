import type { Doc } from '$declarations/satellite/satellite.did';
import { IDL } from '@dfinity/candid';
import { arrayOfNumberToUint8Array, assertNonNullish, fromNullable } from '@dfinity/utils';
import type { Collection, Key, RawUserId } from '@junobuild/functions';
import { call, id } from '@junobuild/functions/ic-cdk';
import { decodeDocData, encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import {
	mockSputnikVersionCollection,
	mockSputnikVersionKey
} from '../../../../mocks/sputnik.mocks';

const Doc = IDL.Record({
	updated_at: IDL.Nat64,
	owner: IDL.Principal,
	data: IDL.Vec(IDL.Nat8),
	description: IDL.Opt(IDL.Text),
	created_at: IDL.Nat64,
	version: IDL.Opt(IDL.Nat64)
});

export const callAndSaveVersion = async ({
	caller,
	collection,
	key
}: {
	caller: RawUserId;
	collection: Collection;
	key: Key;
}) => {
	const result = await call<[] | [Doc]>({
		canisterId: id(),
		method: 'get_doc',
		args: [
			[IDL.Text, mockSputnikVersionCollection],
			[IDL.Text, mockSputnikVersionKey]
		],
		result: IDL.Opt(Doc)
	});

	const doc = fromNullable(result);

	assertNonNullish(doc, 'No document for the version could be fetched.');

	const version = decodeDocData(
		doc.data instanceof Uint8Array ? doc.data : arrayOfNumberToUint8Array(doc.data)
	);

	setDocStore({
		caller,
		collection,
		key: `${key}_version`,
		doc: {
			data: encodeDocData(version)
		}
	});
};
