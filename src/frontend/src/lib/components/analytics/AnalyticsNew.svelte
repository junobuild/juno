<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import { getCreateOrbiterFeeBalance } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { emit } from '$lib/utils/events.utils';

	const createOrbiter = async () => {
		busy.start();

		const { result, error } = await getCreateOrbiterFeeBalance({
			identity: $authStore.identity,
			missionControlId: $missionControlStore
		});

		busy.stop();

		if (nonNullish(error) || isNullish(result)) {
			return;
		}

		emit({ message: 'junoModal', detail: { type: 'create_orbiter', detail: result } });
	};
</script>

<button on:click={createOrbiter}>{$i18n.analytics.get_started}</button>
