<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { initSatelliteWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<button class="primary" onclick={createSatellite}>
	{$i18n.satellites.launch}
</button>

<style lang="scss">
	button {
		height: 35px;
	}
</style>
