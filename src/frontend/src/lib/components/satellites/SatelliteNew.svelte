<script lang="ts">
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import LaunchpadButton from '$lib/components/launchpad/LaunchpadButton.svelte';
	import Test from '$lib/components/ui/Test.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		row?: boolean;
	}

	let { row = false }: Props = $props();

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<LaunchpadButton onclick={createSatellite} primary {row}>
	<div class="new" class:row>
		<Test testId={testIds.createSatellite.launch}>
			<IconNew size={row ? '20px' : '48px'} />

			<p>{$i18n.satellites.launch}</p>
		</Test>
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
