import { canisterStatus } from '$lib/api/ic.api';
import type { AccessKeyUi } from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { UfoId } from '$lib/types/ufo';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const listUfoControllers = async ({
	ufoId,
	identity
}: {
	ufoId: UfoId;
	identity: NullishIdentity;
}): Promise<[Principal, AccessKeyUi][]> => {
	assertNonNullish(identity);

	const {
		settings: { controllers }
	} = await canisterStatus({
		canisterId: ufoId.toText(),
		identity
	});

	return controllers.map((controllerId) => [
		controllerId,
		{
			kind: toNullable(),
			metadata: toNullable(),
			scope: { Admin: null }
		}
	]);
};
