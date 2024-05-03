<script lang="ts">
	import LaunchpadButton from '$lib/components/launchpad/LaunchpadButton.svelte';
	import { emit } from '$lib/utils/events.utils';
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { busy } from '$lib/stores/busy.store';
	import { authStore } from '$lib/stores/auth.store';
	import { getCreateSatelliteFeeBalance } from '$lib/services/wizard.services';

	export let row = false;

	const createSatellite = async () => {
		busy.start();

		const { result, error } = await getCreateSatelliteFeeBalance({
			identity: $authStore.identity,
			missionControlId: $missionControlStore
		});

		busy.stop();

		if (nonNullish(error) || isNullish(result)) {
			return;
		}

		emit({ message: 'junoModal', detail: { type: 'create_satellite', detail: result } });
	};
</script>

<LaunchpadButton on:click={createSatellite} primary {row}>
	<div class="new" class:row>
		<IconNew size={row ? '20px' : '48px'} />

		<p>{$i18n.satellites.launch}</p>
	</div>
</LaunchpadButton>

<style lang="scss">
	@use '../../styles/mixins/fonts';

	.new {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		gap: var(--padding-4x);

		height: 100%;

		color: var(--color-primary);
	}

	p {
		@include fonts.bold(true);

		color: var(--color-primary);
		max-width: 150px;
		text-align: center;

		margin: 0;
	}

	.row {
		flex-direction: row;
		justify-content: flex-start;
		height: auto;

		gap: var(--padding-3x);

		p {
			max-width: 100%;
		}
	}
</style>
