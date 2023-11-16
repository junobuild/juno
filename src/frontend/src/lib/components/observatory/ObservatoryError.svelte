<script lang="ts">
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let err: string;

	onMount(() => console.error(err));
</script>

<span><IconWarning /> {$i18n.observatory.error_collecting_data}</span>
