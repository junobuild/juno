<script lang="ts">
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<button class="primary" onclick={createSatellite} {...testId(testIds.createSatellite.launch)}>
	{$i18n.satellites.launch}
	<IconRocket />
</button>

<style lang="scss">
	button {
		display: flex;
		flex-direction: column;
		gap: var(--padding-2x);

		aspect-ratio: 1/1;

		max-width: 160px;
		max-height: 160px;

		padding: var(--padding);

		border-radius: 50%;

		box-shadow: 3px 3px var(--color-card-contrast);

		animation: push ease-in 750ms 2 forwards;

		&:active {
			box-shadow: none;
			transform: translateX(3px) translateY(3px);
		}
	}

	/* -global- */
	@keyframes -global-push {
		0% {
			box-shadow: 3px 3px var(--color-card-contrast);
			transform: none;
		}

		50% {
			box-shadow: none;
			transform: translateX(3px) translateY(3px);
		}

		100% {
			box-shadow: 3px 3px var(--color-card-contrast);
			transform: none;
		}
	}
</style>
