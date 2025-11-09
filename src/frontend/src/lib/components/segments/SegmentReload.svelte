<script lang="ts">
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';

	interface Props {
		reloadVersion: () => Promise<void>;
	}

	let { reloadVersion }: Props = $props();

	const reload = async () => {
		await reloadVersion();

		toasts.show({ text: $i18n.canisters.reload_initiated, level: 'info', duration: 2000 });
	};
</script>

<button class="menu" onclick={reload}><IconRefresh /> {$i18n.core.reload}</button>
