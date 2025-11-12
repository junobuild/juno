import { idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
import { mockCertificateDate, mockClientId } from '../../mocks/jwt.mocks';
import { makeMockGoogleOpenIdJwt } from '../../utils/jwt-tests.utils';
import {
	assertGetCertificate,
	assertOpenIdHttpsOutcalls
} from '../../utils/observatory-openid-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > OpenId > Refresh', async () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	const { jwks: mockJwks } = await makeMockGoogleOpenIdJwt({
		clientId: mockClientId,
		date: mockCertificateDate
	});

	const loadCertificate = async () => {
		const { start_openid_monitoring, stop_openid_monitoring } = actor;

		await start_openid_monitoring();

		await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks });

		// We do not need to always fetch a new certificate for this suite
		// We are interested in the guards
		await stop_openid_monitoring();
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(mockCertificateDate.getTime());

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await loadCertificate();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should provide certificate', async () => {
		await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
	});

	it('should reject request', async () => {
		await pic.advanceTime(20_000); // 20s -> Retry allowed after 30 sec
		await tick(pic);

		const { get_openid_certificate } = actor;

		await expect(
			get_openid_certificate({
				provider: { Google: null }
			})
		).rejects.toThrow('OpenID scheduler for Google already running');
	});
});
