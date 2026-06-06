import { defineQuery } from '@junobuild/functions';
import { j } from '@junobuild/schema';

// Assertion which would make the npm run build:test-sputnik fail

const ItemSchema = j.strictObject({ inviteCode: j.string() });

export const getItem = defineQuery({
	result: j.strictObject({ item: ItemSchema.optional() }),
	handler: () => ({ item: { inviteCode: 'ABC123' } })
});

export const listItems = defineQuery({
	result: j.strictObject({ items: j.array(ItemSchema) }),
	handler: () => ({ items: [{ inviteCode: 'ABC123' }] })
});
