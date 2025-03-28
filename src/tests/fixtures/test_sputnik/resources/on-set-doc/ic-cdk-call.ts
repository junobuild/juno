import type { ListResults_1 } from '$declarations/satellite/satellite.did';
import { IDL } from '@dfinity/candid';
import { fromNullable } from '@dfinity/utils';
import type { OnSetDocContext } from '@junobuild/functions';
import { call, id } from '@junobuild/functions/ic-cdk';
import { encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import { callAndSaveVersion } from '../services/set-doc.services';

// Calling a function with records.
const ListOrderField = IDL.Variant({
	UpdatedAt: IDL.Null,
	Keys: IDL.Null,
	CreatedAt: IDL.Null
});
const ListOrder = IDL.Record({ field: ListOrderField, desc: IDL.Bool });
const TimestampMatcher = IDL.Variant({
	Equal: IDL.Nat64,
	Between: IDL.Tuple(IDL.Nat64, IDL.Nat64),
	GreaterThan: IDL.Nat64,
	LessThan: IDL.Nat64
});
const ListMatcher = IDL.Record({
	key: IDL.Opt(IDL.Text),
	updated_at: IDL.Opt(TimestampMatcher),
	description: IDL.Opt(IDL.Text),
	created_at: IDL.Opt(TimestampMatcher)
});
const ListPaginate = IDL.Record({
	start_after: IDL.Opt(IDL.Text),
	limit: IDL.Opt(IDL.Nat64)
});
const ListParams = IDL.Record({
	order: IDL.Opt(ListOrder),
	owner: IDL.Opt(IDL.Principal),
	matcher: IDL.Opt(ListMatcher),
	paginate: IDL.Opt(ListPaginate)
});

const Doc = IDL.Record({
	updated_at: IDL.Nat64,
	owner: IDL.Principal,
	data: IDL.Vec(IDL.Nat8),
	description: IDL.Opt(IDL.Text),
	created_at: IDL.Nat64,
	version: IDL.Opt(IDL.Nat64)
});

const ListResults_1_Type = IDL.Record({
	matches_pages: IDL.Opt(IDL.Nat64),
	matches_length: IDL.Nat64,
	items_page: IDL.Opt(IDL.Nat64),
	items: IDL.Vec(IDL.Tuple(IDL.Text, Doc)),
	items_length: IDL.Nat64
});

const params = {
	order: [],
	owner: [],
	matcher: [],
	paginate: [
		{
			start_after: [],
			limit: [BigInt(10)]
		}
	]
};

const callRecord = async ({ caller, data: { collection, key, data } }: OnSetDocContext) => {
	const result = await call<ListResults_1>({
		canisterId: id(),
		method: 'list_docs',
		args: [
			[IDL.Text, 'demo'],
			[ListParams, params]
		],
		result: ListResults_1_Type
	});

	setDocStore({
		caller,
		collection,
		key,
		doc: {
			version: data.after.version,
			data: encodeDocData({
				items_length: result.items_length,
				items_page: fromNullable(result.items_page),
				matches_length: result.matches_length
			})
		}
	});
};

const callBigInt = async ({ caller, data: { collection, key, data } }: OnSetDocContext) => {
	const count = await call<bigint>({
		canisterId: id(),
		method: 'count_collection_docs',
		args: [[IDL.Text, 'demo']],
		result: IDL.Nat64
	});

	setDocStore({
		caller,
		collection,
		key: `${key}_count_docs`,
		doc: {
			version: data.after.version,
			data: encodeDocData(count)
		}
	});
};

const callStringNoArgs = async ({ caller, data: { collection, key } }: OnSetDocContext) => {
	await callAndSaveVersion({
		caller,
		collection,
		key
	});
};

export const testIcCdkCall = async (context: OnSetDocContext) => {
	await Promise.all([callRecord(context), callBigInt(context), callStringNoArgs(context)]);
};
