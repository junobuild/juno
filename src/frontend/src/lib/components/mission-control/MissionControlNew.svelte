<script lang="ts">
	import { initMissionControlWizard } from '$lib/services/factory/factory-wizard.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';

	const createMissionControl = async () => {
		await initMissionControlWizard({
			identity: $authStore.identity
		});
	};
</script>

<button onclick={createMissionControl}>{$i18n.core.get_started}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
