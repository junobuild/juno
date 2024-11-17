<script lang="ts">
	import { onMount } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		err: string;
	}

	let { err }: Props = $props();

	onMount(() => console.error(err));
</script>

<span><IconWarning /> {$i18n.observatory.error_collecting_data}</span>
