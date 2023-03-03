export interface ListResults<T> {
	items: T[];
	length: bigint;
	matches_length: bigint;
}

export type ListOrderField = 'keys' | 'updated_at' | 'created_at';

export interface ListOrder {
	desc: boolean;
	field: ListOrderField;
}

export interface ListParams {
	startAfter?: string;
	order: ListOrder;
}
