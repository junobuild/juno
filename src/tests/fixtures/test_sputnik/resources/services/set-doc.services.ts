import { IDL } from '@dfinity/candid';
import type { Collection, Key, RawUserId } from '@junobuild/functions';
import { call, id } from '@junobuild/functions/ic-cdk';
import { encodeDocData, setDocStore } from '@junobuild/functions/sdk';

export const callAndSaveVersion = async ({
	caller,
	collection,
	key
}: {
	caller: RawUserId;
	collection: Collection;
	key: Key;
}) => {
	const version = await call<bigint>({
		canisterId: id(),
		method: 'version',
		result: IDL.Text
	});

	setDocStore({
		caller,
		collection,
		key: `${key}_version`,
		doc: {
			data: encodeDocData(version)
		}
	});
};
