import type {OnSetDocContext} from "@junobuild/functions";
import { IDL } from "@dfinity/candid";
import {call, id} from "@junobuild/functions/ic-cdk";
import type {ListResults_1} from "$declarations/satellite/satellite.did";

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
    paginate: [{
        start_after: [],
        limit: [BigInt(10)]
    }],
}

export const onSetIcCdkCall = async (_context: OnSetDocContext) => {
    const result = await call<ListResults_1>({
        canisterId: id(),
        method: "list_docs",
        args: {
            types: [IDL.Text, ListParams],
            values: ["demo", params]
        },
        results: {
            types: [ListResults_1_Type]
        }
    });

    console.log("List docs:", result);
}