import type { ConsoleActor } from '$declarations';
import type { SetSegmentMetadataArgs } from '$declarations/console/console.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { createSatelliteWithConsole } from '../../utils/console-factory-tests.utils';
import { setupConsole } from '../../utils/console-tests.utils';

describe('Console > Segments', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	let user: Identity;
	let segmentId: Principal;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO
		} = await setupConsole({
			withApplyRateTokens: true,
			withLedger: true,
			withSegments: true,
			withFee: true
		});

		pic = p;

		actor = c;

		user = Ed25519KeyIdentity.generate();
		actor.setIdentity(user);

		const { get_or_init_account } = actor;
		await get_or_init_account();

		segmentId = await createSatelliteWithConsole({ user, actor });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('List', () => {
		describe('Errors', () => {
			const assertNoAccountGuard = async () => {
				const { list_segments } = actor;

				await expect(
					list_segments({
						segment_type: [],
						segment_id: []
					})
				).rejects.toThrowError('User does not have an account.');
			};

			it('should not list segments if anonymous', async () => {
				actor.setIdentity(new AnonymousIdentity());
				await assertNoAccountGuard();
			});

			it('should not list segments with some identity', async () => {
				actor.setIdentity(Ed25519KeyIdentity.generate());
				await assertNoAccountGuard();
			});
		});

		describe('User', () => {
			beforeAll(() => {
				actor.setIdentity(user);
			});

			it('should list segments if user has an account', async () => {
				const { list_segments } = actor;

				const segments = await list_segments({
					segment_type: [],
					segment_id: []
				});

				expect(segments).toHaveLength(1);
			});
		});
	});

	describe('Set metadata', () => {
		const metadata: [string, string][] = [
			['name', 'hello'],
			['env', 'staging']
		];

		describe('Errors', () => {
			const assertNoAccountGuard = async () => {
				const { set_segment_metadata } = actor;

				await expect(
					set_segment_metadata({
						segment_id: segmentId,
						segment_type: { Satellite: null },
						metadata
					})
				).rejects.toThrowError('User does not have an account.');
			};

			const assertUnknownSegment = async (params: Omit<SetSegmentMetadataArgs, 'metadata'>) => {
				const { set_segment_metadata } = actor;

				await expect(
					set_segment_metadata({
						...params,
						metadata
					})
				).rejects.toThrowError('Segment not found.');
			};

			it('should not set segment if anonymous', async () => {
				actor.setIdentity(new AnonymousIdentity());
				await assertNoAccountGuard();
			});

			it('should not set segment for some identity', async () => {
				actor.setIdentity(Ed25519KeyIdentity.generate());
				await assertNoAccountGuard();
			});

			it('should not set unknown segment id', async () => {
				actor.setIdentity(user);
				await assertUnknownSegment({
					segment_id: mockMissionControlId,
					segment_type: { Satellite: null }
				});
			});

			it('should not set unknown segment type', async () => {
				actor.setIdentity(user);
				await assertUnknownSegment({
					segment_id: segmentId,
					segment_type: { Orbiter: null }
				});
			});
		});

		describe('User', () => {
			beforeAll(() => {
				actor.setIdentity(user);
			});

			const assertSetSegmentMetadata = async (metadata: [string, string][]) => {
				const { set_segment_metadata, list_segments } = actor;

				const [[_, currentSegment]] = await list_segments({
					segment_type: [{ Satellite: null }],
					segment_id: [segmentId]
				});

				const updatedSegment = await set_segment_metadata({
					segment_id: segmentId,
					segment_type: { Satellite: null },
					metadata
				});

				expect(updatedSegment.segment_id.toText()).toEqual(segmentId.toText());
				expect(updatedSegment.created_at).toEqual(currentSegment.created_at);
				expect(updatedSegment.updated_at > currentSegment.updated_at).toBeTruthy();
				expect(updatedSegment.metadata).toEqual(metadata);
			};

			it('should set segment metadata if user has an account', async () => {
				await assertSetSegmentMetadata(metadata);
			});

			it('should set segment metadata again', async () => {
				await assertSetSegmentMetadata([['hello', 'world']]);
			});
		});
	});
});
