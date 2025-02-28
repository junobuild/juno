import type { _SERVICE as SatelliteActor, SetRule } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import {
	arrayOfNumberToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable,
	uint8ArrayToArrayOfNumber
} from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { controllersInitArgs, SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
	'Satellite > Datastore > Data',
	({ memory }) => {
		let pic: PocketIc;
		let actor: Actor<SatelliteActor>;

		const controller = Ed25519KeyIdentity.generate();

		beforeAll(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const { actor: c } = await pic.setupCanister<SatelliteActor>({
				idlFactory: idlFactorSatellite,
				wasm: SATELLITE_WASM_PATH,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;

			actor.setIdentity(controller);
		});

		afterAll(async () => {
			await pic?.tearDown();
		});

		describe('Serializer/deserializer', () => {
			const user = Ed25519KeyIdentity.generate();

			const setRule: SetRule = {
				memory: toNullable(memory),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				version: toNullable(),
				max_capacity: toNullable(),
				rate_config: toNullable(),
				max_changes_per_user: toNullable()
			};

			const collection = `test_data_${'Heap' in memory ? 'heap' : 'stable'}`;

			const data = {
				// date: nowInBigIntNanoSeconds(),
				myBigInt: 666777888n,
				principal: user.getPrincipal(),
				array: arrayOfNumberToUint8Array([4, 5, 6, 7, 8, 9]),
				myString: 'hello',
				myNumber: 123
			};

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Db: null }, collection, setRule);
			});

			it('should serialize data for types not supported by the JS APIs', async () => {
				// TODO
				// const mockDateNow = 1698416400000;
				// vi.spyOn(Date, 'now').mockReturnValue(mockDateNow);

				const serializedData = await toArray(data);

				const key = nanoid();

				const { set_doc, get_doc } = actor;

				await set_doc(collection, key, {
					data: serializedData,
					description: toNullable(),
					version: toNullable()
				});

				const result = await get_doc(collection, key);

				const doc = fromNullable(result);

				assertNonNullish(doc);

				// We explicitly want to assert that the data are saved / serialized in a certain way so we read the raw data
				const blob = new Blob(
					[doc.data instanceof Uint8Array ? doc.data : new Uint8Array(doc.data)],
					{
						type: 'application/json; charset=utf-8'
					}
				);

				const savedData = JSON.parse(await blob.text());

				expect(savedData).toEqual({
					myBigInt: { __bigint__: `${data.myBigInt}` },
					principal: {
						__principal__: data.principal.toText()
					},
					array: {
						__uint8array__: uint8ArrayToArrayOfNumber(data.array)
					},
					myString: data.myString,
					myNumber: data.myNumber
				});
			});

			it('should deserialize data for types not supported by the JS APIs', async () => {
				// TODO
				// const mockDateNow = 1698416400000;
				// vi.spyOn(Date, 'now').mockReturnValue(mockDateNow);

				const serializedData = await toArray(data);

				const key = nanoid();

				const { set_doc, get_doc } = actor;

				await set_doc(collection, key, {
					data: serializedData,
					description: toNullable(),
					version: toNullable()
				});

				const result = await get_doc(collection, key);

				const doc = fromNullable(result);

				assertNonNullish(doc);

				const savedData: typeof data = await fromArray(doc.data);

				expect(typeof savedData.myBigInt).toEqual('bigint');
				expect(savedData.myBigInt).toEqual(data.myBigInt);

				expect(savedData.principal).toBeInstanceOf(Principal);
				expect(savedData.principal.toText()).toEqual(data.principal.toText());

				expect(savedData.array).toBeInstanceOf(Uint8Array);
				expect(savedData.array).toEqual(data.array);

				expect(savedData.myString).toEqual(data.myString);
				expect(savedData.myNumber).toEqual(data.myNumber);
			});
		});
	}
);
