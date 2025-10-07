<script lang="ts">
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { initOrbiterWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';

	const createOrbiter = async () => {
		await initOrbiterWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<button onclick={createOrbiter} data-testid="btn-launch-analytics">{$i18n.core.get_started}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
