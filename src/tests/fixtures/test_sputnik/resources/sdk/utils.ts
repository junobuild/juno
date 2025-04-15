import type {ListParams, OnSetDocContext} from "@junobuild/functions";

export const listParams = ({ caller }: Pick<OnSetDocContext, 'caller'>): ListParams => ({
    matcher: {
        key: 'key-match',
        description: 'desc-match'
    },
    owner: caller,
    order: {
        desc: true,
        field: 'created_at'
    },
    paginate: {
        start_after: undefined,
        limit: 10n
    }
});