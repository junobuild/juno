<script lang="ts">
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<button class="primary" onclick={createSatellite}>
	{$i18n.satellites.launch}
	<IconRocket />
</button>

<style lang="scss">
	button {
		display: flex;
		flex-direction: column;
		gap: var(--padding-2x);

		aspect-ratio: 1/1;

		max-width: 180px;
		max-height: 180px;

		padding: var(--padding-4x);

		border-radius: 50%;

		box-shadow: 4px 4px var(--color-card-contrast);

		&:active {
			box-shadow: none;
			transform: translateX(4px) translateY(4px);
		}
	}
</style>
