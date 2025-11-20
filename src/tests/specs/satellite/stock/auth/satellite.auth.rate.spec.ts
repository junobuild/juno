import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { testAuthRate } from '../../../../utils/auth-assertions-rate-tests.utils';
import { setupSatelliteAuth } from '../../../../utils/auth-tests.utils';

describe('Satellite > Auth > Rate', () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;

	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			controller: c
		} = await setupSatelliteAuth();

		pic = p;
		satelliteActor = actor;

		controller = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const config = async ({
		max_tokens,
		time_per_token_ns
	}: {
		max_tokens: bigint;
		time_per_token_ns: bigint;
	}) => {
		satelliteActor.setIdentity(controller);

		const { get_rule, set_rule } = satelliteActor;

		const collectionType = { Db: null };
		const collection = '#user';

		const result = await get_rule(collectionType, collection);

		const rule = fromNullable(result);

		assertNonNullish(rule);

		await set_rule(collectionType, collection, {
			...rule,
			rate_config: [
				{
					max_tokens,
					time_per_token_ns
				}
			]
		});
	};

	testAuthRate({
		pic: () => pic,
		actor: () => satelliteActor,
		config
	});
});
