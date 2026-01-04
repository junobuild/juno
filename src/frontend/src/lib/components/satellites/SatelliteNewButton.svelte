<script lang="ts">
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/factory/factory.create.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authIdentity,
			missionControlId: $missionControlId
		});
	};
</script>

<button class="primary" onclick={createSatellite} {...testId(testIds.createSatellite.launch)}>
	<span>{$i18n.core.launch}&nbsp;</span>
	<IconRocket size="16px" />
</button>

<style lang="scss">
	button {
		height: 35px;
	}
</style>
