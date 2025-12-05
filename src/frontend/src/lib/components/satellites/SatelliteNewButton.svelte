<script lang="ts">
	import { testIds } from '$lib/constants/test-ids.constants';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/wizard.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';
	import { testId } from '$lib/utils/test.utils';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlId
		});
	};
</script>

<button class="primary" onclick={createSatellite} {...testId(testIds.createSatellite.launch)}>
	{$i18n.satellites.launch}
</button>

<style lang="scss">
	button {
		height: 35px;
	}
</style>
