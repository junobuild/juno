<script lang="ts">
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import LaunchpadButton from '$lib/components/launchpad/LaunchpadButton.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
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

<LaunchpadButton onclick={createSatellite} testId={testIds.createSatellite.launch}>
	<div class="new">
		<IconNew size="48px" />

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
	}

	p {
		@include fonts.bold(true);

		max-width: 150px;
		text-align: center;

		margin: 0;
	}
</style>
