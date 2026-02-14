<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import { emit } from '$lib/utils/events.utils';

	const createAutomation = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'create_automation'
			}
		});
	};
</script>

<button onclick={createAutomation}>{$i18n.core.configure}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
