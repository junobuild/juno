import { IDL } from '@dfinity/candid';
import type { DocContext, DocUpsert, RawUserId } from '@junobuild/functions';
import { call, id } from '@junobuild/functions/ic-cdk';
import { encodeDocData, setDocStore } from '@junobuild/functions/sdk';

export const callAndSaveVersion = async ({
	caller,
	doc: { collection, key, data }
}: {
	caller: RawUserId;
	doc: DocContext<DocUpsert>;
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
			version: data.after.version,
			data: encodeDocData(version)
		}
	});
};
