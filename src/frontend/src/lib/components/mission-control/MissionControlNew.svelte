<script lang="ts">
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { initOrbiterWizard } from '$lib/services/wizard.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';

	const createMissionControl = async () => {
		await initOrbiterWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlId
		});
	};
</script>

<button onclick={createMissionControl}>{$i18n.core.get_started}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
