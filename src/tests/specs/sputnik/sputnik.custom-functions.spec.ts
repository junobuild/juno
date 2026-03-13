import type {
	AppAsyncQueryArgs,
	AppAsyncQueryResult,
	AppWelcomeArgs,
	AppWelcomeResult,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { mockPrincipal } from '../../../frontend/tests/mocks/identity.mock';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-tests.utils';

describe('Sputnik > Custom Functions', () => {
	let pic: PocketIc;
	let actor: Actor<TestSputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-custom-update-query';
	const TEST_COLLECTION_ENUM = 'test-notes';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, TEST_COLLECTION_ENUM, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should call a custom function', async () => {
		const { app_hello_world } = actor;

		const args: AppAsyncQueryArgs = {
			value: mockPrincipal
		};

		await expect(app_hello_world(args)).resolves.not.toThrowError();
	});

	it('should get a result from a custom function', async () => {
		const { app_hello_world } = actor;

		const args: AppAsyncQueryArgs = {
			value: mockPrincipal
		};

		const result: AppAsyncQueryResult = await app_hello_world(args);

		expect(result.text).toEqual('Welcome');
		expect(result.value.toText()).toEqual(mockPrincipal.toText());
		expect(Principal.isPrincipal(result.value)).toBeTruthy();
	});

	it('should handle async calls', async () => {
		const { app_welcome } = actor;

		const args: AppWelcomeArgs = {
			value: 'yolo'
		};

		const result: AppWelcomeResult = await app_welcome(args);

		expect(result.value).toEqual(123n);
		expect(result.caller.toText()).toEqual(canisterId.toText());
	});

	it('should handle calls without args', async () => {
		const { app_welcome_without_args } = actor;

		const result: AppWelcomeResult = await app_welcome_without_args();

		expect(result.value).toEqual(123n);
		expect(result.caller.toText()).toEqual(canisterId.toText());
	});

	it('should handle calls to void', async () => {
		const { app_yolo } = actor;

		await expect(app_yolo()).resolves.not.toThrowError();

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const msg = logs.find(([_, { message }]) => message.includes('No args, no result, no problem'));

		expect(msg).not.toBeUndefined();
	});

	it('should handle a sync update', async () => {
		const { app_sync_update } = actor;

		await expect(app_sync_update()).resolves.not.toThrowError();

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const msg = logs.find(([_, { message }]) =>
			message.includes('Sync update, no args, no result')
		);

		expect(msg).not.toBeUndefined();
	});

	it('should handle a query with no args', async () => {
		const { app_query_no_args } = actor;

		const result: AppAsyncQueryResult = await app_query_no_args();

		expect(result.text).toEqual('No args');
		expect(Principal.isPrincipal(result.value)).toBeTruthy();
	});

	it('should handle a query with no args and no result', async () => {
		const { app_query_no_args_no_result } = actor;

		await expect(app_query_no_args_no_result()).resolves.not.toThrowError();
	});

	it('should handle an async query', async () => {
		const { app_async_query } = actor;

		const args: AppAsyncQueryArgs = {
			value: mockPrincipal
		};

		const result: AppAsyncQueryResult = await app_async_query(args);

		expect(result.text).toEqual('Async');
		expect(result.value.toText()).toEqual(mockPrincipal.toText());
		expect(Principal.isPrincipal(result.value)).toBeTruthy();
	});

	it('should handle an update with args only', async () => {
		const { app_update_args_only } = actor;

		const args: AppWelcomeArgs = {
			value: 'yolo'
		};

		await expect(app_update_args_only(args)).resolves.not.toThrowError();

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const msg = logs.find(([_, { message }]) => message.includes('Update args only'));

		expect(msg).not.toBeUndefined();
	});

	it('should persist state changes', async () => {
		const { app_set_doc_test, app_read_doc_test } = actor;

		const key = 'test-key';
		const collection = TEST_COLLECTION;
		const value = 5n;

		await app_set_doc_test({ key, collection, value });

		const result = await app_read_doc_test({ key, collection });

		expect(result.value).toEqual(value + 2n);
	});

	it('should accept args with an optional principal', async () => {
		const { app_demo_antonio } = actor;

		const result = await app_demo_antonio({
			id: toNullable(mockPrincipal),
			sub: {
				arr: Uint8Array.from([1, 2, 3, 55])
			}
		});

		expect(result.world).toEqual(`${mockPrincipal.toText()} - ${canisterId.toText()}`);
		expect(fromNullable(result.id)?.toText()).toEqual(canisterId.toText());
		expect(fromNullable(result.sub.value)).toEqual(123n);
		expect(fromNullable(result.sub.arr)).toEqual(Uint8Array.from([5, 6, 7]));
	});

	it('should support building complex enum', async () => {
		const { app_check_enums } = actor;

		const result = await app_check_enums({
			username: 'Hello',
			status: {
				active: {
					owner: mockPrincipal
				}
			}
		});

		expect(result.status).toEqual('ok');
	});

	it('should support simple variant echo', async () => {
		const { app_check_simple_variant } = actor;

		for (const value of [{ active: null }, { inactive: null }, { pending: null }] as const) {
			const result = await app_check_simple_variant({ value });
			expect(result.value).toEqual(value);
		}
	});

	it('should support discriminated union echo', async () => {
		const { app_check_discriminated_union_echo } = actor;

		const active = await app_check_discriminated_union_echo({
			status: { active: { owner: mockPrincipal } }
		});
		expect(active.status).toEqual({ active: { owner: mockPrincipal } });

		const inactive = await app_check_discriminated_union_echo({
			status: { inactive: null }
		});
		expect(inactive.status).toEqual({ inactive: null });

		const pending = await app_check_discriminated_union_echo({
			status: { pending: { assignee: mockPrincipal } }
		});
		expect(pending.status).toEqual({ pending: { assignee: mockPrincipal } });
	});

	it('should support variant records echo', async () => {
		const { app_check_variant_records } = actor;

		const r1 = await app_check_variant_records({
			data: { Variant0: { count: 42, label: 'hello' } }
		});
		expect(r1.data).toEqual({ Variant0: { count: 42, label: 'hello' } });

		const r2 = await app_check_variant_records({ data: { Variant1: { value: 3.14 } } });
		expect(r2.data).toEqual({ Variant1: { value: 3.14 } });
	});

	it('should support discriminated union with primitive fields', async () => {
		const { app_check_discriminated_primitives } = actor;

		const r1 = await app_check_discriminated_primitives({ data: { text: { value: 'hello' } } });
		expect(r1.data).toEqual({ text: { value: 'hello' } });

		const r2 = await app_check_discriminated_primitives({ data: { number: { value: 42.5 } } });
		expect(r2.data).toEqual({ number: { value: 42.5 } });

		const r3 = await app_check_discriminated_primitives({ data: { flag: { value: true } } });
		expect(r3.data).toEqual({ flag: { value: true } });
	});

	it('should support nested discriminated union', async () => {
		const { app_check_nested_discriminated } = actor;

		const result = await app_check_nested_discriminated({
			id: 'abc123',
			status: { active: { owner: mockPrincipal } }
		});
		expect(result).toEqual({ id: 'abc123', status: { active: { owner: mockPrincipal } } });
	});

	it('should support variant records with opt and vec fields', async () => {
		const { app_check_variant_records_opt_vec } = actor;

		const r1 = await app_check_variant_records_opt_vec({
			data: { Variant0: { tags: ['a', 'b'], note: ['hello'] } }
		});
		expect(r1.data).toEqual({ Variant0: { tags: ['a', 'b'], note: ['hello'] } });

		const r2 = await app_check_variant_records_opt_vec({
			data: { Variant0: { tags: ['x'], note: [] } }
		});
		expect(r2.data).toEqual({ Variant0: { tags: ['x'], note: [] } });

		const r3 = await app_check_variant_records_opt_vec({
			data: { Variant1: { count: 5, active: true } }
		});
		expect(r3.data).toEqual({ Variant1: { count: 5, active: true } });
	});
});
