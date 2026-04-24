<script lang="ts">
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import LaunchpadButton from '$lib/components/modules/launchpad/LaunchpadButton.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/factory/factory.create.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authIdentity,
			missionControlId: $missionControlId
		});
	};

	let row = $derived($layoutLaunchpad === LaunchpadLayout.LIST);
</script>

<LaunchpadButton onclick={createSatellite} {row} testId={testIds.launchpad.launch}>
	<div class="new" class:row>
		<IconRocket size={row ? '24px' : '48px'} />

		<p>{$i18n.satellites.launch_first}</p>
	</div>
</LaunchpadButton>

<style lang="scss">
	@use '../../../styles/mixins/fonts';

	.new {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		gap: var(--padding-4x);

		height: 100%;

		&.row {
			justify-content: flex-end;
			flex-direction: row;
			gap: var(--padding-3x);
		}

		&:not(.row) {
			p {
				max-width: 150px;
				text-align: center;
			}
		}
	}

	p {
		@include fonts.bold(true);

		margin: 0;
	}
</style>
